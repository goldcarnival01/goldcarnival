import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <Card className="p-6 max-w-2xl">
        <div className="grid gap-4">
          <Input placeholder="Your Name" />
          <Input type="email" placeholder="Your Email" />
          <Textarea placeholder="Your Message" className="min-h-[140px]" />
          <Button className="w-fit">Send Message</Button>
        </div>
      </Card>
      <p className="text-sm text-muted-foreground mt-6">
        You can also email us at support@goldcarnival.com
      </p>
    </div>
  );
};

export default ContactPage;


