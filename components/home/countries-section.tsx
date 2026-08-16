import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { HOME_DATA } from "@/data/home";

export function CountriesSection() {
  const section = HOME_DATA.countries;

  return (
    <SectionContainer
      id={section.id}
      tone="light"
      spacing="default"
    >
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {section.items.map((country) => (
          <a
            key={country.code}
            href={country.href ?? "#"}
            className="ef-interactive relative flex min-h-[88px] flex-col items-center justify-center rounded-[14px] border border-[#E0E7EF] bg-white px-3 text-center outline-none hover:-translate-y-0.5 hover:border-[#BED9FB] hover:shadow-[0_10px_25px_rgba(17,40,70,0.06)] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            {country.primary ? (
              <span className="absolute right-2 top-2 rounded-full bg-[#EAF3FF] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.05em] text-[#0878FF]">
                Hauptmarkt
              </span>
            ) : null}

            <span
              aria-hidden="true"
              className="text-2xl"
            >
              {country.flag}
            </span>

            <span className="mt-2 text-[12px] font-bold text-[#071426]">
              {country.name}
            </span>
          </a>
        ))}
      </div>
    </SectionContainer>
  );
}
