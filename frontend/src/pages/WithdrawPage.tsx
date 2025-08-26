import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { walletAPI } from "@/services/api";

const MIN_WITHDRAW = 50;

const WithdrawPage = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usdt");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < MIN_WITHDRAW) {
      setError(`Minimum withdraw amount is $${MIN_WITHDRAW}.`);
      return;
    }
    if (!address.trim()) {
      setError("Crypto address is required.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await walletAPI.withdraw({ amount: amt, currency, address });
      setMessage("Withdrawal requested. Funds will arrive within 1 hour.");
      setAmount("");
      setAddress("");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.error || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex pt-20">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="bg-card border-b border-border p-6">
            <h1 className="text-2xl font-bold text-foreground">WITHDRAW FUND</h1>
            <p className="text-sm text-muted-foreground">Minimum withdraw amount is ${MIN_WITHDRAW}. Processing time: within 1 hour.</p>
          </div>
          <section className="p-6">
            <div className="container mx-auto max-w-xl">
              <Card className="p-6 space-y-4">
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {message && <div className="text-green-600 text-sm">{message}</div>}
                <div>
                  <Label>Amount (USD)</Label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Min ${MIN_WITHDRAW}`} />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="usdt" />
                </div>
                <div>
                  <Label>Destination Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your crypto address" />
                </div>
                <Button disabled={submitting} onClick={handleSubmit} className="w-full">
                  {submitting ? "Submitting..." : "Request Withdraw"}
                </Button>
                <p className="text-xs text-muted-foreground">Note: Funds are sent after manual/automated review. Expect completion within ~1 hour.</p>
              </Card>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WithdrawPage;


