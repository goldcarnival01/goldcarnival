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
import { useSearchParams, useNavigate } from "react-router-dom";
import { plansAPI, walletAPI, userPlansAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import qrImage from "@/assets/qr.jpg";

const DepositPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get("planId");
  const [fixedAmount, setFixedAmount] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [planData, setPlanData] = useState(null);
  const [hasExistingPlan, setHasExistingPlan] = useState<boolean>(false);
  const [checkingPlan, setCheckingPlan] = useState<boolean>(false);
  // User provides THEIR sending wallet address here
  const [userFromWallet, setUserFromWallet] = useState<string>("");
  const [usdtAmount, setUsdtAmount] = useState<string>("");
  const [showQr, setShowQr] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  // Your receiving address shown in popup
  const RECEIVER_TRON_ADDRESS = import.meta.env.VITE_RECEIVER_TRON_ADDRESS || "TSvgtaECg4YZUaPPgAcPeqBu8ZTq9tY3S3";

  // Only keep UPI (coming soon) and show custom USDT TRC form card


  useEffect(() => {
    const loadPlanAndCheckExisting = async () => {
      if (!planId) {
        // Show toast notification and redirect after a delay
        toast({
          title: "No Plan Selected",
          description: "Please select a plan first to proceed with deposit.",
          variant: "destructive",
        });
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
        return;
      }
      
      setCheckingPlan(true);
      
      try {
        // Load plan details and check for existing plan in parallel
        const [planResponse, userPlansResponse] = await Promise.allSettled([
          plansAPI.getById(planId),
          userPlansAPI.getMyPlans()
        ]);
        
        // Handle plan data
        if (planResponse.status === 'fulfilled') {
          const plan = planResponse.value.data?.data || planResponse.value.data;
          setPlanData(plan);
          const amount = parseFloat(plan?.amount ?? plan?.price);
          if (!isNaN(amount)) setFixedAmount(amount);
        } else {
          throw new Error('Plan not found');
        }
        
        // Check for existing plan
        if (userPlansResponse.status === 'fulfilled') {
          const userPlans = userPlansResponse.value.data?.data || [];
          const existingPlan = userPlans.find(userPlan => 
            userPlan.planId === parseInt(planId) && 
            userPlan.isActive && 
            (userPlan.verified === 'verified' || userPlan.verified === 'approved' || userPlan.verified === 'pending')
          );
          
          if (existingPlan) {
            setHasExistingPlan(true);
            toast({
              title: "Plan Already Purchased",
              description: `You already have the ${existingPlan.plan?.name || 'selected'} plan. You cannot purchase the same plan twice.`,
              variant: "destructive",
            });
          }
        }
        
      } catch (e) {
        toast({
          title: "Plan Not Found",
          description: "The selected plan could not be found. Please select a valid plan.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } finally {
        setCheckingPlan(false);
      }
    };
    
    loadPlanAndCheckExisting();
  }, [planId, navigate]);

  // Prefill the USDT amount with the plan's fixed amount and keep it read-only
  useEffect(() => {
    if (fixedAmount !== null) {
      setUsdtAmount(String(fixedAmount));
    }
  }, [fixedAmount]);

  
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
      const primaryAmount = Number(usdtAmount);
      const fallbackAmountFromPlan = Number(
        resolvedPlan?.amount ?? resolvedPlan?.price ?? 0
      );
      const purchasePriceNumber = Number.isFinite(primaryAmount) && primaryAmount > 0
        ? primaryAmount
        : (typeof fixedAmount === 'number' && Number.isFinite(fixedAmount) ? fixedAmount : fallbackAmountFromPlan);

      const normalizedPlanId = planId ? Number(planId) : undefined;
      const normalizedWallet = (userFromWallet || '').trim();
      const purchasePrice = Number.isFinite(purchasePriceNumber) ? purchasePriceNumber.toFixed(2) : '0.00';

      await (await import("@/services/api")).userPlansAPI.purchase({
        planId: normalizedPlanId,
        paymentMethod: "usdt_trc20_manual",
        transactionId: `MANUAL_USDT_${Date.now()}`,
        walletAddress: normalizedWallet,
        purchasePrice
      } as any);
    } catch (e) {
      // swallow for now
    } finally {
      setShowQr(false);
      toast({
        title: "Payment submitted",
        description: "Your plan will be activated within 2hr after payment.",
      });
    }
  };
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="flex flex-col lg:flex-row pt-16 sm:pt-20">
        <DashboardSidebar />
        
        <div className="flex-1">
          {/* Header */}
          <div className="bg-card border-b border-border p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">DEPOSIT</h1>
              <Button variant="ghost" size="sm" className="text-primary text-xs sm:text-sm">
                VIEW DEPOSIT FUND REPORT <Eye className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <section className="p-6">
            <div className="container mx-auto">
              {/* Plan Selection Notice */}
              {!planId && (
                <div className="mb-6">
                  <Card className="bg-orange-50 border-orange-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">⚠️</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-orange-800">No Plan Selected</h3>
                        <p className="text-orange-700">Please select a plan first to proceed with deposit. You will be redirected to the plans page.</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/')}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Select a Plan
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Existing Plan Notice */}
              {hasExistingPlan && planData && (
                <div className="mb-6">
                  <Card className="bg-red-50 border-red-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">🚫</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-800">Plan Already Purchased</h3>
                        <p className="text-red-700">You already have the "{planData.name}" plan. You cannot purchase the same plan twice.</p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <Button 
                        onClick={() => navigate('/dashboard/my-plans')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        View My Plans
                      </Button>
                      <Button 
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Select Different Plan
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Loading Notice */}
              {checkingPlan && (
                <div className="mb-6">
                  <Card className="bg-blue-50 border-blue-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">Checking Plan Status</h3>
                        <p className="text-blue-700">Please wait while we verify your plan eligibility...</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Plan Information */}
              {planData && (
                <div className="mb-6">
                  <Card className="bg-blue-50 border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📋</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">Selected Plan: {planData.name}</h4>
                          <p className="text-blue-600 text-sm">Amount: ${parseFloat(planData.amount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      {planData.badge && (
                        <Badge className="bg-blue-500 text-white">{planData.badge}</Badge>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Custom USDT TRC Card */}
                <div className="lg:col-span-1">
                  <Card className={`p-6 text-white relative overflow-hidden ${
                    !planId || hasExistingPlan ? 'bg-gray-500 opacity-50' : 'bg-teal-700'
                  }`}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">₮</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">USDT TRC20</h4>
                        <p className="text-white/80 text-sm">
                          {!planId 
                            ? 'Select a plan first' 
                            : hasExistingPlan 
                            ? 'Plan already purchased' 
                            : 'Pay to your provided wallet'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white/90">Your Wallet Address (sending from)</Label>
                      <Input
                        placeholder={
                          !planId 
                            ? "Select a plan first" 
                            : hasExistingPlan 
                            ? "Plan already purchased" 
                            : "Enter your TRC20 wallet address"
                        }
                        value={userFromWallet}
                        onChange={(e) => setUserFromWallet(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                        disabled={!planId || hasExistingPlan || checkingPlan}
                      />
                      <Label className="text-white/90">Amount (in USDT)</Label>
                      <Input
                        placeholder="Amount"
                        value={usdtAmount}
                        readOnly
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                        disabled={!planId || hasExistingPlan || checkingPlan}
                      />
                      <Button 
                        className={`w-full text-white ${
                          !planId || hasExistingPlan || checkingPlan
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-black hover:bg-black/80'
                        }`}
                        onClick={openQrModal} 
                        disabled={!planId || hasExistingPlan || checkingPlan || !userFromWallet || !usdtAmount}
                      >
                        {checkingPlan 
                          ? 'Checking...' 
                          : !planId 
                          ? 'Select Plan First' 
                          : hasExistingPlan 
                          ? 'Plan Already Purchased' 
                          : 'Pay'}
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
              {/* Static QR image */}
              <img
                src={qrImage}
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
