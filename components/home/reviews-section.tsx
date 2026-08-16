import Link from "next/link";

import { ReviewCard } from "@/components/home/review-card";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { HOME_DATA } from "@/data/home";
import type { HomeReview } from "@/types/review";

/* ==========================================================================
   ICON
   ========================================================================== */

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
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

/* ==========================================================================
   REVIEWS SECTION
   ========================================================================== */

export function ReviewsSection() {
  const section = HOME_DATA.reviews;

  /**
   * HOME_DATA utilise `as const`.
   *
   * Comme le tableau des avis est vide au démarrage,
   * TypeScript pourrait l'inférer comme `readonly []`.
   *
   * On lui donne donc explicitement le type HomeReview[]
   * afin que la section reste prête à recevoir les avis
   * venant plus tard de l'API / administration.
   */
  const reviews: readonly HomeReview[] = section.items;

  const featuredReviews = reviews.slice(0, 3);

  const hasReviews = featuredReviews.length > 0;

  return (
    <SectionContainer
      id={section.id}
      tone="white"
      spacing="large"
    >
      {/* ---------------------------------------------------------------
          SECTION HEADING
         --------------------------------------------------------------- */}

      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      {/* ---------------------------------------------------------------
          REVIEWS
         --------------------------------------------------------------- */}

      {hasReviews ? (
        <div
          className="
            -mx-4
            mt-9
            flex
            gap-4
            overflow-x-auto
            px-4
            pb-3

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:mx-0
            sm:grid
            sm:grid-cols-2
            sm:overflow-visible
            sm:px-0

            lg:mt-11
            lg:grid-cols-3
          "
        >
          {featuredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </div>
      ) : (
        /* -------------------------------------------------------------
           EMPTY STATE
           ------------------------------------------------------------- */

        <div
          className="
            mx-auto
            mt-9
            max-w-2xl
            rounded-[16px]
            border
            border-dashed
            border-[#D8E2EE]
            bg-[#F8FAFC]
            px-5
            py-8
            text-center
            sm:px-8
          "
        >
          <div
            aria-hidden="true"
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-[#D7E9FF]
              bg-[#EEF6FF]
              text-[#0878FF]
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 8h10" />
              <path d="M7 12h7" />

              <path
                d="
                  M5 4
                  h14
                  a2 2 0 0 1 2 2
                  v10
                  a2 2 0 0 1-2 2
                  h-7
                  l-5 3
                  v-3
                  H5
                  a2 2 0 0 1-2-2
                  V6
                  a2 2 0 0 1 2-2
                  Z
                "
              />
            </svg>
          </div>

          <p className="mt-4 text-[14px] font-bold text-[#071426]">
            Bewertungen unserer Teilnehmer
          </p>

          <p className="mx-auto mt-2 max-w-md text-[12px] leading-5 text-[#66758A] sm:text-[13px]">
            Verifizierte Teilnehmerbewertungen werden hier automatisch
            angezeigt.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------------
          VIEW ALL
         --------------------------------------------------------------- */}

      <div className="mt-6 flex justify-center">
        <Link
          href={section.viewAll.href}
          className="
            inline-flex
            min-h-10
            items-center
            gap-2
            rounded-lg
            px-3

            text-[12px]
            font-semibold
            text-[#0878FF]

            outline-none
            transition-colors

            hover:text-[#006BEA]

            focus-visible:ring-2
            focus-visible:ring-[#0878FF]
            focus-visible:ring-offset-2
          "
        >
          <span>{section.viewAll.label}</span>

          <ArrowRightIcon />
        </Link>
      </div>
    </SectionContainer>
  );
}