import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Users, DollarSign, Gift, Infinity } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { referralAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const ReferEarnPage = () => {
  const { isAuthenticated } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<{ totalReferrals: number; totalCommission: number; commissionCount: number } | null>(null);

  useEffect(() => {
    const loadReferral = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const [linkRes, statsRes] = await Promise.allSettled([
          referralAPI.getLink(),
          referralAPI.getStats(),
        ]);
        const linkData = linkRes.status === 'fulfilled' ? linkRes.value.data : {};
        const s = statsRes.data?.stats || statsRes.data;
        setReferralCode(linkData?.referralCode || '');
        setReferralLink(linkData?.referralLink || '');
        setStatsData({
          totalReferrals: Number((s as any)?.totalReferrals || 0),
          totalCommission: Number((s as any)?.totalCommission || 0),
          commissionCount: Number((s as any)?.commissionCount || 0),
        });
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadReferral();
  }, [isAuthenticated]);

  const copyReferralCode = () => {
    const link = referralLink || `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn $10 Per Referral",
      description: "Get $10 when a friend registers with your link and completes one plan purchase.",
      color: "text-green-500"
    },
    {
      icon: Infinity,
      title: "Unlimited Referrals",
      description: "No limit to how many people you can refer.",
      color: "text-blue-500"
    },
    {
      icon: Gift,
      title: "Team Milestone Bonus",
      description: "Build a team of 50 members to unlock a $200 fixed payout plus $150 commission.",
      color: "text-purple-500"
    }
  ];

  const stats = useMemo(() => ([
    { label: "Total Referrals", value: String(statsData?.totalReferrals ?? 0), icon: Users },
    { label: "Total Earnings", value: `$${(statsData?.totalCommission ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "This Month", value: "$0.00", icon: Gift }
  ]), [statsData]);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="gradient-gold bg-clip-text text-transparent">
                REFER & EARN
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Share the excitement with friends and earn $10 for every successful referral—plus milestone bonuses as your team grows.
            </p>
          </div>
        </div>
      </section>

      {/* Referral Rewards Info */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Card className="bg-card border-border p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Referral Rewards
            </h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-3">
              <li>
                Earn <span className="text-foreground font-semibold">$10</span> when someone signs up using your referral link and completes one plan purchase.
              </li>
              <li>
                Reach a team size of <span className="text-foreground font-semibold">50 members</span> to unlock a <span className="text-foreground font-semibold">$200 fixed payout</span> plus an additional <span className="text-foreground font-semibold">$150 commission</span>.
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Referral Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card border-border p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 gradient-gold rounded-lg mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Referral Link */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="bg-card border-border p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Your Referral Link
              </h3>
              {isAuthenticated ? (
                <>
                  <div className="flex gap-2">
                    <Input 
                      value={(referralLink || (referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : ''))}
                      readOnly
                      className="bg-secondary border-border"
                    />
                    <Button onClick={copyReferralCode} variant="gold" disabled={!referralCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Share this link with friends to start earning commissions
                  </p>
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  Please log in to generate your referral link.
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent mb-4">
              Why Join Our Referral Program?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our referral program offers some of the best rewards in the industry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-card border-border p-8 text-center group hover:shadow-gold transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6 ${benefit.color}`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Share Your Link</h3>
                <p className="text-muted-foreground">Copy and share your unique referral link with friends</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Friends Sign Up</h3>
                <p className="text-muted-foreground">Your friends create accounts using your referral link</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Earn Commissions</h3>
                <p className="text-muted-foreground">Get 10% commission on all their ticket purchases</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReferEarnPage;