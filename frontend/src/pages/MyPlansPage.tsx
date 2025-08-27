import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  Package,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { userPlansAPI } from "@/services/api.js";
import { useToast } from "@/hooks/use-toast";

const MyPlansPage = () => {
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPlans();
  }, []);

  const fetchUserPlans = async () => {
    try {
      setLoading(true);
      const response = await userPlansAPI.getMyPlans();
      console.log('User plans response:', response.data);
      if (response.data.success) {
        console.log('Individual user plans:', response.data.data);
        setUserPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getVerifiedColor = (verified) => {
    if (!verified || verified === '') return 'bg-yellow-100 text-yellow-800';
    
    switch (verified.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getVerifiedIcon = (verified) => {
    if (!verified || verified === '') return <Clock className="w-4 h-4" />;
    
    switch (verified.toLowerCase()) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">My Plans</h1>
              <p className="text-muted-foreground">Manage your purchased plans and view plan details</p>
            </div>

            {userPlans.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Plans Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't purchased any plans yet. Browse our available plans to get started.
                  </p>
                  <Button onClick={() => window.location.href = '/'}>
                    Browse Plans
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userPlans.map((userPlan) => {
                  console.log('Rendering userPlan:', userPlan);
                  console.log('Verified value:', userPlan.verified, 'Type:', typeof userPlan.verified);
                  
                  const verificationStatus = (userPlan.verified || '').toString().toLowerCase();
                  const isApproved = verificationStatus === 'verified' || verificationStatus === 'approved';
                  const isRejected = verificationStatus === 'rejected';
                  const isPending = !isApproved && !isRejected;
                  
                  // Status-based header styling
                  const headerBg = isApproved 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : isPending 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                    : 'bg-gradient-to-r from-red-500 to-red-600';
                  
                  return (
                  <Card key={userPlan.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                    <CardHeader className={`${headerBg} text-white relative`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/20"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">{userPlan.plan.name}</CardTitle>
                          {userPlan.plan.badge && (
                            <Badge className="bg-yellow-400/90 text-yellow-900 font-semibold border-0">
                              {userPlan.plan.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-3xl font-bold mt-2 drop-shadow-sm">
                          ${userPlan.plan.amount ? parseFloat(userPlan.plan.amount).toLocaleString() : '0'}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Payment Status */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status:</span>
                          <Badge className={`${
                            isApproved ? 'bg-green-100 text-green-800 border-green-200' : 
                            isPending ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                            'bg-red-100 text-red-800 border-red-200'
                          } flex items-center gap-1 px-3 py-1 font-medium`}>
                            {isApproved ? <CheckCircle className="w-4 h-4" /> : 
                             isPending ? <Clock className="w-4 h-4" /> : 
                             <XCircle className="w-4 h-4" />}
                            {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                          </Badge>
                        </div>

                        {/* Purchase Date */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Purchased:</span>
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                            <Calendar className="w-4 h-4" />
                            {formatDate(userPlan.purchaseDate)}
                          </div>
                        </div>

                        {/* Expiry Date */}
                        {userPlan.expiryDate && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Expires:</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-800 dark:text-purple-200">
                              <Clock className="w-4 h-4" />
                              {formatDate(userPlan.expiryDate)}
                            </div>
                          </div>
                        )}

                        {/* Purchase Price */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Amount Paid:</span>
                          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                            <DollarSign className="w-4 h-4" />
                            ${userPlan.purchasePrice ? parseFloat(userPlan.purchasePrice).toFixed(2) : '0.00'}
                          </div>
                        </div>

                        {/* Features */}
                        {userPlan.plan.features && userPlan.plan.features.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-2">Features:</h4>
                            <ul className="space-y-1">
                              {userPlan.plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <span>{feature.icon}</span>
                                  <span className="text-muted-foreground">{feature.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}


                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyPlansPage;
