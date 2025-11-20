import dynamic from "next/dynamic";
import Hero from "../components/home/HeroSection";
import FeaturedProducts from "../components/home/FeaturedProducts";

// Lazy load components that are below the fold
const About = dynamic(() => import("../components/home/AboutSection"), {
  loading: () => <div className="min-h-[400px]" />,
});
const FAQ = dynamic(() => import("../components/home/FAQSection"), {
  loading: () => <div className="min-h-[400px]" />,
});
const FooterSection = dynamic(() => import("@/components/home/FooterSection"), {
  loading: () => <div className="min-h-[200px]" />,
});

export default function HomePage() {
  return (
    <div className="bg-white">
      <Hero />
      <FeaturedProducts />
      <About />
      <FAQ />
      <FooterSection />
    </div>
  );
}
