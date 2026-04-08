import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Search } from "lucide-react";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const isOldEnough = () => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country) { toast.error("Please select a country"); return; }
    if (!dob) { toast.error("Please enter your date of birth"); return; }
    if (!isOldEnough()) { toast.error("You must be at least 18 years old"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    const { error } = await signUp(email, password, name, country);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email to confirm.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Flame className="text-primary" size={28} />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Flintyo</h1>
          </div>
          <p className="text-muted-foreground text-sm">Create your anonymous identity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary border-border"
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-border"
            required
          />
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Date of Birth</label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="bg-secondary border-border"
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <Input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary border-border"
            minLength={8}
            required
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-secondary border-border"
            minLength={8}
            required
          />

          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-secondary border border-border text-sm text-left"
              >
                <span className={country ? "text-foreground" : "text-muted-foreground"}>
                  {country || "Select country"}
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
                      onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded hover:bg-accent transition-colors ${
                        country === c ? "text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
