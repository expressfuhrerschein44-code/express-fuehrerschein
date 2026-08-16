import { BrandLogo } from "@/components/shared/brand-logo";
import { SiteContainer } from "@/components/layout/site-container";
import { HOME_FOOTER_DATA } from "@/data/footer";
import { APP_NAME } from "@/lib/constants";

export function HomeFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#020914] text-white">
      <SiteContainer className="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-9 lg:grid-cols-[1.25fr_2.75fr] lg:gap-14">
          <div>
            <BrandLogo
              imageClassName="w-[205px] sm:w-[225px]"
            />

            <p className="mt-4 max-w-[310px] text-[12px] leading-6 text-white/58">
              {HOME_FOOTER_DATA.brandDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {HOME_FOOTER_DATA.columns.map((column) => (
              <div key={column.id}>
                <h3 className="text-[12px] font-extrabold text-white">
                  {column.title}
                </h3>

                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.id}-${link.href}-${link.label}`}>
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="rounded-sm text-[11px] leading-5 text-white/55 outline-none transition-colors hover:text-[#1684FF] focus-visible:text-[#1684FF]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.07] pt-5 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {HOME_FOOTER_DATA.copyright}
          </p>

          <p>
            {APP_NAME}
          </p>
        </div>
      </SiteContainer>
    </footer>
  );
}
