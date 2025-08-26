import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-20 pb-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="gradient-gold bg-clip-text text-transparent">About Us</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover our mission and the principles behind Gold Carnival.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-card border-border p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Secure, Transparent, Growth‑Focused</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our team has designed a secure, transparent, and growth‑focused gold investment plan tailored to the needs of modern investors.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Why Gold?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We present an opportunity to participate in a business that revolves around one of the most trusted and time‑tested assets in human history: gold.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Refer & Earn</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Earn <span className="text-foreground font-semibold">$10</span> when someone signs up using your referral link and completes one plan purchase.
                  </li>
                  <li>
                    Build a team of <span className="text-foreground font-semibold">50 members</span> to unlock a <span className="text-foreground font-semibold">$200 fixed payout</span> plus an additional <span className="text-foreground font-semibold">$150 commission</span>.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Support</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Round‑the‑clock customer support (24/7). Withdrawals are typically completed within 1 to 6 hours.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Get in Touch</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Email: support@goldcarnival.com • Phone: +44 7537185219
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;


