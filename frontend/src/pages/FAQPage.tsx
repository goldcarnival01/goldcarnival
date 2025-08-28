import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const FAQPage = () => {
  const faqs = [
    { q: 'What is Gold Carnival?', a: 'Gold Carnival is a platform offering exclusive and premium plans with gamified rewards and jackpots.' },
    { q: 'How do I buy a plan?', a: 'Create an account, log in, and go to Dashboard -> Deposit. Choose a plan and follow the payment flow.' },
    { q: 'How are rewards calculated?', a: 'Each plan lists its monthly income and any bonus rewards. Rewards accrue as per the plan terms.' },
    { q: 'Can I cancel my plan?', a: 'You may cancel active plans from Dashboard -> My Plans subject to plan rules.' },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              <span className="gradient-gold bg-clip-text text-transparent">Frequently Asked Questions</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Find answers to common questions about Gold Carnival
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-3 sm:gap-4">
              {faqs.map((f, i) => (
                <Card key={i} className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground">{f.q}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{f.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default FAQPage;


