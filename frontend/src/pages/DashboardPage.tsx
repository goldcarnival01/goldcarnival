import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera,
  Wallet,
  ShoppingCart,
  Trophy,
  CreditCard,
  Eye,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { jackpotAPI, userAPI, referralAPI, userPlansAPI } from "@/services/api";
import { useCountdown } from "@/hooks/useCountdown";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jackpots, setJackpots] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextDrawTime, setNextDrawTime] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  
  // Get the nearest draw time from jackpots
  const getNextDrawTime = (jackpots: any[]) => {
    if (!jackpots || jackpots.length === 0) return null;
    
    const upcomingDraws = jackpots
      .filter(jackpot => jackpot.drawTime && new Date(jackpot.drawTime) > new Date())
      .sort((a, b) => new Date(a.drawTime).getTime() - new Date(b.drawTime).getTime());
    
    return upcomingDraws.length > 0 ? upcomingDraws[0].drawTime : null;
  };
  
  const countdown = useCountdown(nextDrawTime);

  const quickLinks = [
    { title: "DEPOSIT", subtitle: "ADD FUND", icon: Wallet, color: "bg-gray-800", path: "/dashboard/deposit" },
    { title: "TICKET", subtitle: "BUY", icon: ShoppingCart, color: "bg-gray-800", path: "/dashboard/deposit" },
    { title: "WINNINGS", subtitle: "JACKPOTS", icon: Trophy, color: "bg-gray-800", path: "/dashboard/my-winnings" },
    { title: "PAYOUT", subtitle: "WITHDRAW", icon: CreditCard, color: "bg-gray-800", path: "/dashboard/withdraw-fund" }
  ];

  const walletData = [
    { 
      label: "D WALLET", 
      amount: `$${userStats?.wallets?.deposit || 0}`, 
      subtitle: "(For Deposit)", 
      color: "bg-orange-500",
      type: "deposit"
    },
    { 
      label: "W WALLET", 
      amount: `$${userStats?.wallets?.winnings || 0}`, 
      subtitle: "(Winnings & Income)", 
      color: "bg-yellow-500",
      type: "winnings"
    },
    { 
      label: "T WALLET", 
      amount: `$${userStats?.wallets?.ticket_bonus || 0}`, 
      subtitle: "(Bonus For Tickets Purchase)", 
      color: "bg-orange-500",
      type: "ticket_bonus"
    }
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel with individual error handling
        const [jackpotsResponse, statsResponse, referralResponse, userPlansResponse] = await Promise.allSettled([
          jackpotAPI.getAll(),
          userAPI.getStats(),
          referralAPI.getLink(),
          userPlansAPI.getMyPlans()
        ]);

        // Handle each response individually
        const jackpotsData = jackpotsResponse.status === 'fulfilled' ? 
          (jackpotsResponse.value?.data?.jackpots || []) : [];
        const statsData = statsResponse.status === 'fulfilled' ? 
          (statsResponse.value?.data?.stats || { wallets: {} }) : { wallets: {} };
        const referralData = referralResponse.status === 'fulfilled' ? 
          (referralResponse.value?.data?.referralLink || '') : '';
        const userPlansData = userPlansResponse.status === 'fulfilled' ? 
          (userPlansResponse.value?.data?.data || []) : [];
        

        setJackpots(jackpotsData);
        setUserStats(statsData);
        setReferralLink(referralData);
        setUserPlans(userPlansData);
        
        // Set next draw time
        setNextDrawTime(getNextDrawTime(jackpotsData));
        
        // Log any failed requests
        if (jackpotsResponse.status === 'rejected') {
          console.error('Failed to fetch jackpots:', jackpotsResponse.reason);
        }
        if (statsResponse.status === 'rejected') {
          console.error('Failed to fetch user stats:', statsResponse.reason);
        }
        if (referralResponse.status === 'rejected') {
          console.error('Failed to fetch referral link:', referralResponse.reason);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set empty defaults on error
        setJackpots([]);
        setUserStats({ wallets: {} });
        setNextDrawTime(null);
        setReferralLink('');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="flex pt-20">
        <DashboardSidebar />
        
        <div className="flex-1">
          {/* Live Draw Timer */}
          <div className="bg-card border-b border-border p-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">LIVE DRAW TIMER</span>
                  <div className="flex items-center space-x-2">
                    {nextDrawTime ? [
                      { value: countdown.days.toString().padStart(2, '0'), label: "Days" },
                      { value: countdown.hours.toString().padStart(2, '0'), label: "Hours" },
                      { value: countdown.minutes.toString().padStart(2, '0'), label: "Minutes" },
                      { value: countdown.seconds.toString().padStart(2, '0'), label: "Seconds" }
                    ].map((time, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-background text-foreground px-2 py-1 rounded text-sm font-bold">
                          {time.value}
                        </div>
                        <div className="text-xs text-muted-foreground">{time.label}</div>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">No upcoming draws</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                  <div className="flex items-center space-x-2">
                    <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-3" />
                    <span className="text-sm">English</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Update Notice */}
          {!user.profileCompleted && (
            <div className="bg-orange-100 border border-orange-200 p-4">
              <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-800">Please update your profile</span>
                </div>
                <Button variant="gold" size="sm">
                  UPDATE NOW
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <section className="p-6">
            <div className="container mx-auto">
              {/* My Plans Grid */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {userPlans.length > 0 ? userPlans.map((userPlan, index) => (
                  <Card key={userPlan.id || index} className="gradient-gold p-6 text-primary-foreground relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-black/30 text-white">{userPlan.plan.name}</Badge>
                        {userPlan.plan.badge && (
                          <Badge className="bg-yellow-500/20 text-yellow-300">{userPlan.plan.badge}</Badge>
                        )}
                      </div>
                      <div className="text-4xl font-bold mb-6">${parseFloat(userPlan.plan.amount).toLocaleString()}</div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-black font-bold">📅</span>
                          </div>
                          <span className="text-sm">Purchased: {new Date(userPlan.purchaseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-black font-bold">✅</span>
                          </div>
                          <span className="text-sm">Status: {userPlan.status}</span>
                        </div>
                      </div>
                      {userPlan.plan.features && userPlan.plan.features.length > 0 && (
                        <div className="mb-4">
                          {userPlan.plan.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2 mb-1">
                              <span className="text-sm">{feature.icon}</span>
                              <span className="text-xs">{feature.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button 
                        className="w-full bg-black hover:bg-black/80 text-white"
                        onClick={() => navigate(`/dashboard/my-plans`)}
                      >
                        VIEW DETAILS
                      </Button>
                    </div>
                  </Card>
                )) : (
                  <div className="col-span-3 text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Plans Yet!</h3>
                    <p className="text-muted-foreground mb-4">You haven't purchased any plans yet. Browse our available plans to get started.</p>
                    <Button 
                      className="gradient-gold text-primary-foreground hover:opacity-90"
                      onClick={() => navigate('/')}
                    >
                      Browse Plans
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Quick Links */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">QUICK LINKS</h3>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/dashboard/deposit')}>
                      UPDATE PROFILE <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {quickLinks.map((link, index) => (
                      <Card 
                        key={index} 
                        className={`${link.color} p-6 text-white hover:opacity-90 transition-opacity cursor-pointer`}
                        onClick={() => navigate(link.path)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                              <link.icon className="w-6 h-6 text-black" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{link.title}</h4>
                              <p className="text-sm text-gray-300">{link.subtitle}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* My Wallet */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">MY WALLET</h3>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/dashboard/deposit')}>
                      VIEW WALLET REPORT <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {walletData.map((wallet, index) => (
                      <Card key={index} className="bg-card border-border p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${wallet.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-lg">
                              {wallet.label.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{wallet.amount}</span>
                              <span className="text-lg font-bold text-foreground">{wallet.amount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{wallet.label}</span>
                              {wallet.label === "D WALLET" && (
                                <Button 
                                  size="sm" 
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1"
                                  onClick={() => navigate('/dashboard/deposit')}
                                >
                                  ADD FUND
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{wallet.subtitle}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Referral and Stats Section */}
              <div className="grid lg:grid-cols-2 gap-8 mt-12">
                {/* Referral Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">REFERRAL</h3>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/dashboard/deposit')}>
                      REFERRAL REPORT <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <Card className="bg-card border-border p-6">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4">REFER A FRIEND PROGRAM</h4>
                      <p className="text-sm text-muted-foreground mb-6">
                        Copy and share the below link on your social media platform or email to get more referrals.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <label className="text-sm font-medium text-foreground mb-2 block">Referral Link</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          value={referralLink || 'Loading...'}
                          readOnly 
                          className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                        />
                        <Button 
                          variant="gold" 
                          size="sm"
                          onClick={() => {
                            if (referralLink) {
                              navigator.clipboard.writeText(referralLink);
                              // You can add a toast notification here
                            }
                          }}
                        >
                          📋
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Button variant="gold" className="px-8" onClick={() => navigate('/dashboard/deposit')}>
                        VIEW REFERRAL BANNERS
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* My Stats Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">MY STATS</h3>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/dashboard/deposit')}>
                      VIEW MORE <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-card border-border p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">💰</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total Deposit</p>
                          <p className="text-lg font-bold text-foreground">
                            ${userStats?.totalDeposit || '0.00'}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">👥</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total Referrals</p>
                          <p className="text-lg font-bold text-foreground">
                            {userStats?.referrals?.total || 0}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">🎫</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total Tickets Purchased</p>
                          <p className="text-lg font-bold text-foreground">
                            {userStats?.totalTickets || 0}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">💎</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total Referral Commission</p>
                          <p className="text-lg font-bold text-foreground">
                            ${userStats?.totalCommission || '0'}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">🏆</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total Winnings</p>
                          <p className="text-lg font-bold text-foreground">
                            {userStats?.totalWinnings || 0}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">💳</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total Withdraw</p>
                          <p className="text-lg font-bold text-foreground">
                            ${userStats?.totalWithdraw || '0.00'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;