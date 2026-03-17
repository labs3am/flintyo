import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Flame, Globe, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { completeDailyTask } from "@/lib/dailyTasks";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["Life", "Politics", "Relationship", "Religion", "Other"];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Djibouti", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Georgia", "Germany", "Ghana",
  "Greece", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Liberia", "Libya", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal",
  "Serbia", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

type AudienceType = "my_country" | "global" | "specific";

const CreateFlint = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audienceType, setAudienceType] = useState<AudienceType | "">("");
  const [specificCountry, setSpecificCountry] = useState("");
  const [userCountry, setUserCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("users").select("country").eq("id", user.id).single().then(({ data }) => {
      if (data?.country) setUserCountry(data.country);
    });
  }, [user]);

  const getTargetCountry = (): string | null => {
    if (audienceType === "global") return "Global";
    if (audienceType === "my_country") return userCountry || null;
    if (audienceType === "specific") return specificCountry || null;
    return null;
  };

  const filteredCountries = countrySearch
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : COUNTRIES;

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

    if (!category) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }

    const targetCountry = getTargetCountry();
    if (!targetCountry) {
      toast({ title: "Please choose an audience", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("flints").insert({
      author_id: user!.id,
      content: trimmed,
      category,
      is_saved: isSaved,
      target_country: targetCountry,
    } as never);

    if (error) {
      toast({ title: "Failed to post flint", description: error.message, variant: "destructive" });
    } else {
      completeDailyTask("post_flint");
      toast({ title: "Flint posted! 🔥" });
      navigate("/");
    }
    setLoading(false);
  };

  const canSubmit = content.trim() && category && (audienceType === "global" || audienceType === "my_country" || (audienceType === "specific" && specificCountry));

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
          <Label>Category <span className="text-destructive">*</span></Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audience */}
        <div className="space-y-3">
          <Label>Audience <span className="text-destructive">*</span></Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setAudienceType("global"); setSpecificCountry(""); }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                audienceType === "global"
                  ? "bg-primary/15 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <Globe className="h-3 w-3" />
              Global
            </button>
            {userCountry && (
              <button
                type="button"
                onClick={() => { setAudienceType("my_country"); setSpecificCountry(""); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                  audienceType === "my_country"
                    ? "bg-primary/15 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                <MapPin className="h-3 w-3" />
                {userCountry}
              </button>
            )}
            <button
              type="button"
              onClick={() => setAudienceType("specific")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                audienceType === "specific"
                  ? "bg-primary/15 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <MapPin className="h-3 w-3" />
              Specific Country
            </button>
          </div>

          {audienceType === "specific" && (
            <div className="space-y-2">
              <Input
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="bg-card border-border text-sm"
              />
              <Select value={specificCountry} onValueChange={setSpecificCountry}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredCountries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
        <Button type="submit" className="mt-auto w-full font-semibold" disabled={loading || !canSubmit}>
          {loading ? "Posting..." : "Post Flint 🔥"}
        </Button>
      </form>
    </div>
  );
};

export default CreateFlint;
