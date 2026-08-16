import { AdvantageItem } from "@/components/home/advantage-item";
import { SiteContainer } from "@/components/layout/site-container";
import { HOME_DATA } from "@/data/home";

export function WhyExpressSection() {
  const section = HOME_DATA.advantages;

  return (
    <section
      id={section.id}
      className="relative overflow-hidden rounded-t-[26px] bg-[#021328] py-6 text-white md:rounded-t-[30px] lg:py-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(8,120,255,0.13),transparent_46%)]"
      />

      <SiteContainer className="relative">
        <h2 className="sr-only">
          {section.title}
        </h2>

        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-white/[0.10]">
          {section.items.map((item, index) => (
            <div
              key={item.id}
              className={index === 0 ? "" : "lg:pl-6"}
            >
              <AdvantageItem item={item} />
            </div>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
