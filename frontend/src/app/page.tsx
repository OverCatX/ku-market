import Hero from "../components/home/HeroSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import About from "../components/home/AboutSection";
import FAQ from "../components/home/FAQSection";

export default function HomePage() {
  return (
    <div className="bg-gray-50">
      <Hero />
      <FeaturedProducts />
      <About />
      <FAQ />
    </div>
  );
}
