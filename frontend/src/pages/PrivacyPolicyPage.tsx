import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicyPage = () => {
  const lastUpdated = new Date().toISOString().slice(0, 10);
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-secondary text-muted-foreground">
          <span>Legal</span>
          <span className="opacity-70">•</span>
          <span>Privacy Policy</span>
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold gradient-gold bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      {/* Intro */}
      <Card className="p-6 md:p-8 bg-card/80 border-border mb-8 shadow-gold">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          This Privacy Policy explains how JT Global Tech Limited ("Gold Carnival", "we", "us")
          collects, uses, and protects your information when you use our website and services.
        </p>
      </Card>

      {/* Content */}
      <div className="grid gap-6">
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Account data: email, member ID, profile details</li>
            <li>Transactional data related to deposits, withdrawals, and plan purchases</li>
            <li>Technical data: IP address, device/browser info, and cookies</li>
          </ul>
        </Card>

        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To provide and maintain the platform and your account</li>
            <li>To process payments and comply with legal obligations</li>
            <li>To prevent fraud, secure our services, and improve user experience</li>
          </ul>
        </Card>

        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell personal data. We may share data with payment processors, cloud
            providers, analytics, and law enforcement where required.
          </p>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain data as long as your account is active and as required by applicable laws and
              regulations.
            </p>
          </Card>
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access, correction, and deletion of your personal data</li>
              <li>Withdraw consent where applicable</li>
              <li>File a complaint with your data protection authority</li>
            </ul>
          </Card>
        </div>

        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground">
            For privacy requests, contact us at
            {" "}
            <a className="text-primary underline" href="mailto:privacy@goldcarnival.com">privacy@goldcarnival.com</a>.
          </p>
          <Separator className="my-6" />
          <p className="text-xs text-muted-foreground">JT Global Tech Limited • Gold Carnival</p>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;


