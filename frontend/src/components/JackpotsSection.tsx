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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium mb-4 tracking-wider uppercase">
            FOR YOUR GOLD-SIZED DREAMS
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold gradient-gold bg-clip-text text-transparent">
            OUR EXCLUSIVE PLANS
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {exclusivePlans.map((plan, index) => (
            <Card key={plan.id || index} className="relative bg-card border-border p-8 group hover:shadow-gold-lg transition-all duration-500">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
                  {plan.type}
                </div>
              </div>

              {/* Daily surprise badge */}
              {plan.badge && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-amber-500 text-black px-3 py-1 rounded-lg text-xs font-bold transform rotate-12">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="text-center mb-8 mt-4">
                <h3 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  ${parseFloat(plan.amount).toLocaleString()}
                </h3>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features && plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-sm text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button variant="gold" className="w-full text-base font-bold" onClick={() => handleBuyNow(plan)}>
                BUY NOW
              </Button>
            </Card>
          ))}
        </div>

        {/* Premium Plan Section */}
        {premiumPlans.length > 0 && (
          <>
            <div className="text-center mt-20 mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent">
                OUR PREMIUM PLAN
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {premiumPlans.map((plan, index) => (
                <Card
                  key={plan.id || index}
                  className="relative bg-card border-border p-8 group hover:shadow-gold-lg transition-all duration-500"
                >
                  <div className="text-center mb-8 mt-4">
                    <h4 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                      ${parseFloat(plan.amount).toLocaleString()}
                    </h4>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features && plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <span className="text-sm text-muted-foreground">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="gold" className="w-full text-base font-bold" onClick={() => handleBuyNow(plan)}>
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