import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { authAPI } from "@/services/api";
import { useSearchParams, useNavigate } from "react-router-dom";

export const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Use a longer-timeout variant to handle cold starts on the server
      if (authAPI.forgotPasswordLong) {
        await authAPI.forgotPasswordLong(email);
      } else {
        await authAPI.forgotPassword(email);
      }
      setMessage("If an account with this email exists, a password reset link has been sent.");
      setEmail("");
    } catch (e: any) {
      // If it's just a timeout, treat as success because email may still be queued on server
      if (e?.code === 'ECONNABORTED' || /timeout/i.test(e?.message || '')) {
        setMessage("If an account with this email exists, a password reset link has been sent.");
        setEmail("");
      } else {
        const apiMessage = e?.response?.data?.message || e?.message;
        setMessage(apiMessage || "Failed to send reset link");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8">
        <Card className="bg-card/80 backdrop-blur-sm border-border p-8 w-full max-w-md mx-4">
          <h1 className="text-xl font-semibold mb-6 text-foreground">Forgot password</h1>
          {message && <p className="mb-4 text-sm text-muted-foreground">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      navigate("/login");
    } catch (e) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8">
        <Card className="bg-card/80 backdrop-blur-sm border-border p-8 w-full max-w-md mx-4">
          <h1 className="text-xl font-semibold mb-6 text-foreground">Reset password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !token}>{loading ? "Resetting..." : "Reset password"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};


