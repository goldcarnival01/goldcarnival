import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              <span className="gradient-gold bg-clip-text text-transparent">Contact Us</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Get in touch with our team. We're here to help!
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="grid gap-4 sm:gap-6">
                <Input placeholder="Your Name" className="text-sm sm:text-base" />
                <Input type="email" placeholder="Your Email" className="text-sm sm:text-base" />
                <Textarea placeholder="Your Message" className="min-h-[120px] sm:min-h-[140px] text-sm sm:text-base" />
                <Button className="w-full sm:w-fit text-sm sm:text-base py-2.5 sm:py-3">Send Message</Button>
              </div>
            </Card>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 text-center">
              You can also email us at <span className="text-primary">support@goldcarnival.com</span>
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ContactPage;


