import { Card } from "@/components/ui/card";

const FAQPage = () => {
  const faqs = [
    { q: 'What is Gold Carnival?', a: 'Gold Carnival is a platform offering exclusive and premium plans with gamified rewards and jackpots.' },
    { q: 'How do I buy a plan?', a: 'Create an account, log in, and go to Dashboard -> Deposit. Choose a plan and follow the payment flow.' },
    { q: 'How are rewards calculated?', a: 'Each plan lists its monthly income and any bonus rewards. Rewards accrue as per the plan terms.' },
    { q: 'Can I cancel my plan?', a: 'You may cancel active plans from Dashboard -> My Plans subject to plan rules.' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="grid gap-4">
        {faqs.map((f, i) => (
          <Card key={i} className="p-6">
            <h2 className="text-lg font-semibold mb-2">{f.q}</h2>
            <p className="text-sm text-muted-foreground">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;


