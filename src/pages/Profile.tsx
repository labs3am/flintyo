import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Flame, MessageCircle, User, Plus, Trophy, FileText, Bookmark, LogOut, CheckCircle2, Circle, Zap, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAILY_TASKS, fetchTodayTasks, fetchTotalTaskPoints } from "@/lib/dailyTasks";
import { useTheme } from "@/hooks/useTheme";

interface UserProfile {
  labs_id: string;
  points: number;
  rank: string;
  country: string;
  interests: string[];
}

interface SavedFlint {
  id: string;
  content: string;
  category: string;
  agree_count: number;
  disagree_count: number;
  created_at: string;
}

const rankColors: Record<string, string> = {
  Lead: "text-rank-lead",
  Copper: "text-rank-copper",
  Cobalt: "text-rank-cobalt",
  Amethyst: "text-rank-amethyst",
  Gold: "text-rank-gold",
};

const rankBgColors: Record<string, string> = {
  Lead: "bg-rank-lead/10 border-rank-lead/20",
  Copper: "bg-rank-copper/10 border-rank-copper/20",
  Cobalt: "bg-rank-cobalt/10 border-rank-cobalt/20",
  Amethyst: "bg-rank-amethyst/10 border-rank-amethyst/20",
  Gold: "bg-rank-gold/10 border-rank-gold/20",
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [debateWins, setDebateWins] = useState(0);
  const [savedFlints, setSavedFlints] = useState<SavedFlint[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [totalTaskPoints, setTotalTaskPoints] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const [
        { data: profileData },
        { count: posts },
        { count: wins },
        { data: saved },
      ] = await Promise.all([
        supabase.from("users").select("labs_id, points, rank, country, interests").eq("id", user.id).single(),
        supabase.from("flints").select("id", { count: "exact", head: true }).eq("author_id", user.id),
        supabase.from("debates").select("id", { count: "exact", head: true }).eq("winner", user.id),
        supabase.from("flints").select("id, content, category, agree_count, disagree_count, created_at")
          .eq("author_id", user.id).eq("is_saved", true).order("created_at", { ascending: false }),
      ]);

      if (profileData) setProfile(profileData as unknown as UserProfile);
      setPostCount(posts || 0);
      setDebateWins(wins || 0);
      setSavedFlints((saved || []) as SavedFlint[]);
      setLoading(false);
    };

    const fetchDailyData = async () => {
      const [completed, totalPts] = await Promise.all([
        fetchTodayTasks(user.id),
        fetchTotalTaskPoints(user.id),
      ]);
      setCompletedTasks(completed);
      setTotalTaskPoints(totalPts);
    };

    fetchProfile();
    fetchDailyData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  const rankColor = rankColors[profile.rank] || "text-muted-foreground";
  const rankBg = rankBgColors[profile.rank] || "bg-secondary border-border";
  const completedCount = completedTasks.length;
  const totalTasks = DAILY_TASKS.length;
  const todayPoints = DAILY_TASKS.filter((t) => completedTasks.includes(t.task_type)).reduce((s, t) => s + t.points, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-muted-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground text-xs">
            <LogOut className="mr-1 h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Theme Toggle Card */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <div>
              <p className="text-sm font-medium text-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={toggleTheme} className="text-xs">
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </Button>
        </div>

        {/* Identity Card */}
        <div className={`rounded-xl border p-5 text-center space-y-3 ${rankBg}`}>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-card border border-border">
            <span className={`text-2xl font-bold font-mono ${rankColor}`}>
              {profile.labs_id.split("_")[1]?.slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className={`text-lg font-mono font-bold ${rankColor}`}>{profile.labs_id}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{profile.country}</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${rankBg} ${rankColor}`}>
              {profile.rank}
            </span>
            <span className="text-xs text-muted-foreground">{profile.points} pts</span>
          </div>
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {profile.interests.map((i) => (
                <span key={i} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] text-primary font-medium">
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Daily Tasks */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">Daily Tasks</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {completedCount}/{totalTasks} done
              </span>
              {todayPoints > 0 && (
                <span className="text-[10px] font-semibold text-primary">+{todayPoints} pts today</span>
              )}
            </div>
          </div>

          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / totalTasks) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {DAILY_TASKS.map((task) => {
              const done = completedTasks.includes(task.task_type);
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    done ? "bg-primary/5" : "bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-[11px] text-foreground">{task.icon} {task.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-medium ${done ? "text-primary" : "text-muted-foreground"}`}>
                    +{task.points}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-[10px] text-muted-foreground">Total earned from tasks</span>
            <span className="text-xs font-semibold text-primary">{totalTaskPoints} pts</span>
          </div>

          {completedCount === totalTasks && (
            <div className="text-center">
              <span className="text-xs text-primary font-semibold">🎉 All tasks completed today!</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <FileText className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{postCount}</p>
            <p className="text-[10px] text-muted-foreground">Posts</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <Trophy className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{debateWins}</p>
            <p className="text-[10px] text-muted-foreground">Wins</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <Bookmark className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{savedFlints.length}</p>
            <p className="text-[10px] text-muted-foreground">Saved</p>
          </div>
        </div>

        {/* Rank Progress */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-medium text-foreground">Rank Progress</p>
          <div className="flex gap-1">
            {[
              { name: "Lead", min: 0, max: 500 },
              { name: "Copper", min: 501, max: 2500 },
              { name: "Cobalt", min: 2501, max: 10000 },
              { name: "Amethyst", min: 10001, max: 50000 },
              { name: "Gold", min: 50001, max: 999999 },
            ].map((tier) => {
              const isActive = profile.rank === tier.name;
              const isPast = profile.points > tier.max;
              return (
                <div key={tier.name} className="flex-1">
                  <div className={`h-1.5 rounded-full ${
                    isPast ? "bg-primary" : isActive ? "bg-primary/60" : "bg-secondary"
                  }`} />
                  <p className={`text-[9px] mt-1 ${isActive ? rankColors[tier.name] : "text-muted-foreground"}`}>
                    {tier.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved Flints */}
        {savedFlints.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Saved Flints</p>
            {savedFlints.map((f) => (
              <div key={f.id} className="rounded-lg border border-border bg-card p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                    {f.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    👍 {f.agree_count} · 👎 {f.disagree_count}
                  </span>
                </div>
                <p className="text-xs text-foreground">{f.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground">
            <Flame className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/create" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary -mt-5 shadow-lg shadow-primary/30">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-medium">Flint</span>
          </Link>
          <Link to="/talk" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] font-medium">Talk</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-0.5 text-primary">
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Profile;
