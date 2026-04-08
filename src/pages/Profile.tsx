import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FlintCard from "@/components/FlintCard";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

const rankColors: Record<string, string> = {
  Lead: "text-[hsl(var(--rank-lead))]",
  Copper: "text-[hsl(var(--rank-copper))]",
  Cobalt: "text-[hsl(var(--rank-cobalt))]",
  Amethyst: "text-[hsl(var(--rank-amethyst))]",
};

const rankBg: Record<string, string> = {
  Lead: "bg-[hsl(var(--rank-lead))]/10",
  Copper: "bg-[hsl(var(--rank-copper))]/10",
  Cobalt: "bg-[hsl(var(--rank-cobalt))]/10",
  Amethyst: "bg-[hsl(var(--rank-amethyst))]/10",
};

const Profile = () => {
  const { profile, signOut, refreshProfile, user } = useAuth();
  const [savedFlints, setSavedFlints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProfile();
    fetchSavedFlints();
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rank = profile.rank || "Lead";
  const progress = rank === "Lead" ? (profile.points / 500) * 100
    : rank === "Copper" ? ((profile.points - 501) / 2000) * 100
    : rank === "Cobalt" ? ((profile.points - 2501) / 7500) * 100 : 100;

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
              <span>Rank progress</span>
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
