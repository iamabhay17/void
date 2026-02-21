import { Container } from "@/components/molecules/container";
import { BlogsSection } from "@/components/sections/blogs-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { GithubSection } from "@/components/sections/github-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialsSection } from "@/components/sections/socials-section";
import * as Fade from "@/components/motion/fade";
import { SkillsSection } from "@/components/sections/skills-section";

export const Homepage = () => {
  return (
    <Container className="mb-30">
      <Fade.Container>
        <HeroSection />
        <GithubSection />
        <ExperienceSection />
        <SkillsSection />
        <BlogsSection />
        <SocialsSection />
      </Fade.Container>
    </Container>
  );
};

export default Homepage;
