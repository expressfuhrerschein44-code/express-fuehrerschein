/**
 * Express-Führerschein
 * Home page composition types
 *
 * These interfaces define the shape expected by Home components.
 * They contain presentation/business-content metadata only.
 * Real values can later come from API/CMS without rewriting components.
 */

import type { Country } from "@/types/country";
import type { HomeLicenseClass } from "@/types/license-class";
import type { HomeReview } from "@/types/review";

/* -------------------------------------------------------------------------- */
/* Generic shared structures                                                   */
/* -------------------------------------------------------------------------- */

export interface HomeLink {
  label: string;
  href: string;
  ariaLabel?: string;
  external?: boolean;
}

export interface HomeImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export interface HomeIconReference {
  /**
   * Semantic icon key resolved by the component.
   * Example: "check", "clock", "shield", "support".
   */
  name: string;
  ariaHidden?: boolean;
}

export interface HomeSectionBase {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/* -------------------------------------------------------------------------- */
/* Navigation / Header                                                         */
/* -------------------------------------------------------------------------- */

export interface HomeNavigationItem {
  id: string;
  label: string;
  href: string;
}

export interface HomeHeaderData {
  navigation: readonly HomeNavigationItem[];
  startCta: HomeLink;
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                         */
/* -------------------------------------------------------------------------- */

export interface HeroBenefit {
  id: string;
  label: string;
  icon?: HomeIconReference;
}

export interface HeroData {
  badge: string;
  title: string;
  highlight: string;
  description: string;

  benefits: readonly HeroBenefit[];

  primaryCta: HomeLink;
  secondaryCta: HomeLink;

  desktopImage: HomeImage;
  mobileImage: HomeImage;
}

/* -------------------------------------------------------------------------- */
/* Trust                                                                        */
/* -------------------------------------------------------------------------- */

export type TrustPartnerKey = "dekra" | "tuev" | "kba" | "trustpilot";

export interface TrustPartner {
  id: string;
  key: TrustPartnerKey | (string & {});
  name: string;
  label?: string;

  logo: HomeImage;

  rating?: {
    value: string;
    reviewCountLabel?: string;
  };

  href?: string;
}

export interface HomeTrustData {
  title: string;
  partners: readonly TrustPartner[];
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                   */
/* -------------------------------------------------------------------------- */

export interface HomeStat {
  id: string;
  value: string;
  label: string;
  icon?: HomeIconReference;
}

export interface HomeStatsData {
  items: readonly HomeStat[];
}

/* -------------------------------------------------------------------------- */
/* Licence classes                                                              */
/* -------------------------------------------------------------------------- */

export interface HomeLicenseClassesData extends HomeSectionBase {
  items: readonly HomeLicenseClass[];
  viewAll: HomeLink;
}

/* -------------------------------------------------------------------------- */
/* Why Express                                                                  */
/* -------------------------------------------------------------------------- */

export interface HomeAdvantage {
  id: string;
  title: string;
  description: string;
  icon: HomeIconReference;
}

export interface HomeAdvantagesData extends HomeSectionBase {
  items: readonly HomeAdvantage[];
}

/* -------------------------------------------------------------------------- */
/* 21-day programme                                                             */
/* -------------------------------------------------------------------------- */

export interface ProgramPhase {
  id: string;
  days: string;
  title: string;
  description: string;
  step: number;
}

export interface Program21Data extends HomeSectionBase {
  phases: readonly ProgramPhase[];
  cta: HomeLink;
}

/* -------------------------------------------------------------------------- */
/* How it works                                                                 */
/* -------------------------------------------------------------------------- */

export interface HowItWorksStep {
  id: string;
  number: string;
  title: string;
  description: string;
  icon?: HomeIconReference;
}

export interface HowItWorksData extends HomeSectionBase {
  steps: readonly HowItWorksStep[];
}

/* -------------------------------------------------------------------------- */
/* Security                                                                     */
/* -------------------------------------------------------------------------- */

export interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: HomeIconReference;
}

export interface SecurityData extends HomeSectionBase {
  items: readonly SecurityFeature[];
}

/* -------------------------------------------------------------------------- */
/* Reviews                                                                      */
/* -------------------------------------------------------------------------- */

export interface ReviewsData extends HomeSectionBase {
  items: readonly HomeReview[];
  viewAll: HomeLink;
}

/* -------------------------------------------------------------------------- */
/* Countries                                                                    */
/* -------------------------------------------------------------------------- */

export interface CountriesData extends HomeSectionBase {
  items: readonly Country[];
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                          */
/* -------------------------------------------------------------------------- */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqData extends HomeSectionBase {
  items: readonly FaqItem[];
  viewAll: HomeLink;
}

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                    */
/* -------------------------------------------------------------------------- */

export interface FinalCtaData {
  id: string;
  title: string;
  subtitle: string;
  cta: HomeLink;
  note?: string;
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                       */
/* -------------------------------------------------------------------------- */

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: readonly FooterLink[];
}

export interface FooterData {
  brandDescription: string;
  columns: readonly FooterColumn[];
  copyright: string;
}

/* -------------------------------------------------------------------------- */
/* Complete Home model                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Complete data contract for the public Home.
 *
 * Components can consume individual sections or this full object.
 */
export interface HomePageData {
  header: HomeHeaderData;
  hero: HeroData;
  trust: HomeTrustData;
  stats: HomeStatsData;
  licenseClasses: HomeLicenseClassesData;
  advantages: HomeAdvantagesData;
  program21: Program21Data;
  howItWorks: HowItWorksData;
  security: SecurityData;
  reviews: ReviewsData;
  countries: CountriesData;
  faq: FaqData;
  finalCta: FinalCtaData;
  footer: FooterData;
}
