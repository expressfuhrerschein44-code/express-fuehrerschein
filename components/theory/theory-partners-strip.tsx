import Image from "next/image";

const partners = [
  {
    id: "dekra",
    name: "DEKRA",
    src: "/images/home/partners/dekra.webp",
    caption: "Geprüfte Qualität",
    width: 92,
    height: 30,
  },
  {
    id: "tuev",
    name: "TÜV",
    src: "/images/home/partners/tuv.webp",
    caption: "Geprüfte Standards",
    width: 82,
    height: 30,
  },
  {
    id: "kba",
    name: "KBA",
    src: "/images/home/partners/kba.webp",
    caption: "Anerkannt durch KBA",
    width: 76,
    height: 30,
  },
] as const;

export function TheoryPartnersStrip() {
  return (
    <section
      aria-label="Vertrauen und Qualität"
      className="hidden items-center justify-center gap-5 rounded-[14px] border border-[#E5EAF2] bg-white px-5 py-3 lg:flex"
    >
      {/* Intro */}
      <div className="mr-1 shrink-0">
        <p className="text-[9px] font-extrabold text-[#081529]">
          Vertrauen durch geprüfte Qualität
        </p>

        <p className="mt-0.5 max-w-[190px] text-[7px] leading-3 text-[#7A899C]">
          Inhalte und Standards nach verfügbarer Konfiguration.
        </p>
      </div>

      {/* Partners */}
      <div className="flex items-center">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="flex min-w-[90px] flex-col items-center border-l border-[#EDF1F6] px-5"
          >
            <div className="flex h-6 w-full items-center justify-center">
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className="max-h-5 max-w-[72px] object-contain"
              />
            </div>

            <span className="mt-1 whitespace-nowrap text-center text-[7px] font-medium leading-3 text-[#6E7D91]">
              {partner.caption}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}