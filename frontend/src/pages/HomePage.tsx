import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import JackpotsSection from "@/components/JackpotsSection";
import HowToStartSection from "@/components/HowToStartSection";
import GoldIntroSection from "@/components/GoldIntroSection";
import Footer from "@/components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <JackpotsSection />
      <HowToStartSection />
      <GoldIntroSection />
      <Footer />
    </div>
  );
};

export default HomePage;