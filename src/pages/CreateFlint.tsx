import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { Flame, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories = ["Life", "Politics", "Relationship", "Religion", "Philosophy", "Random", "Other"];
const audiences = ["Global", "My Country", "Specific Country"];

const CreateFlint = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Random");
  const [audience, setAudience] = useState("Global");
  const [specificCountry, setSpecificCountry] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
    if (audience === "Specific Country" && !specificCountry) {
      toast.error("Please select a country");
      return;
    }
    setLoading(true);

    const expiresAt = isSaved ? null : new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    let audienceValue = audience;
    let audienceCountry: string | null = null;

    if (audience === "My Country") {
      audienceValue = profile?.country || "Global";
    } else if (audience === "Specific Country") {
      audienceValue = "Specific";
      audienceCountry = specificCountry;
    }

    const { error } = await supabase.from("flints").insert({
      author_id: user.id,
      content: content.trim(),
      category,
      is_saved: isSaved,
      expires_at: expiresAt,
      audience: audienceValue,
      audience_country: audienceCountry,
    });

    if (error) {
      toast.error("Failed to post");
    } else {
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
            <Select value={audience} onValueChange={(v) => { setAudience(v); if (v !== "Specific Country") setSpecificCountry(""); }}>
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

        {audience === "Specific Country" && (
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-secondary border border-border text-sm"
              >
                <span className={specificCountry ? "text-foreground" : "text-muted-foreground"}>
                  {specificCountry || "Select target country"}
                </span>
                <Search size={14} className="text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <div className="p-2 border-b border-border">
                <Input
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="bg-secondary border-border h-8 text-sm"
                />
              </div>
              <ScrollArea className="h-48">
                <div className="p-1">
                  {filteredCountries.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setSpecificCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded hover:bg-accent transition-colors ${
                        specificCountry === c ? "text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}

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
