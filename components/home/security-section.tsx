import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { IconCircle } from "@/components/ui/icon-circle";
import { HOME_DATA } from "@/data/home";

export function SecuritySection() {
  const section = HOME_DATA.security;

  return (
    <SectionContainer
      id={section.id}
      tone="light"
      spacing="large"
    >
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-11 lg:grid-cols-4">
        {section.items.map((item) => (
          <article
            key={item.id}
            className="rounded-[16px] border border-[#E1E7EF] bg-white p-5 shadow-[0_8px_24px_rgba(17,40,70,0.04)]"
          >
            <IconCircle
              name={item.icon.name}
              tone="blue"
              size="md"
            />

            <h3 className="mt-4 text-[15px] font-extrabold text-[#071426]">
              {item.title}
            </h3>

            <p className="mt-2 text-[12px] leading-5 text-[#66758A]">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
