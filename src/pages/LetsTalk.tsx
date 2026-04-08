import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import { MessageCircle, Send, Loader2, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const moods = ["Need Advice", "Debate Me", "Deep Talk", "Random Chat", "Relationships", "Real World"];

const LetsTalk = () => {
  const { user } = useAuth();
  const [stage, setStage] = useState<"setup" | "searching" | "chat">("setup");
  const [mood, setMood] = useState("");
  const [topic, setTopic] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startSearch = async () => {
    if (!user || !mood || !topic.trim()) return;
    setStage("searching");

    // Check for waiting chat with similar mood
    const { data: waiting } = await supabase
      .from("chats")
      .select("*")
      .eq("status", "waiting")
      .eq("mood", mood)
      .neq("user_a", user.id)
      .limit(1)
      .maybeSingle();

    if (waiting) {
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from("chats").update({ user_b: user.id, status: "active", expires_at: expires }).eq("id", waiting.id);
      setChatId(waiting.id);
      setExpiresAt(expires);
      setStage("chat");
    } else {
      const { data: newChat } = await supabase
        .from("chats")
        .insert({ user_a: user.id, topic: topic.trim(), mood, status: "waiting" })
        .select()
        .single();

      if (newChat) {
        setChatId(newChat.id);
        // Subscribe to changes
        const channel = supabase.channel(`chat-wait-${newChat.id}`)
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chats", filter: `id=eq.${newChat.id}` }, (payload) => {
            if (payload.new.status === "active") {
              setExpiresAt(payload.new.expires_at);
              setStage("chat");
              channel.unsubscribe();
            }
          })
          .subscribe();
      }
    }
  };

  // Subscribe to messages
  useEffect(() => {
    if (!chatId || stage !== "chat") return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles(labs_id)")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase.channel(`chat-msgs-${chatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [chatId, stage]);

  // Timer
  useEffect(() => {
    if (!expiresAt || stage !== "chat") return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff === 0) {
        supabase.from("chats").update({ status: "ended" }).eq("id", chatId!);
        clearInterval(interval);
        toast.info("Chat ended");
        setStage("setup");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, stage]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!user || !chatId || !newMessage.trim()) return;
    await supabase.from("messages").insert({ chat_id: chatId, sender_id: user.id, message: newMessage.trim() });
    setNewMessage("");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (stage === "setup") {
    return (
      <div className="min-h-screen bg-background pb-16">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <MessageCircle className="text-primary" size={20} />
            <h1 className="text-lg font-bold text-foreground">Let's Talk</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">What's your mood?</p>
            <div className="grid grid-cols-2 gap-2">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                    mood === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">What's on your mind?</p>
            <Textarea
              placeholder="Enter a topic or question..."
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, 300))}
              className="bg-secondary border-border min-h-[80px] resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">{topic.length}/300</p>
          </div>

          <Button onClick={startSearch} className="w-full" disabled={!mood || !topic.trim()}>
            Find Someone to Talk To
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (stage === "searching") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-muted-foreground text-sm">Looking for someone...</p>
        <Button variant="ghost" onClick={() => setStage("setup")}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => setStage("setup")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-muted-foreground font-mono">{mood}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={14} />
            <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
              m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}>
              <p className="text-sm">{m.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <div className="border-t border-border px-4 py-2 bg-background">
        <div className="max-w-lg mx-auto flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="bg-secondary border-border"
          />
          <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LetsTalk;
