import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Send, Lock, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import TalkEndScreen from "./TalkEndScreen";

interface ChatMsg {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface TalkChatProps {
  chatId: string;
  userId: string;
  onNewChat: () => void;
}

const TalkChat = ({ chatId, userId, onNewChat }: TalkChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [chatData, setChatData] = useState<{ topic: string; expires_at: string; user_a: string; user_b: string } | null>(null);
  const [partnerLabs, setPartnerLabs] = useState("");
  const [holdingExtend, setHoldingExtend] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstSpeaker = chatData?.user_a || null;
  const isFirstSpeaker = firstSpeaker === userId;
  const hasFirstMessage = messages.length > 0;
  const canType = isFirstSpeaker || hasFirstMessage;
  const chatEnded = timeLeft === "Chat ended";
  const showExtendButton = secondsLeft !== null && secondsLeft <= 30 && secondsLeft > 0;

  // Load chat data
  useEffect(() => {
    const loadChat = async () => {
      const [{ data: chatRes }, { data: msgsRes }] = await Promise.all([
        supabase.from("chats").select("*").eq("id", chatId).single(),
        supabase.from("messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true }),
      ]);
      if (chatRes) {
        setChatData({ topic: chatRes.topic, expires_at: chatRes.expires_at, user_a: chatRes.user_a, user_b: chatRes.user_b });
        const partnerId = chatRes.user_a === userId ? chatRes.user_b : chatRes.user_a;
        (supabase.from("user_profiles" as any).select("labs_id").eq("id", partnerId).single() as any)
          .then(({ data: p }: any) => { if (p) setPartnerLabs(p.labs_id); });
      }
      if (msgsRes) setMessages(msgsRes as ChatMsg[]);
    };
    loadChat();

    const sub = supabase
      .channel(`chat-${chatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as ChatMsg])
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [chatId, userId]);

  // Timer
  useEffect(() => {
    if (!chatData?.expires_at) return;
    const update = () => {
      const diff = new Date(chatData.expires_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Chat ended");
        setSecondsLeft(0);
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      setSecondsLeft(totalSec);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
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

  const handleSend = useCallback(async () => {
    const trimmed = newMsg.trim();
    if (!trimmed || sending || chatEnded || !canType) return;
    setSending(true);
    await supabase.from("messages").insert({ chat_id: chatId, sender_id: userId, message: trimmed });
    setNewMsg("");
    setSending(false);
  }, [newMsg, sending, chatId, userId, chatEnded, canType]);

  // Hold to extend
  const startHold = () => {
    setHoldingExtend(true);
    setHoldProgress(0);
    let prog = 0;
    holdTimerRef.current = setInterval(() => {
      prog += 5;
      setHoldProgress(prog);
      if (prog >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        handleExtend();
      }
    }, 100); // 2 seconds total hold
  };

  const stopHold = () => {
    setHoldingExtend(false);
    setHoldProgress(0);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
  };

  const handleExtend = async () => {
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabase.from("chats").update({ expires_at: newExpiry }).eq("id", chatId);
    setChatData((prev) => prev ? { ...prev, expires_at: newExpiry } : prev);
    setHoldingExtend(false);
    setHoldProgress(0);
    toast({ title: "Chat extended by 10 minutes! ⏳" });
  };

  if (chatEnded) {
    return <TalkEndScreen chatId={chatId} onNewChat={onNewChat} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <span className="text-sm font-mono font-medium text-primary">{partnerLabs}</span>
              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                {chatData?.topic}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowReport(!showReport)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Flag className="h-4 w-4" />
            </button>
            <span className={`flex items-center gap-1 text-xs font-mono font-medium ${
              (secondsLeft ?? 999) <= 60 ? "text-destructive animate-pulse" : "text-primary"
            }`}>
              <Clock className="h-3.5 w-3.5" />
              {timeLeft}
            </span>
          </div>
        </div>
        {/* Topic banner */}
        {chatData?.topic && (
          <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-1.5">
            <p className="text-xs text-muted-foreground">
              Topic: <span className="text-foreground font-medium">"{chatData.topic}"</span>
            </p>
          </div>
        )}
      </header>

      {/* Report inline warning */}
      {showReport && (
        <div className="mx-4 mt-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-2">
          <p className="text-xs text-destructive font-medium">Report this conversation?</p>
          <div className="flex gap-2">
            {["Harassment", "Spam", "Threats"].map((r) => (
              <button
                key={r}
                onClick={async () => {
                  toast({ title: "Report submitted. Thank you." });
                  setShowReport(false);
                }}
                className="text-[10px] rounded-full bg-destructive/10 text-destructive px-2.5 py-1 hover:bg-destructive/20 transition-colors"
              >
                {r}
              </button>
            ))}
            <button onClick={() => setShowReport(false)} className="text-[10px] text-muted-foreground ml-auto">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-2">
            {isFirstSpeaker ? (
              <>
                <p className="text-xs text-primary font-medium">You've been chosen to start! 🎯</p>
                <p className="text-xs text-muted-foreground">Say hello and break the ice 👋</p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                <p className="text-xs">Waiting for your partner to start…</p>
              </div>
            )}
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Hold to extend */}
      {showExtendButton && (
        <div className="px-4 py-2 border-t border-border bg-background">
          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className="w-full relative overflow-hidden rounded-lg bg-primary/10 border border-primary/20 py-2 text-xs font-medium text-primary transition-all"
          >
            <div
              className="absolute inset-0 bg-primary/20 transition-all"
              style={{ width: `${holdProgress}%` }}
            />
            <span className="relative">
              {holdingExtend ? `Hold… ${Math.round(holdProgress)}%` : "Hold to Extend +10min ⏳"}
            </span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border bg-background px-4 py-3">
        {!canType ? (
          <div className="flex items-center justify-center gap-2 py-1 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="text-xs">Waiting for partner to send the first message…</span>
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

export default TalkChat;
