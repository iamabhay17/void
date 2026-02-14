import { Container } from "@/components/molecules/container";
import * as Fade from "@/components/motion/fade";
import { Badge } from "@/components/ui/badge";

export default function Playground() {
  return (
    <Fade.Container>
      <Container className="mb-30">
        {/* Header */}
        <header className="mb-12 mt-4">
          <Fade.Item>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Badge variant="secondary">Code</Badge>
              <Badge variant="secondary">Craft</Badge>
              <Badge variant="secondary">Animations</Badge>
            </div>
          </Fade.Item>
          <Fade.Item>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty mb-4">
              Crafting interfaces &amp; Animations
            </h1>
          </Fade.Item>
          <Fade.Item>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              A collection of UI components I’ve built to deepen my
              understanding of interface craft, visual clarity, and purposeful
              motion.
            </p>
          </Fade.Item>
        </header>

        {/* Section Header */}
        <section>
          <Fade.Item>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                All Projects
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="text-center border rounded-sm py-12">
              <p className="text-sm text-muted-foreground">
                Cooking something new. Check back soon!
              </p>
            </div>
          </Fade.Item>
        </section>
      </Container>
    </Fade.Container>
  );
}
