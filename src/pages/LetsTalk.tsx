import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Send, Clock, Loader2 } from "lucide-react";
import { completeDailyTask } from "@/lib/dailyTasks";

interface ChatMsg {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const LetsTalk = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [searching, setSearching] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [chatData, setChatData] = useState<{ topic: string; expires_at: string } | null>(null);
  const [partnerLabs, setPartnerLabs] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSearch = async () => {
    const trimmed = topic.trim();
    if (!trimmed || !user) return;

    setSearching(true);

    const { data, error } = await supabase.rpc("find_chat_match" as never, {
      p_user_id: user.id,
      p_topic: trimmed,
    } as never);

    if (error) {
      toast({ title: "Search failed", variant: "destructive" });
      setSearching(false);
      return;
    }

    if (data) {
      // Matched immediately
      setChatId(data as string);
      setSearching(false);
    } else {
      // In queue, poll for match
      toast({ title: "Looking for someone to talk to..." });
      pollRef.current = setInterval(async () => {
        const { data: chats } = await supabase
          .from("chats")
          .select("id")
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (chats && chats.length > 0) {
          setChatId(chats[0].id);
          setSearching(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 2000);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    await supabase.from("chat_queue").delete().eq("user_id", user.id);
    setSearching(false);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Load chat data
  useEffect(() => {
    if (!chatId || !user) return;

    const loadChat = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      if (data) {
        setChatData({ topic: data.topic, expires_at: data.expires_at });
        const partnerId = data.user_a === user.id ? data.user_b : data.user_a;
        const { data: partner } = await supabase
          .from("users")
          .select("labs_id")
          .eq("id", partnerId)
          .single();
        if (partner) setPartnerLabs(partner.labs_id);
      }
    };

    loadChat();

    // Load messages
    const loadMsgs = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as ChatMsg[]);
    };
    loadMsgs();

    // Realtime
    const sub = supabase
      .channel(`chat-${chatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as ChatMsg])
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [chatId, user]);

  // Timer
  useEffect(() => {
    if (!chatData?.expires_at) return;
    const update = () => {
      const diff = new Date(chatData.expires_at).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Chat ended"); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [chatData?.expires_at]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = newMsg.trim();
    if (!trimmed || sending || !chatId || !user) return;
    if (timeLeft === "Chat ended") {
      toast({ title: "This chat has ended", variant: "destructive" });
      return;
    }
    setSending(true);
    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      message: trimmed,
    });
    setNewMsg("");
    setSending(false);
  };

  const handleExtend = async () => {
    if (!chatId) return;
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabase.from("chats").update({ expires_at: newExpiry }).eq("id", chatId);
    setChatData((prev) => prev ? { ...prev, expires_at: newExpiry } : prev);
    toast({ title: "Chat extended by 10 minutes! ⏳" });
  };

  // Search / Queue screen
  if (!chatId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Let's Talk</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          {!searching ? (
            <>
              <MessageCircle className="h-16 w-16 text-primary/40" />
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Talk to a stranger</h2>
                <p className="text-sm text-muted-foreground">Enter a topic and get matched anonymously</p>
              </div>
              <div className="w-full max-w-xs space-y-3">
                <Input
                  placeholder="What's on your mind?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-card border-border"
                  maxLength={200}
                />
                <Button onClick={handleSearch} className="w-full font-semibold" disabled={!topic.trim()}>
                  Find someone 🔍
                </Button>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm text-foreground font-medium">Searching for someone...</p>
                <p className="text-xs text-muted-foreground">Topic: {topic}</p>
              </div>
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Chat screen
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-sm font-mono font-medium text-primary">{partnerLabs}</span>
              <p className="text-[10px] text-muted-foreground">{chatData?.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timeLeft && (
              <span className={`flex items-center gap-1 text-xs font-mono font-medium ${
                timeLeft === "Chat ended" ? "text-destructive" : "text-primary"
              }`}>
                <Clock className="h-3.5 w-3.5" />
                {timeLeft}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: "calc(100vh - 130px)" }}>
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">You're connected! Say hello 👋</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                isMine ? "bg-primary/15 text-foreground" : "bg-secondary text-foreground"
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background px-4 py-3">
        {timeLeft === "Chat ended" ? (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => navigate("/talk")}>
              New Chat
            </Button>
            <Button onClick={handleExtend}>Extend +10min</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="bg-card border-border"
              maxLength={500}
            />
            <Button size="icon" onClick={handleSend} disabled={sending || !newMsg.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetsTalk;
