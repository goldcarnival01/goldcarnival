import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { plansAPI } from "@/services/api.js";

const JackpotsSection = () => {
  const [exclusivePlans, setExclusivePlans] = useState([]);
  const [premiumPlans, setPremiumPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBuyNow = (plan: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Redirect authenticated users to payment/deposit page with plan context
    const target = plan?.id ? `/dashboard/deposit?planId=${plan.id}` : '/dashboard/deposit';
    navigate(target);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        // Fetch exclusive plans
        const exclusiveResponse = await plansAPI.getAll({ category: 'EXCLUSIVE_PLAN' });
        if (exclusiveResponse.data.success) {
          setExclusivePlans(exclusiveResponse.data.data);
        }

        // Fetch premium plans
        const premiumResponse = await plansAPI.getAll({ category: 'PREMIUM_PLAN' });
        if (premiumResponse.data.success) {
          setPremiumPlans(premiumResponse.data.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);
  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading plans...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4 tracking-wider uppercase">
            FOR YOUR GOLD-SIZED DREAMS
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold gradient-gold bg-clip-text text-transparent">
            OUR EXCLUSIVE PLANS
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {exclusivePlans.map((plan, index) => (
            <Card key={plan.id || index} className="relative bg-card border-border p-2 sm:p-6 lg:p-8 group hover:shadow-gold-lg transition-all duration-500">
              {/* Badge */}
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap">
                  {plan.type}
                </div>
              </div>

              {/* Daily surprise badge */}
              {plan.badge && (
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                  <div className="bg-amber-500 text-black px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transform rotate-12">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="text-center mb-3 sm:mb-8 mt-2 sm:mt-4">
                <h3 className="text-lg sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-4">
                  ${parseFloat(plan.amount).toLocaleString()}
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-4 mb-3 sm:mb-8">
                {plan.features && plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-1 sm:space-x-3">
                    <span className="text-sm sm:text-xl lg:text-2xl flex-shrink-0">{feature.icon}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button variant="gold" className="w-full text-xs sm:text-base font-bold py-2 sm:py-3" onClick={() => handleBuyNow(plan)}>
                BUY NOW
              </Button>
            </Card>
          ))}
        </div>

        {/* Premium Plan Section */}
        {premiumPlans.length > 0 && (
          <>
            <div className="text-center mt-12 sm:mt-16 lg:mt-20 mb-8 sm:mb-12">
              <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold gradient-gold bg-clip-text text-transparent">
                OUR PREMIUM PLAN
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
              {premiumPlans.map((plan, index) => (
                <Card
                  key={plan.id || index}
                  className="relative bg-card border-border p-2 sm:p-6 lg:p-8 group hover:shadow-gold-lg transition-all duration-500"
                >
                  <div className="text-center mb-3 sm:mb-8 mt-2 sm:mt-4">
                    <h4 className="text-lg sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-4">
                      ${parseFloat(plan.amount).toLocaleString()}
                    </h4>
                  </div>

                  <div className="space-y-2 sm:space-y-4 mb-3 sm:mb-8">
                    {plan.features && plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-1 sm:space-x-3">
                        <span className="text-sm sm:text-xl lg:text-2xl flex-shrink-0">{feature.icon}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="gold" className="w-full text-xs sm:text-base font-bold py-2 sm:py-3" onClick={() => handleBuyNow(plan)}>
                    BUY NOW
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      
    </section>
  );
};

export default JackpotsSection;