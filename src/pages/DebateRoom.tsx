import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Swords, Clock, Trophy, Users } from "lucide-react";

interface DebateMsg {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface DebateData {
  id: string;
  flint_id: string;
  user_a: string;
  user_b: string;
  status: string;
  winner: string | null;
  ends_at: string | null;
  created_at: string;
}

const DebateRoom = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [debate, setDebate] = useState<DebateData | null>(null);
  const [messages, setMessages] = useState<DebateMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [labsIds, setLabsIds] = useState<Record<string, string>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCountA, setVoteCountA] = useState(0);
  const [voteCountB, setVoteCountB] = useState(0);
  const [voteDraw, setVoteDraw] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isParticipant = debate && user && (debate.user_a === user.id || debate.user_b === user.id);
  const isActive = debate?.status === "active";
  const isFinished = debate?.status === "finished";
  const isPending = debate?.status === "pending";

  // Fetch debate data
  useEffect(() => {
    if (!id) return;

    const fetchDebate = async () => {
      const { data } = await supabase
        .from("debates")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setDebate(data as DebateData);

        const userIds = [data.user_a, data.user_b].filter(Boolean);
        const { data: users } = await (supabase
          .from("user_profiles" as any)
          .select("id, labs_id")
          .in("id", userIds) as any);
        if (users) {
          setLabsIds(Object.fromEntries(users.map((u: { id: string; labs_id: string }) => [u.id, u.labs_id])));
        }
      }
    };

    fetchDebate();

    const debateSub = supabase
      .channel(`debate-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "debates", filter: `id=eq.${id}` },
        (payload) => {
          setDebate(payload.new as DebateData);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(debateSub); };
  }, [id]);

  // Track viewer count via presence
  useEffect(() => {
    if (!id || !user || !debate) return;

    const presenceChannel = supabase.channel(`debate-presence-${id}`, {
      config: { presence: { key: user.id } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const allUserIds = Object.keys(state);
        // Count users who are NOT participants
        const participants = [debate.user_a, debate.user_b];
        const viewers = allUserIds.filter((uid) => !participants.includes(uid));
        setViewerCount(viewers.length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ user_id: user.id });
        }
      });

    return () => { supabase.removeChannel(presenceChannel); };
  }, [id, user, debate?.user_a, debate?.user_b]);

  // Fetch messages + realtime
  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("debate_messages")
        .select("*")
        .eq("debate_id", id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as DebateMsg[]);
    };

    fetchMessages();

    const msgSub = supabase
      .channel(`debate-msgs-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "debate_messages", filter: `debate_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as DebateMsg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [id]);

  // Fetch votes + realtime
  useEffect(() => {
    if (!id || !user || !debate) return;

    const fetchVotes = async () => {
      const { data } = await supabase
        .from("debate_votes")
        .select("*")
        .eq("debate_id", id);

      if (data) {
        setVoteCountA(data.filter((v: { voted_for: string | null }) => v.voted_for === debate.user_a).length);
        setVoteCountB(data.filter((v: { voted_for: string | null }) => v.voted_for === debate.user_b).length);
        setVoteDraw(data.filter((v: { voted_for: string | null }) => v.voted_for === null).length);
        setHasVoted(data.some((v: { voter_id: string }) => v.voter_id === user.id));
      }
    };

    fetchVotes();

    const voteSub = supabase
      .channel(`debate-votes-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "debate_votes", filter: `debate_id=eq.${id}` },
        () => { fetchVotes(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(voteSub); };
  }, [id, debate?.user_a, debate?.user_b, user]);

  // Countdown timer
  useEffect(() => {
    if (!debate?.ends_at || !isActive) { setTimeLeft(""); return; }

    const update = () => {
      const diff = new Date(debate.ends_at!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Time's up!");
        supabase.rpc("resolve_debate", { p_debate_id: debate.id });
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [debate?.ends_at, isActive]);

  // Auto-expire pending clash after 30 seconds if not accepted
  useEffect(() => {
    if (!isPending || !debate) return;

    const pendingTimer = setTimeout(async () => {
      // Delete the pending debate
      await supabase.from("debates").delete().eq("id", debate.id);
      toast({ title: "Clash expired — no response in 30 seconds" });
      navigate("/");
    }, 30000);

    return () => clearTimeout(pendingTimer);
  }, [isPending, debate?.id, navigate, toast]);

  // Auto-redirect home after debate finishes (15s delay)
  useEffect(() => {
    if (isFinished) {
      redirectTimerRef.current = setTimeout(() => {
        navigate("/");
      }, 15000);
    }
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [isFinished, navigate]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAccept = async () => {
    if (!debate || !user) return;
    
    // Check viewer count - need at least 1 viewer
    if (viewerCount < 1) {
      toast({ title: "Need at least 1 viewer to start a clash!", variant: "destructive" });
      return;
    }
    
    const endsAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();
    await supabase
      .from("debates")
      .update({ status: "active", ends_at: endsAt })
      .eq("id", debate.id);
    toast({ title: "Debate started! ⚔️ You have 3 minutes." });
  };

  const handleReject = async () => {
    if (!debate) return;
    await supabase.from("debates").delete().eq("id", debate.id);
    toast({ title: "Challenge declined" });
    navigate("/");
  };

  const handleSendMsg = async () => {
    const trimmed = newMsg.trim();
    if (!trimmed || sending || !debate || !user) return;

    setSending(true);
    await supabase.from("debate_messages").insert({
      debate_id: debate.id,
      sender_id: user.id,
      message: trimmed,
    });
    setNewMsg("");
    setSending(false);
  };

  const handleVote = async (votedFor: string | null) => {
    if (!debate || !user || hasVoted || isParticipant) return;
    const { error } = await supabase.from("debate_votes").insert({
      debate_id: debate.id,
      voter_id: user.id,
      voted_for: votedFor,
    });
    if (error) {
      toast({ title: "Vote failed", variant: "destructive" });
    } else {
      setHasVoted(true);
      toast({ title: "Vote cast! 🗳️" });
      if (votedFor === debate.user_a) setVoteCountA((p) => p + 1);
      else if (votedFor === debate.user_b) setVoteCountB((p) => p + 1);
      else setVoteDraw((p) => p + 1);
    }
  };

  if (!debate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const labsA = labsIds[debate.user_a] || "LabsID_???";
  const labsB = labsIds[debate.user_b] || "LabsID_???";
  const totalVotes = voteCountA + voteCountB + voteDraw;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Clash</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{viewerCount} watching</span>
            </div>
            {isActive && timeLeft && (
              <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-sm">
                <Clock className="h-4 w-4" />
                {timeLeft}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Participants bar */}
      <div className="flex items-center justify-center gap-4 border-b border-border px-4 py-2.5 bg-card">
        <span className="text-xs font-mono font-medium text-primary">{labsA}</span>
        <span className="text-[10px] text-muted-foreground font-bold">VS</span>
        <span className="text-xs font-mono font-medium text-primary">{labsB}</span>
      </div>

      {/* Pending state - user_b accepts */}
      {isPending && debate.user_b === user?.id && (
        <div className="flex flex-col items-center gap-4 px-4 py-8">
          <Swords className="h-12 w-12 text-primary" />
          <p className="text-sm text-foreground text-center">
            <span className="font-mono text-primary">{labsA}</span> challenged you to a clash!
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Users className="h-3.5 w-3.5" />
            <span>{viewerCount} viewer{viewerCount !== 1 ? "s" : ""} watching</span>
          </div>
          {viewerCount < 1 && (
            <p className="text-xs text-destructive">Need at least 1 viewer to start!</p>
          )}
          <div className="flex gap-3">
            <Button onClick={handleAccept} className="font-semibold" disabled={viewerCount < 1}>Accept ⚔️</Button>
            <Button variant="secondary" onClick={handleReject}>Decline</Button>
          </div>
        </div>
      )}

      {isPending && debate.user_a === user?.id && (
        <div className="flex flex-col items-center gap-3 px-4 py-8">
          <Swords className="h-12 w-12 text-muted-foreground/30 animate-pulse-glow" />
          <p className="text-sm text-muted-foreground">Waiting for opponent to accept...</p>
          <p className="text-xs text-destructive">Auto-expires in 30 seconds if not accepted</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{viewerCount} viewer{viewerCount !== 1 ? "s" : ""} watching</span>
          </div>
        </div>
      )}

      {isPending && !isParticipant && (
        <div className="flex flex-col items-center gap-3 px-4 py-8">
          <p className="text-sm text-muted-foreground">Waiting for debate to start...</p>
        </div>
      )}

      {/* Finished state */}
      {isFinished && (
        <div className="flex flex-col items-center gap-4 px-4 py-8 border-b border-border bg-card">
          <Trophy className="h-14 w-14 text-yellow-500 animate-bounce" />
          {debate.winner ? (
            <>
              <p className="text-lg font-bold text-foreground">
                🏆 Winner: <span className="font-mono text-primary">{labsIds[debate.winner] || "LabsID_???"}</span>
              </p>
              <p className="text-sm text-muted-foreground">+50 points awarded!</p>
            </>
          ) : (
            <p className="text-lg font-bold text-muted-foreground">It's a draw! 🤝</p>
          )}
          <div className="flex gap-6 text-sm text-muted-foreground mt-2">
            <span className="flex flex-col items-center">
              <span className="font-mono text-primary text-xs">{labsA}</span>
              <span className="font-bold text-foreground text-lg">{voteCountA}</span>
              <span className="text-[10px]">votes</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="text-xs">Draw</span>
              <span className="font-bold text-foreground text-lg">{voteDraw}</span>
              <span className="text-[10px]">votes</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="font-mono text-primary text-xs">{labsB}</span>
              <span className="font-bold text-foreground text-lg">{voteCountB}</span>
              <span className="text-[10px]">votes</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Returning home in 15 seconds...</p>
          <Button size="sm" variant="secondary" onClick={() => navigate("/")} className="text-xs">
            Go Home Now
          </Button>
        </div>
      )}

      {/* Messages area */}
      {(isActive || isFinished) && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {messages.length === 0 && isActive && (
            <p className="text-center text-xs text-muted-foreground py-4">The debate has begun. Make your argument!</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const senderLabel = labsIds[msg.sender_id] || "LabsID_???";
            const isUserA = msg.sender_id === debate.user_a;
            return (
              <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-mono text-muted-foreground mb-0.5">{senderLabel}</span>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                  isUserA
                    ? "bg-primary/15 text-foreground"
                    : "bg-rank-cobalt/15 text-foreground"
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Audience voting (non-participants, active debate) */}
      {isActive && !isParticipant && !hasVoted && (
        <div className="border-t border-border px-4 py-3 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cast your vote:</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => handleVote(debate.user_a)}>
              {labsA}
            </Button>
            <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => handleVote(debate.user_b)}>
              {labsB}
            </Button>
            <Button size="sm" variant="secondary" className="text-xs" onClick={() => handleVote(null)}>
              Draw
            </Button>
          </div>
        </div>
      )}

      {isActive && !isParticipant && hasVoted && (
        <div className="border-t border-border px-4 py-3 bg-card">
          <p className="text-xs text-muted-foreground text-center">✅ You've voted ({totalVotes} total votes). Watching the debate...</p>
        </div>
      )}

      {/* Message input (participants only, active) */}
      {isActive && isParticipant && (
        <div className="sticky bottom-0 border-t border-border bg-background px-4 py-3">
          <div className="flex gap-2">
            <Input
              placeholder="Make your point..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMsg()}
              className="bg-card border-border text-sm"
              maxLength={500}
            />
            <Button size="icon" onClick={handleSendMsg} disabled={sending || !newMsg.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateRoom;
