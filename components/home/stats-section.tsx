import { StatItem } from "@/components/home/stat-item";
import { SiteContainer } from "@/components/layout/site-container";
import { HOME_DATA } from "@/data/home";
import { HOME_SECTION_IDS } from "@/lib/constants";

export function StatsSection() {
  return (
    <section
      id={HOME_SECTION_IDS.stats}
      className="relative z-10 bg-white"
      aria-label="Express-Führerschein Statistiken"
    >
      <div className="overflow-hidden rounded-t-[26px] border-b border-[#E8EDF3] bg-white md:rounded-t-[30px]">
        <SiteContainer className="px-0 sm:px-4 md:px-6">
          <div className="grid grid-cols-2 divide-x divide-y divide-[#E8EDF3] sm:divide-y-0 lg:grid-cols-4">
            {HOME_DATA.stats.items.map((item) => (
              <StatItem
                key={item.id}
                item={item}
              />
            ))}
          </div>
        </SiteContainer>
      </div>
    </section>
  );
}
