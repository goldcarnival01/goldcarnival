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
      
      <div className="flex flex-col lg:flex-row pt-16 sm:pt-20">
        <DashboardSidebar />
        
        <div className="flex-1 min-w-0">
          {/* Main Content */}
          <section className="p-3 sm:p-4 lg:p-6">
            <div className="container mx-auto max-w-7xl">
              {/* My Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {userPlans.length > 0 ? userPlans.map((userPlan, index) => {
                  const verificationStatus = (userPlan.verified || '').toString().toLowerCase();
                  const isApproved = verificationStatus === 'verified' || verificationStatus === 'approved';
                  const isRejected = verificationStatus === 'rejected';
                  const isPending = !isApproved && !isRejected;
                  
                  // Status-based styling
                  const cardBg = isApproved 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : isPending 
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
                    : 'bg-gradient-to-br from-red-500 to-red-600';
                  
                  const statusIcon = isApproved ? '✅' : isPending ? '⏳' : '❌';
                  const statusText = isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected';
                  
                  return (
                  <Card key={userPlan.id || index} className={`${cardBg} p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {userPlan.plan.name}
                        </Badge>
                        {userPlan.plan.badge && (
                          <Badge className="bg-yellow-400/90 text-yellow-900 font-semibold">
                            {userPlan.plan.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-4xl font-bold mb-6 text-white drop-shadow-sm">
                        ${parseFloat(userPlan.plan.amount).toLocaleString()}
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <span className="text-sm">📅</span>
                            </div>
                            <span className="text-sm font-medium">
                              Purchased: {new Date(userPlan.purchaseDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm ${
                              isApproved ? 'bg-green-400/30' : isPending ? 'bg-orange-400/30' : 'bg-red-400/30'
                            }`}>
                              <span className="text-sm">{statusIcon}</span>
                            </div>
                            <span className="text-sm font-medium">Status: {statusText}</span>
                          </div>
                          <Badge className={`${
                            isApproved ? 'bg-green-400/20 text-green-100' : 
                            isPending ? 'bg-orange-400/20 text-orange-100' : 
                            'bg-red-400/20 text-red-100'
                          } border-0`}>
                            {statusText}
                          </Badge>
                        </div>
                      </div>
                      
                      {userPlan.plan.features && userPlan.plan.features.length > 0 && (
                        <div className="mb-6 space-y-2">
                          {userPlan.plan.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <span className="text-sm">{feature.icon}</span>
                              <span className="text-xs text-white/90">{feature.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-200"
                        onClick={() => navigate(`/dashboard/my-plans`)}
                      >
                        VIEW DETAILS
                      </Button>
                    </div>
                  </Card>
                  );
                }) : (
                  <div className="col-span-full text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">📦</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No Plans Yet!</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">You haven't purchased any plans yet. Browse our available plans to get started.</p>
                    <Button 
                      className="gradient-gold text-primary-foreground hover:opacity-90"
                      onClick={() => navigate('/')}
                    >
                      Browse Plans
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">QUICK LINKS</h3>
                  <Button variant="ghost" size="sm" className="text-primary self-start sm:self-auto" onClick={() => navigate('/dashboard/deposit')}>
                    <span className="hidden sm:inline">UPDATE PROFILE</span>
                    <span className="sm:hidden">PROFILE</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {quickLinks.map((link, index) => (
                    <Card 
                      key={index} 
                      className={`${link.color} p-4 sm:p-6 text-white hover:opacity-90 transition-opacity cursor-pointer`}
                      onClick={() => navigate(link.path)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <link.icon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{link.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-300 truncate">{link.subtitle}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Referral and Stats Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
                {/* Referral Section */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">REFERRAL</h3>
                    <Button variant="ghost" size="sm" className="text-primary self-start sm:self-auto" onClick={() => navigate('/dashboard/deposit')}>
                      <span className="hidden sm:inline">REFERRAL REPORT</span>
                      <span className="sm:hidden">REPORT</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <Card className="bg-card border-border p-4 sm:p-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">REFER A FRIEND PROGRAM</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 px-2">
                        Copy and share the below link on your social media platform or email to get more referrals.
                      </p>
                    </div>
                    
                    <div className="mb-4 sm:mb-6">
                      <label className="text-sm font-medium text-foreground mb-2 block">Referral Link</label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input 
                          type="text" 
                          value={referralLink || 'Loading...'}
                          readOnly 
                          className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-xs sm:text-sm min-w-0"
                        />
                        <Button 
                          variant="gold" 
                          size="sm"
                          className="sm:flex-shrink-0"
                          onClick={() => {
                            if (referralLink) {
                              navigator.clipboard.writeText(referralLink);
                              // You can add a toast notification here
                            }
                          }}
                        >
                          📋 Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Button variant="gold" className="w-full sm:w-auto px-4 sm:px-8 text-sm" onClick={() => navigate('/dashboard/deposit')}>
                        <span className="hidden sm:inline">VIEW REFERRAL BANNERS</span>
                        <span className="sm:hidden">VIEW BANNERS</span>
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* My Stats Section */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">MY STATS</h3>
                    <Button variant="ghost" size="sm" className="text-primary self-start sm:self-auto" onClick={() => navigate('/dashboard/deposit')}>
                      <span className="hidden sm:inline">VIEW MORE</span>
                      <span className="sm:hidden">MORE</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Card className="bg-card border-border p-3 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-lg">💰</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Total Deposit</p>
                          <p className="text-sm sm:text-lg font-bold text-foreground truncate">
                            ${userStats?.totalDeposit || '0.00'}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-3 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-lg">👥</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Total Referrals</p>
                          <p className="text-sm sm:text-lg font-bold text-foreground truncate">
                            {userStats?.referrals?.total || 0}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-3 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-lg">💎</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Total Referral Commission</p>
                          <p className="text-sm sm:text-lg font-bold text-foreground truncate">
                            ${userStats?.totalCommission || '0'}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-card border-border p-3 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-lg">💳</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Total Withdraw</p>
                          <p className="text-sm sm:text-lg font-bold text-foreground truncate">
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