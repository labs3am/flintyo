import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = ["Life", "Philosophy", "Politics", "Relationships", "Religion", "Technology", "Random"];

const CreateFlint = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Random");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      toast({ title: "Write something first!", variant: "destructive" });
      return;
    }

    if (trimmed.length > 1000) {
      toast({ title: "Flint is too long (max 1000 chars)", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("flints").insert({
      author_id: user!.id,
      content: trimmed,
      category,
      is_saved: isSaved,
    });

    if (error) {
      toast({ title: "Failed to post flint", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Flint posted! 🔥" });
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Let's Flint</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4 py-5 gap-5">
        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">What's on your mind?</Label>
          <Textarea
            id="content"
            placeholder="Share a thought, opinion, or hot take..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[140px] resize-none bg-card border-border"
            maxLength={1000}
          />
          <p className="text-right text-[10px] text-muted-foreground">{content.length}/1000</p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Save this Flint</p>
            <p className="text-xs text-muted-foreground">
              {isSaved ? "This flint will stay forever" : "Disappears in 12 hours"}
            </p>
          </div>
          <Switch checked={isSaved} onCheckedChange={setIsSaved} />
        </div>

        {/* Submit */}
        <Button type="submit" className="mt-auto w-full font-semibold" disabled={loading || !content.trim()}>
          {loading ? "Posting..." : "Post Flint 🔥"}
        </Button>
      </form>
    </div>
  );
};

export default CreateFlint;
