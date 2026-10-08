import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Services from "../components/sections/Services";
import Pricing from "../components/sections/Pricing";
import FinalCTA from "../components/FinalCTA";

export default function Home() {
  return <>
    <Hero />
    <About preview />
    <Services preview />
    <Pricing preview />
    <FinalCTA />
  </>;
}
