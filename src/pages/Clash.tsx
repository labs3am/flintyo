import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords, Clock, Send, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

const Clash = () => {
  const { flintId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [debate, setDebate] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<"pending" | "active" | "voting" | "finished">("pending");
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flintId || !user) return;
    initDebate();
  }, [flintId, user]);

  const initDebate = async () => {
    // Check for existing active/pending debate on this flint
    const { data: existing } = await supabase
      .from("debates")
      .select("*")
      .eq("flint_id", flintId!)
      .in("status", ["pending", "active"])
      .maybeSingle();

    if (existing) {
      setDebate(existing);
      setStage(existing.status as any);
      if (existing.status === "active" && existing.expires_at) {
        setTimeLeft(Math.max(0, Math.floor((new Date(existing.expires_at).getTime() - Date.now()) / 1000)));
      }
      await loadProfiles([existing.user_a, existing.user_b]);
    } else {
      // Get flint author
      const { data: flint } = await supabase.from("flints").select("author_id").eq("id", flintId!).single();
      if (!flint || flint.author_id === user!.id) {
        toast.error("Can't clash your own flint");
        navigate("/");
        return;
      }

      const { data: newDebate } = await supabase
        .from("debates")
        .insert({ flint_id: flintId!, user_a: user!.id, user_b: flint.author_id, status: "pending" })
        .select()
        .single();

      if (newDebate) {
        setDebate(newDebate);
        await loadProfiles([newDebate.user_a, newDebate.user_b]);

        // Auto-accept after 5s for demo (in production, would notify user_b)
        setTimeout(async () => {
          const expires = new Date(Date.now() + 3 * 60 * 1000).toISOString();
          await supabase.from("debates").update({ status: "active", expires_at: expires }).eq("id", newDebate.id);
          setDebate((d: any) => ({ ...d, status: "active", expires_at: expires }));
          setStage("active");
          setTimeLeft(180);
        }, 3000);
      }
    }
    setLoading(false);
  };

  const loadProfiles = async (ids: string[]) => {
    const { data } = await supabase.from("profiles").select("id, labs_id").in("id", ids.filter(Boolean));
    const map: Record<string, string> = {};
    data?.forEach((p: any) => { map[p.id] = p.labs_id; });
    setProfilesMap(map);
  };

  // Subscribe to debate messages
  useEffect(() => {
    if (!debate?.id || stage !== "active") return;

    const fetchMsgs = async () => {
      const { data } = await supabase
        .from("debate_messages")
        .select("*")
        .eq("debate_id", debate.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMsgs();

    const channel = supabase.channel(`debate-${debate.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "debate_messages", filter: `debate_id=eq.${debate.id}` }, () => fetchMsgs())
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [debate?.id, stage]);

  // Timer
  useEffect(() => {
    if (stage !== "active" || !debate?.expires_at) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(debate.expires_at).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff === 0) {
        setStage("voting");
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, debate?.expires_at]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!user || !debate || !newMessage.trim()) return;
    await supabase.from("debate_messages").insert({ debate_id: debate.id, sender_id: user.id, message: newMessage.trim() });
    setNewMessage("");
  };

  const castVote = async (votedFor: string) => {
    if (!user || !debate || hasVoted) return;
    await supabase.from("debate_votes").insert({ debate_id: debate.id, voter_id: user.id, voted_for: votedFor });
    setHasVoted(true);

    // Update counts
    const updates: Record<string, number> = {};
    if (votedFor === "user_a") updates.votes_a = (debate.votes_a || 0) + 1;
    else if (votedFor === "user_b") updates.votes_b = (debate.votes_b || 0) + 1;
    else updates.votes_draw = (debate.votes_draw || 0) + 1;
    await supabase.from("debates").update(updates).eq("id", debate.id);

    toast.success("Vote cast!");

    // Finish after voting (simplified)
    setTimeout(async () => {
      const { data: d } = await supabase.from("debates").select("*").eq("id", debate.id).single();
      if (d) {
        const winner = d.votes_a > d.votes_b ? d.user_a : d.votes_b > d.votes_a ? d.user_b : null;
        await supabase.from("debates").update({ status: "finished", winner }).eq("id", debate.id);
        if (winner) {
          await supabase.from("profiles").update({ points: 50 }).eq("id", winner); // simplified
        }
        setDebate({ ...d, status: "finished", winner });
        setStage("finished");
      }
    }, 5000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (stage === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <Swords className="text-primary animate-pulse" size={40} />
        <p className="text-foreground font-semibold">Challenge Sent!</p>
        <p className="text-muted-foreground text-sm text-center">Waiting for opponent to accept...</p>
        <Button variant="ghost" onClick={() => navigate("/")}>Cancel</Button>
      </div>
    );
  }

  if (stage === "voting") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <Trophy className="text-primary" size={40} />
        <h2 className="text-foreground text-lg font-bold">Time's up! Vote for the winner</h2>
        <div className="space-y-3 w-full max-w-sm">
          <Button onClick={() => castVote("user_a")} disabled={hasVoted} className="w-full" variant="outline">
            {profilesMap[debate?.user_a] || "User A"} wins
          </Button>
          <Button onClick={() => castVote("user_b")} disabled={hasVoted} className="w-full" variant="outline">
            {profilesMap[debate?.user_b] || "User B"} wins
          </Button>
          <Button onClick={() => castVote("draw")} disabled={hasVoted} className="w-full" variant="secondary">
            Draw
          </Button>
        </div>
        {hasVoted && <p className="text-muted-foreground text-sm">Vote cast! Results incoming...</p>}
      </div>
    );
  }

  if (stage === "finished") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <Trophy className="text-primary" size={40} />
        <h2 className="text-foreground text-lg font-bold">Clash Ended!</h2>
        {debate?.winner ? (
          <p className="text-muted-foreground">{profilesMap[debate.winner] || "Someone"} wins! +50 pts</p>
        ) : (
          <p className="text-muted-foreground">It's a draw!</p>
        )}
        <Button onClick={() => navigate("/")}>Back to Feed</Button>
      </div>
    );
  }

  // Active debate
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate("/")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2">
            <Swords className="text-primary" size={16} />
            <span className="text-sm font-bold text-foreground">LIVE CLASH</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-sm font-mono text-muted-foreground">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className="space-y-0.5 max-w-[75%]">
              <span className="text-[10px] text-muted-foreground font-mono">
                {profilesMap[m.sender_id] || "Unknown"}
              </span>
              <div className={`rounded-xl px-3 py-2 ${
                m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}>
                <p className="text-sm">{m.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <div className="border-t border-border px-4 py-2 bg-background">
        <div className="max-w-lg mx-auto flex gap-2">
          <Input
            placeholder="Make your argument..."
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

export default Clash;
