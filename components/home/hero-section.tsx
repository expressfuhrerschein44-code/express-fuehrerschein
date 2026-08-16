import Image from "next/image";

import { HeroBenefits } from "@/components/home/hero-benefits";
import { HeroTrustBar } from "@/components/home/hero-trust-bar";
import { SiteContainer } from "@/components/layout/site-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HOME_DATA } from "@/data/home";
import { HOME_SECTION_IDS } from "@/lib/constants";

/* ==========================================================================
   ICONS
   ========================================================================== */

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[19px] w-[19px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        d="m10 8 6 4-6 4V8Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/* ==========================================================================
   HERO
   ========================================================================== */

export function HeroSection() {
  const {
    hero,
    trust,
  } = HOME_DATA;

  return (
    <section
      id={HOME_SECTION_IDS.hero}
      className="
        relative
        isolate
        min-h-[600px]
        overflow-hidden
        bg-[#020914]
        text-white
      "
    >
      {/* ==================================================================
          BACKGROUND IMAGES

          IMPORTANT:
          Le conteneur est réellement absolute + inset-0.
          Les Next Images en fill ont donc toujours une surface à remplir.
         ================================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          z-0
          h-full
          w-full
        "
      >
        {/* MOBILE IMAGE */}

        <Image
          src={hero.mobileImage.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            block
            object-cover
            object-center
            md:hidden
          "
        />

        {/* DESKTOP IMAGE */}

        <Image
          src={hero.desktopImage.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            hidden
            object-cover
            md:block
          "
          style={{
            objectPosition: "center center",
          }}
        />
      </div>

      {/* ==================================================================
          DESKTOP LEFT GRADIENT

          Le texte reste lisible à gauche.
          La partie droite reste suffisamment claire
          pour voir la voiture et Berlin.
         ================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          hidden
          md:block

          bg-[linear-gradient(90deg,rgba(2,9,20,0.98)_0%,rgba(2,9,20,0.94)_25%,rgba(2,9,20,0.78)_40%,rgba(2,9,20,0.42)_55%,rgba(2,9,20,0.12)_72%,rgba(2,9,20,0.02)_100%)]
        "
      />

      {/* ==================================================================
          DESKTOP BOTTOM GRADIENT
         ================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-10
          hidden
          h-[190px]
          md:block

          bg-[linear-gradient(180deg,rgba(2,9,20,0)_0%,rgba(2,9,20,0.35)_55%,rgba(2,9,20,0.80)_100%)]
        "
      />

      {/* ==================================================================
          MOBILE GRADIENT
         ================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          md:hidden

          bg-[linear-gradient(180deg,rgba(2,9,20,0.98)_0%,rgba(2,9,20,0.92)_30%,rgba(2,9,20,0.65)_50%,rgba(2,9,20,0.16)_70%,rgba(2,9,20,0.68)_100%)]
        "
      />

      {/* ==================================================================
          CONTENT
         ================================================================== */}

      <SiteContainer
        className="
          relative
          z-20

          flex
          min-h-[600px]
          flex-col

          pb-5
          pt-10

          sm:min-h-[640px]
          sm:pt-12

          md:min-h-[590px]
          md:pt-14

          lg:min-h-[600px]
          lg:pt-[66px]

          xl:min-h-[620px]
        "
      >
        {/* ================================================================
            TEXT AREA
           ================================================================ */}

        <div
          className="
            relative
            z-20

            max-w-[720px]

            md:max-w-[600px]
            lg:max-w-[650px]
            xl:max-w-[700px]
          "
        >
          {/* BADGE */}

          <Badge
            variant="hero"
            dot
            className="
              max-w-full
              whitespace-normal
              text-left
            "
          >
            {hero.badge}
          </Badge>

          {/* TITLE */}

          <h1
            className="
              mt-5

              max-w-[750px]

              text-[38px]
              font-extrabold
              leading-[1.02]
              tracking-[-0.045em]

              sm:text-[48px]
              md:text-[48px]
              lg:text-[54px]
              xl:text-[58px]
            "
          >
            <span className="block text-white">
              {hero.title}
            </span>

            <span className="mt-1 block text-[#0878FF]">
              {hero.highlight}
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mt-4
              max-w-[560px]

              text-[14px]
              leading-6
              text-white/88

              sm:text-[15px]
              md:text-base
            "
          >
            {hero.description}
          </p>

          {/* BENEFITS */}

          <HeroBenefits
            items={hero.benefits}
            className="mt-5"
          />

          {/* CTAS */}

          <div
            className="
              mt-6
              grid
              gap-3

              sm:flex
              sm:items-center
            "
          >
            <Button
              href={hero.primaryCta.href}
              aria-label={
                hero.primaryCta.ariaLabel
              }
              size="lg"
              fullWidth
              iconRight={
                <ArrowRightIcon />
              }
              className="
                sm:w-auto
                sm:min-w-[166px]
              "
            >
              {hero.primaryCta.label}
            </Button>

            <Button
              href={hero.secondaryCta.href}
              aria-label={
                hero.secondaryCta.ariaLabel
              }
              variant="secondary"
              size="lg"
              fullWidth
              iconRight={
                <PlayCircleIcon />
              }
              className="
                sm:w-auto
                sm:min-w-[164px]
              "
            >
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        {/* ================================================================
            TRUST BAR
           ================================================================ */}

        <HeroTrustBar
          data={trust}
          className="
            relative
            z-20
            mt-auto
          "
        />
      </SiteContainer>
    </section>
  );
}