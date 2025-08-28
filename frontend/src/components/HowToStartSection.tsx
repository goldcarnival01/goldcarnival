import { Card } from "@/components/ui/card";
import { UserPlus, CreditCard, Wallet } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "SIGN UP",
    description: "Create your account.",
    color: "text-green-500"
  },
  {
    icon: CreditCard,
    title: "BUY PLAN",
    description: "Choose your slab & purchase your plan.",
    color: "text-blue-500"
  },
  {
    icon: Wallet,
    title: "GET PAID",
    description: "Wait and let's start earning.",
    color: "text-purple-500"
  }
];

const HowToStartSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4 tracking-wider uppercase">
            JOIN IN 3 SIMPLE STEPS
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold gradient-gold bg-clip-text text-transparent">
            HOW TO JOIN
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="bg-card border-border p-4 sm:p-6 lg:p-8 text-center group hover:shadow-gold transition-all duration-300 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary mb-4 sm:mb-6 ${step.color}`}>
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  {step.title}
                </h3>
                
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step number */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm">
                {index + 1}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToStartSection;