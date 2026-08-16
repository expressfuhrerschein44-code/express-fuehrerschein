import { LicenseClassCard } from "@/components/home/license-class-card";
import { SiteContainer } from "@/components/layout/site-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { HOME_DATA } from "@/data/home";

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export function LicenseClassesSection() {
  const section = HOME_DATA.licenseClasses;

  return (
    <section
      id={section.id}
      className="bg-white py-7 sm:py-9 lg:py-10"
    >
      <SiteContainer>
        <SectionHeading
          title={section.title}
          subtitle={section.subtitle}
          className="mb-5 sm:mb-6"
          titleClassName="text-[22px] sm:text-[25px] lg:text-[28px]"
          subtitleClassName="mt-1.5 text-[11px] sm:text-[12px]"
        />

        <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex min-w-max gap-2.5 sm:grid sm:min-w-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5">
            {section.items.map((item) => (
              <LicenseClassCard
                key={item.id}
                item={item}
                selected={item.selectedByDefault}
                compact
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex justify-center sm:mt-4">
          <a
            href={section.viewAll.href}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold text-[#0878FF] outline-none transition-colors hover:text-[#006BEA] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            {section.viewAll.label}
            <ArrowRightIcon />
          </a>
        </div>
      </SiteContainer>
    </section>
  );
}
