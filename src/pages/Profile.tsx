import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FlintCard from "@/components/FlintCard";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, CheckCircle2, Circle } from "lucide-react";

const rankColors: Record<string, string> = {
  Lead: "text-rank-lead",
  Copper: "text-rank-copper",
  Cobalt: "text-rank-cobalt",
  Amethyst: "text-rank-amethyst",
};

const rankBg: Record<string, string> = {
  Lead: "bg-rank-lead/10",
  Copper: "bg-rank-copper/10",
  Cobalt: "bg-rank-cobalt/10",
  Amethyst: "bg-rank-amethyst/10",
};

const rankThresholds: Record<string, { min: number; max: number }> = {
  Lead: { min: 0, max: 500 },
  Copper: { min: 501, max: 2500 },
  Cobalt: { min: 2501, max: 10000 },
  Amethyst: { min: 10001, max: 50000 },
};

interface DailyTasks {
  posted: boolean;
  voted: boolean;
  commented: boolean;
  chatted: boolean;
  debated: boolean;
}

const Profile = () => {
  const { profile, signOut, refreshProfile, user } = useAuth();
  const [savedFlints, setSavedFlints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({
    posted: false, voted: false, commented: false, chatted: false, debated: false,
  });

  useEffect(() => {
    refreshProfile();
    fetchSavedFlints();
    fetchDailyTasks();
  }, []);

  const fetchSavedFlints = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("flints")
      .select("*, profiles(labs_id)")
      .eq("author_id", user.id)
      .eq("is_saved", true)
      .order("created_at", { ascending: false });
    if (data) setSavedFlints(data);
    setLoading(false);
  };

  const fetchDailyTasks = async () => {
    if (!user) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const ts = todayStart.toISOString();

    const [flints, votes, comments, chats, debates] = await Promise.all([
      supabase.from("flints").select("id").eq("author_id", user.id).gte("created_at", ts).limit(1),
      supabase.from("user_votes").select("id").eq("user_id", user.id).gte("created_at", ts).limit(1),
      supabase.from("comments").select("id").eq("user_id", user.id).gte("created_at", ts).limit(1),
      supabase.from("chats").select("id").or(`user_a.eq.${user.id},user_b.eq.${user.id}`).gte("created_at", ts).limit(1),
      supabase.from("debates").select("id").or(`user_a.eq.${user.id},user_b.eq.${user.id}`).gte("created_at", ts).limit(1),
    ]);

    setDailyTasks({
      posted: (flints.data?.length || 0) > 0,
      voted: (votes.data?.length || 0) > 0,
      commented: (comments.data?.length || 0) > 0,
      chatted: (chats.data?.length || 0) > 0,
      debated: (debates.data?.length || 0) > 0,
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rank = profile.rank || "Lead";
  const thresholds = rankThresholds[rank] || rankThresholds.Lead;
  const progress = rank === "Amethyst" ? 100 :
    ((profile.points - thresholds.min) / (thresholds.max - thresholds.min)) * 100;

  const completedTasks = Object.values(dailyTasks).filter(Boolean).length;
  const totalTasks = 5;

  const taskList = [
    { key: "posted", label: "Post a Flint", done: dailyTasks.posted },
    { key: "voted", label: "Vote on a Flint", done: dailyTasks.voted },
    { key: "commented", label: "Comment on a Flint", done: dailyTasks.commented },
    { key: "chatted", label: "Chat with someone", done: dailyTasks.chatted },
    { key: "debated", label: "Join a Clash", done: dailyTasks.debated },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Identity Card */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="text-center space-y-1">
            <h2 className={`text-xl font-bold font-mono ${rankColors[rank]}`}>{profile.labs_id}</h2>
            <div className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${rankColors[rank]} ${rankBg[rank]}`}>
              {rank}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-lg font-bold text-foreground">{profile.points}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Points</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-lg font-bold text-foreground">{profile.posts_count}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Posts</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-lg font-bold text-foreground">{profile.debates_won}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{rank} → {rank === "Lead" ? "Copper" : rank === "Copper" ? "Cobalt" : rank === "Cobalt" ? "Amethyst" : "Max"}</span>
              <span>{Math.min(100, Math.round(progress))}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Daily Tasks</h3>
            <span className="text-xs text-muted-foreground">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
          <div className="space-y-2 pt-1">
            {taskList.map((task) => (
              <div key={task.key} className="flex items-center gap-2">
                {task.done ? (
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                ) : (
                  <Circle size={14} className="text-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Flints */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Saved Flints</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>
          ) : savedFlints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No saved flints yet</p>
          ) : (
            savedFlints.map((f) => (
              <FlintCard
                key={f.id}
                id={f.id}
                authorLabsId={f.profiles?.labs_id || profile.labs_id}
                authorId={f.author_id}
                content={f.content}
                category={f.category}
                agreeCount={f.agree_count}
                disagreeCount={f.disagree_count}
                createdAt={f.created_at}
                expiresAt={f.expires_at}
                isSaved={f.is_saved}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
