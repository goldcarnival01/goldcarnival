import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, Calendar, DollarSign, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { userPlansAPI, referralAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface DailyEarning {
  date: string;
  planEarnings: number;
  referralEarnings: number;
  totalEarnings: number;
  source: string;
  planName?: string;
  isPredicted?: boolean;
}

const MyWinningsPage = () => {
  const navigate = useNavigate();
  const [userPlans, setUserPlans] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansResponse, referralResponse] = await Promise.allSettled([
        userPlansAPI.getMyPlans(),
        referralAPI.getStats()
      ]);

      const plansData = plansResponse.status === 'fulfilled' ? 
        (plansResponse.value?.data?.data || []) : [];
      const referralData = referralResponse.status === 'fulfilled' ? 
        (referralResponse.value?.data?.stats || null) : null;

      setUserPlans(plansData);
      setReferralStats(referralData);
      
      // Calculate daily earnings
      const earnings = calculateDailyEarnings(plansData, referralData);
      setDailyEarnings(earnings);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyEarnings = (plans, referralStats) => {
    const earnings: DailyEarning[] = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Process each verified plan
    plans.forEach(userPlan => {
      if (userPlan.verified !== 'verified' && userPlan.verified !== 'approved') return;
      
      const purchaseDate = new Date(userPlan.purchaseDate);
      const monthlyIncome = parseFloat(userPlan.plan?.monthlyIncome || 0);
      const dailyIncome = monthlyIncome / 30; // Approximate daily income
      
      // Start earning from the day AFTER purchase
      const earningStartDate = new Date(purchaseDate);
      earningStartDate.setDate(earningStartDate.getDate() + 1);
      
      // Generate daily earnings from day after purchase to tomorrow (for prediction)
      const currentDate = new Date(earningStartDate);
      while (currentDate <= tomorrow) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isToday = currentDate.toDateString() === today.toDateString();
        const isTomorrow = currentDate.toDateString() === tomorrow.toDateString();
        
        // Check if we already have an entry for this date
        let existingEntry = earnings.find(e => e.date === dateStr);
        if (!existingEntry) {
          existingEntry = {
            date: dateStr,
            planEarnings: 0,
            referralEarnings: 0,
            totalEarnings: 0,
            source: 'Plan',
            planName: userPlan.plan?.name,
            isPredicted: isTomorrow
          };
          earnings.push(existingEntry);
        }
        
        existingEntry.planEarnings += dailyIncome;
        existingEntry.totalEarnings += dailyIncome;
        if (!existingEntry.planName && userPlan.plan?.name) {
          existingEntry.planName = userPlan.plan.name;
        }
        if (isTomorrow) {
          existingEntry.isPredicted = true;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Add referral earnings (simplified - distribute monthly commission over days)
    if (referralStats?.monthlyCommission?.length > 0) {
      referralStats.monthlyCommission.forEach(monthData => {
        const monthlyAmount = parseFloat(monthData.commission || 0);
        const dailyReferralIncome = monthlyAmount / 30;
        
        // Add to each day of that month
        const [year, month] = monthData.month.split('-');
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const dateObj = new Date(dateStr);
          const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
          
          if (dateObj <= tomorrow) {
            let existingEntry = earnings.find(e => e.date === dateStr);
            if (!existingEntry) {
              existingEntry = {
                date: dateStr,
                planEarnings: 0,
                referralEarnings: 0,
                totalEarnings: 0,
                source: 'Referral',
                isPredicted: isTomorrow
              };
              earnings.push(existingEntry);
            }
            
            existingEntry.referralEarnings += dailyReferralIncome;
            existingEntry.totalEarnings += dailyReferralIncome;
            if (isTomorrow) {
              existingEntry.isPredicted = true;
            }
          }
        }
      });
    }

    // Sort by date descending
    return earnings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredEarnings = dailyEarnings.filter(earning => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "plans") return earning.planEarnings > 0;
    if (selectedFilter === "referrals") return earning.referralEarnings > 0;
    return true;
  });

  const paginatedEarnings = filteredEarnings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEarnings.length / itemsPerPage);

  // Calculate totals excluding predicted earnings
  const earnedEntries = dailyEarnings.filter(e => !e.isPredicted);
  const totalPlanEarnings = earnedEntries.reduce((sum, e) => sum + e.planEarnings, 0);
  const totalReferralEarnings = earnedEntries.reduce((sum, e) => sum + e.referralEarnings, 0);
  const grandTotal = totalPlanEarnings + totalReferralEarnings;
  
  // Calculate tomorrow's predicted earnings for display
  const tomorrowEarnings = dailyEarnings.filter(e => e.isPredicted);
  const predictedPlanEarnings = tomorrowEarnings.reduce((sum, e) => sum + e.planEarnings, 0);
  const predictedReferralEarnings = tomorrowEarnings.reduce((sum, e) => sum + e.referralEarnings, 0);
  const predictedTotal = predictedPlanEarnings + predictedReferralEarnings;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col lg:flex-row pt-16 sm:pt-20">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading earnings...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="flex flex-col lg:flex-row pt-16 sm:pt-20">
        <DashboardSidebar />
        
        <div className="flex-1">
          {/* Header */}
          <div className="bg-card border-b border-border p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">MY EARNINGS</h1>
                <p className="text-muted-foreground">Track your daily earnings from plans and referrals</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => navigate('/dashboard/deposit')}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                BUY PLAN
              </Button>
            </div>
          </div>

          {/* Content */}
          <section className="p-3 sm:p-4 lg:p-6">
            <div className="container mx-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs sm:text-sm">Total Plan Earnings</p>
                      <p className="text-xl sm:text-2xl font-bold">${totalPlanEarnings.toFixed(2)}</p>
                      {predictedPlanEarnings > 0 && (
                        <p className="text-green-200 text-xs mt-1">
                          Tomorrow: +${predictedPlanEarnings.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
                  </div>
                </Card>
                
                <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm">Total Referral Earnings</p>
                      <p className="text-xl sm:text-2xl font-bold">${totalReferralEarnings.toFixed(2)}</p>
                      {predictedReferralEarnings > 0 && (
                        <p className="text-blue-200 text-xs mt-1">
                          Tomorrow: +${predictedReferralEarnings.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
                  </div>
                </Card>
                
                <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs sm:text-sm">Grand Total</p>
                      <p className="text-xl sm:text-2xl font-bold">${grandTotal.toFixed(2)}</p>
                      {predictedTotal > 0 && (
                        <p className="text-purple-200 text-xs mt-1">
                          Tomorrow: +${predictedTotal.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
                  </div>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-4">
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Earnings</SelectItem>
                      <SelectItem value="plans">Plan Earnings</SelectItem>
                      <SelectItem value="referrals">Referral Earnings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
                  Showing {paginatedEarnings.length} of {filteredEarnings.length} entries
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {paginatedEarnings.length > 0 ? paginatedEarnings.map((earning, index) => (
                  <Card 
                    key={`${earning.date}-${index}`} 
                    className={`bg-card border-border p-4 ${
                      earning.isPredicted ? 'opacity-60 bg-muted/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {new Date(earning.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {earning.isPredicted && (
                            <span className="text-xs text-muted-foreground ml-2">(Tomorrow)</span>
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${earning.isPredicted ? 'text-muted-foreground' : 'text-foreground'}`}>
                          ${earning.totalEarnings.toFixed(2)}
                        </div>
                        <div className="text-xs">
                          {earning.isPredicted ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              Predicted
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan Earnings:</span>
                        <span className={`font-medium ${earning.isPredicted ? 'text-green-400' : 'text-green-600'}`}>
                          ${earning.planEarnings.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referral Earnings:</span>
                        <span className={`font-medium ${earning.isPredicted ? 'text-blue-400' : 'text-blue-600'}`}>
                          ${earning.referralEarnings.toFixed(2)}
                        </span>
                      </div>
                      {earning.planName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Source:</span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {earning.planName}
                            </Badge>
                            {earning.referralEarnings > 0 && earning.planEarnings > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Mixed
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )) : (
                  <Card className="bg-card border-border p-8 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Earnings Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">You haven't earned anything yet. Purchase a plan to start earning!</p>
                    <Button onClick={() => navigate('/dashboard/deposit')}>
                      Get Started
                    </Button>
                  </Card>
                )}
                
                {/* Mobile Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:hidden space-y-3">
                    <div className="text-xs text-muted-foreground text-center">
                      Page {currentPage} of {totalPages} • {filteredEarnings.length} total results
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="text-xs px-3"
                      >
                        Prev
                      </Button>
                      <span className="text-xs text-muted-foreground px-2">
                        {currentPage}/{totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="text-xs px-3"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block">
                <Card className="bg-card border-border overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
                    <div className="grid grid-cols-6 gap-4 text-primary-foreground font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        DATE
                      </div>
                      <div>PLAN EARNINGS</div>
                      <div>REFERRAL EARNINGS</div>
                      <div>TOTAL EARNINGS</div>
                      <div>SOURCE</div>
                      <div>STATUS</div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {paginatedEarnings.length > 0 ? paginatedEarnings.map((earning, index) => (
                      <div 
                        key={`${earning.date}-${index}`} 
                        className={`grid grid-cols-6 gap-4 p-4 hover:bg-muted/50 transition-colors ${
                          earning.isPredicted ? 'opacity-60 bg-muted/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(earning.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {earning.isPredicted && (
                              <span className="text-xs text-muted-foreground ml-2">(Tomorrow)</span>
                            )}
                          </span>
                        </div>
                        <div className={`font-medium ${earning.isPredicted ? 'text-green-400' : 'text-green-600'}`}>
                          ${earning.planEarnings.toFixed(2)}
                        </div>
                        <div className={`font-medium ${earning.isPredicted ? 'text-blue-400' : 'text-blue-600'}`}>
                          ${earning.referralEarnings.toFixed(2)}
                        </div>
                        <div className={`font-bold ${earning.isPredicted ? 'text-muted-foreground' : 'text-foreground'}`}>
                          ${earning.totalEarnings.toFixed(2)}
                        </div>
                        <div>
                          {earning.planName && (
                            <Badge variant="outline" className="text-xs">
                              {earning.planName}
                            </Badge>
                          )}
                          {earning.referralEarnings > 0 && earning.planEarnings > 0 && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              Mixed
                            </Badge>
                          )}
                          {earning.referralEarnings > 0 && earning.planEarnings === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Referral
                            </Badge>
                          )}
                          {earning.planEarnings > 0 && earning.referralEarnings === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Plan
                            </Badge>
                          )}
                        </div>
                        <div>
                          {earning.isPredicted ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              Predicted
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Earnings Yet</h3>
                        <p className="mb-4">You haven't earned anything yet. Purchase a plan to start earning!</p>
                        <Button onClick={() => navigate('/dashboard/deposit')}>
                          Get Started
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-border p-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEarnings.length)} of {filteredEarnings.length} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyWinningsPage;