import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { plansAPI, walletAPI } from "@/services/api";

const DepositPage = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const [fixedAmount, setFixedAmount] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  // User provides THEIR sending wallet address here
  const [userFromWallet, setUserFromWallet] = useState<string>("");
  const [usdtAmount, setUsdtAmount] = useState<string>("");
  const [showQr, setShowQr] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  // Your receiving address shown in popup
  const RECEIVER_TRON_ADDRESS = import.meta.env.VITE_RECEIVER_TRON_ADDRESS || "TXrrvf5xgkXmNhNfTZU9WnXKB1uWVP4gsQ";

  // Only keep UPI (coming soon) and show custom USDT TRC form card


  useEffect(() => {
    const loadPlanAmount = async () => {
      if (!planId) return;
      try {
        const res = await plansAPI.getById(planId);
        const plan = res.data?.data || res.data; // support both shapes
        // Use the plan's displayed amount (e.g., $100 for Basic) rather than price
        const amount = parseFloat(plan?.amount ?? plan?.price);
        if (!isNaN(amount)) setFixedAmount(amount);
      } catch (e) {
        // ignore and keep as null
      }
    };
    loadPlanAmount();
  }, [planId]);

  // Commented out NOWPayments quick flow per request
  // const handleNowPay = async (currencyCode: string, index: number) => { ... };

  const openQrModal = () => {
    if (!userFromWallet || !usdtAmount) return;
    setCopied(false);
    setShowQr(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(RECEIVER_TRON_ADDRESS);
      setCopied(true);
    } catch {}
  };

  const handleConfirmAfterCopy = async () => {
    try {
      // Create a plan entry immediately as requested
      const plan = planId ? await plansAPI.getById(planId) : null;
      const resolvedPlan = plan?.data?.data || plan?.data;
      const purchasePrice = parseFloat(usdtAmount || "0") || fixedAmount || parseFloat(resolvedPlan?.amount ?? resolvedPlan?.price ?? "0");
      await (await import("@/services/api")).userPlansAPI.purchase({
        planId: planId,
        paymentMethod: "usdt_trc20_manual",
        transactionId: `MANUAL_USDT_${Date.now()}`,
        walletAddress: userFromWallet,
        purchasePrice
      } as any);
      setShowQr(false);
    } catch (e) {
      // swallow for now
    }
  };
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="flex pt-20">
        <DashboardSidebar />
        
        <div className="flex-1">
          {/* Header */}
          <div className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">DEPOSIT</h1>
              <Button variant="ghost" size="sm" className="text-primary">
                VIEW DEPOSIT FUND REPORT <Eye className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <section className="p-6">
            <div className="container mx-auto">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Custom USDT TRC Card */}
                <div className="lg:col-span-1">
                  <Card className="bg-teal-700 p-6 text-white relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">₮</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">USDT TRC20</h4>
                        <p className="text-white/80 text-sm">Pay to your provided wallet</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white/90">Your Wallet Address (sending from)</Label>
                      <Input
                        placeholder="Enter your TRC20 wallet address"
                        value={userFromWallet}
                        onChange={(e) => setUserFromWallet(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                      />
                      <Label className="text-white/90">Amount (in USDT)</Label>
                      <Input
                        placeholder="Enter amount"
                        value={usdtAmount}
                        onChange={(e) => setUsdtAmount(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                      />
                      <Button className="w-full bg-black hover:bg-black/80 text-white" onClick={openQrModal} disabled={!userFromWallet || !usdtAmount}>
                        Pay
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* UPI Card */}
                <div className="lg:col-span-1">
                  <Card className="bg-purple-600 p-6 text-white relative overflow-hidden opacity-60">
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      COMING SOON
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">💳</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">UPI</h4>
                        <p className="text-white/80 text-sm">Coming soon</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Input 
                        placeholder="Amount In USD"
                        value={fixedAmount !== null ? fixedAmount : undefined}
                        readOnly={fixedAmount !== null}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                        disabled
                      />
                      <Button className="w-full bg-black hover:bg-black/80 text-white" disabled>
                        COMING SOON
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />

      {/* QR Modal */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pay USDT (TRC20)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex flex-col items-center gap-3">
              {/* Simple QR via Google Chart for the wallet address */}
              <img
                src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(RECEIVER_TRON_ADDRESS)}`}
                alt="Wallet QR"
                className="rounded border"
              />
              <div className="w-full">
                <Label>Pay To (Our Wallet)</Label>
                <div className="flex gap-2 mt-1">
                  <Input readOnly value={RECEIVER_TRON_ADDRESS} />
                  <Button onClick={handleCopy} variant="secondary">{copied ? 'Copied' : 'Copy'}</Button>
                </div>
              </div>
              <div className="w-full">
                <Label>Amount (USDT)</Label>
                <Input readOnly value={usdtAmount} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmAfterCopy} className="w-full">I Have Paid - Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepositPage;
