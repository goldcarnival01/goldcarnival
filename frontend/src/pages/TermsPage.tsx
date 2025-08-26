import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TermsPage = () => {
  const effectiveDate = new Date().toISOString().slice(0, 10);
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-secondary text-muted-foreground">
          <span>Legal</span>
          <span className="opacity-70">•</span>
          <span>Terms & Conditions</span>
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold gradient-gold bg-clip-text text-transparent">
          Terms and Conditions
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
      </div>

      {/* Sections */}
      <div className="grid gap-6">
        <Card className="p-6 md:p-8">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            These Terms govern your use of Gold Carnival. By accessing or using the platform,
            you agree to be bound by these Terms.
          </p>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-3">Eligibility</h2>
            <p className="text-muted-foreground">You must be at least 18 years old and legally permitted to use our services.</p>
          </Card>
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-3">Accounts</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintain confidentiality of your credentials.</li>
              <li>Provide accurate and up-to-date information.</li>
            </ul>
          </Card>
        </div>
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Plans, Rewards and Payments</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Plan details, income, and rewards are shown at purchase and may be updated prospectively.</li>
            <li>All payments must be lawful and authorized. Fraudulent activity is prohibited.</li>
          </ul>
        </Card>
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Prohibited Uses</h2>
          <p className="text-muted-foreground">Do not use the platform for illegal activities, abuse, or attempts to compromise security.</p>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-3">Disclaimers</h2>
            <p className="text-muted-foreground">Services are provided on an "as-is" basis without warranties of any kind. We do not guarantee uninterrupted or error-free operation.</p>
          </Card>
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-3">Liability</h2>
            <p className="text-muted-foreground">To the maximum extent permitted by law, JT Global Tech Limited is not liable for indirect, incidental, or consequential damages.</p>
          </Card>
        </div>
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
          <p className="text-muted-foreground">We may update these Terms from time to time. Continued use constitutes acceptance.</p>
          <Separator className="my-6" />
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground">For questions about these Terms, email <a className="text-primary underline" href="mailto:legal@goldcarnival.com">legal@goldcarnival.com</a>.</p>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;


