import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { Flame, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const categories = ["Life", "Politics", "Relationship", "Religion", "Philosophy", "Random", "Other"];
const audiences = ["Global", "My Country", "Specific Country"];

const CreateFlint = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Random");
  const [audience, setAudience] = useState("Global");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
    setLoading(true);

    const expiresAt = isSaved ? null : new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    const audienceValue = audience === "My Country" ? profile?.country || "Global" : audience;

    const { error } = await supabase.from("flints").insert({
      author_id: user.id,
      content: content.trim(),
      category,
      is_saved: isSaved,
      expires_at: expiresAt,
      audience: audienceValue === "Specific Country" ? "Specific" : audienceValue,
    });

    if (error) {
      toast.error("Failed to post");
    } else {
      // Update posts count
      await supabase.from("profiles").update({ posts_count: (profile?.posts_count || 0) + 1 }).eq("id", user.id);
      toast.success("Flint posted!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Flame className="text-primary" size={20} />
            <h1 className="text-lg font-bold text-foreground">Let's Flint</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <Textarea
          placeholder="What's on your mind? Speak freely..."
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 1000))}
          className="bg-secondary border-border min-h-[120px] resize-none"
        />
        <p className="text-right text-xs text-muted-foreground">{content.length}/1000</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
          <div>
            <Label className="text-sm text-foreground">Save this Flint</Label>
            <p className="text-xs text-muted-foreground">Won't expire after 12 hours</p>
          </div>
          <Switch checked={isSaved} onCheckedChange={setIsSaved} />
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={loading || !content.trim()}>
          {loading ? "Posting..." : "Post Flint 🔥"}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default CreateFlint;
