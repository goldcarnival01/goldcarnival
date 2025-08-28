import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import ticketIcon from "@/assets/ticket-icon.png";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  // Get referral code from URL parameters
  const [searchParams] = useSearchParams();
  const defaultTab = (location.pathname === '/signup' || !!searchParams.get('ref')) ? 'signup' : 'login';
  
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(loginIdentifier, loginPassword);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const registrationData = { 
        email: signupEmail, 
        password: signupPassword,
        ...(referralCode && { referralCode })
      };
      const response = await register(registrationData);
      setSuccessMsg("Registration successful! Please check your email to verify your account.");
      // Clear form
      setSignupEmail("");
      setSignupPassword("");
      if (!searchParams.get('ref')) {
        setReferralCode("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <Header />

      <div className="flex items-center justify-center min-h-screen pt-16 sm:pt-20 pb-8 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <img src={ticketIcon} alt="Gold Carnival" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold gradient-gold bg-clip-text text-transparent">
              GOLD CARNIVAL
            </h1>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-border p-4 sm:p-6 lg:p-8">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
                <TabsTrigger value="login" className="data-[state=active]:gradient-gold data-[state=active]:text-primary-foreground text-sm sm:text-base">
                  LOGIN
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:gradient-gold data-[state=active]:text-primary-foreground text-sm sm:text-base">
                  SIGN UP
                </TabsTrigger>
              </TabsList>

              {errorMsg && (
                <div className="mb-4 text-center text-destructive text-xs sm:text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 text-center text-green-600 text-xs sm:text-sm font-medium">
                  {successMsg}
                </div>
              )}

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-primary text-sm sm:text-base">Email or Member ID</Label>
                    <Input
                      id="identifier"
                      placeholder="Enter Email or Member ID"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-primary">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-secondary border-border pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-primary underline"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" variant="gold" className="w-full text-sm sm:text-base font-semibold mt-2 py-3" disabled={loading}>
                    {loading ? "Please wait..." : "SIGN IN"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 sm:space-y-6">

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-primary">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  {referralCode && (
                    <div className="space-y-2">
                      <Label htmlFor="referralCode" className="text-primary">Referral Code</Label>
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code (optional)"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="bg-secondary border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        You were referred by someone! This code will give you special benefits.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-primary">Password</Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="bg-secondary border-border pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="gold" className="w-full text-sm sm:text-base font-semibold py-3" disabled={loading}>
                    {loading ? "Please wait..." : "SIGN UP"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
