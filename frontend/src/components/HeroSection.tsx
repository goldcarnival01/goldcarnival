import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroWinner from "@/assets/hero-winner.jpg";
import pot from "@/assets/pot.png";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const slides = [
    {
      title: "Let it grow while you sleep!",
      subtitle: "Your money should work harder than you do."
    },
    {
      title:
        "You can earn steady, reliable returns while protecting your wealth.",
      subtitle: "Gold never loses its shine."
    },
    {
      title: "Wealth isn’t luck, it’s strategy. (So let’s start)",
      subtitle: "You can earn too."
    }
  ];

  const [current, setCurrent] = useState(0);

  const goPrev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const goNext = () => setCurrent((c) => (c + 1) % slides.length);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      
      {/* Hero Image */}
      <div className="absolute right-0 top-0 h-full w-1/2 lg:w-2/3">
        <img 
          src={pot} 
          alt="Winner celebrating" 
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-medium mb-4 tracking-wider uppercase">
            A CHANCE TO CHANGE YOUR FORTUNES
          </p>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-gold bg-clip-text text-transparent">
              {slides[current].title}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {slides[current].subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="gold-outline" size="lg" className="text-base px-8">
              VIEW JACKPOTS
            </Button>
            <Button variant="gold" size="lg" className="text-base px-8">
              JOIN NOW
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background/20 hover:bg-background/40 transition-colors">
        <ChevronLeft className="w-6 h-6 text-primary" />
      </button>
      <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background/20 hover:bg-background/40 transition-colors">
        <ChevronRight className="w-6 h-6 text-primary" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`w-8 h-1 rounded transition-colors ${
              current === idx ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;