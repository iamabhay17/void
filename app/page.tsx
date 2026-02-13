import { Container } from "@/components/molecules/container";
import { BlogsSection } from "@/components/sections/blogs-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { GithubSection } from "@/components/sections/github-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialsSection } from "@/components/sections/socials-section";

export const Homepage = () => {
  return (
    <Container className="mb-30">
      <HeroSection />
      <ExperienceSection />
      <GithubSection />
      <BlogsSection />
      <SocialsSection />
    </Container>
  );
};

export default Homepage;
