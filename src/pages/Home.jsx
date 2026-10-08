import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Services from "../components/sections/Services";
import Pricing from "../components/sections/Pricing";
import FinalCTA from "../components/FinalCTA";
import HomeOverview from "../components/sections/HomeOverview";
import TestimonialsFAQ from "../components/sections/TestimonialsFAQ";

export default function Home() {
  return <>
    <Hero />
    <About preview />
    <HomeOverview />
    <Services preview />
    <Pricing preview />
    <TestimonialsFAQ />
    <FinalCTA />
  </>;
}
