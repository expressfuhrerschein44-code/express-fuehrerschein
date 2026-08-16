"use client";

import Link from "next/link";

import {
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  ADMIN_NAVIGATION,
} from "@/components/admin/admin-navigation";

import type {
  AdminIdentity,
} from "@/types/admin";

export interface AdminSidebarProps {
  admin: AdminIdentity;
  onNavigate?: () => void;
  mobile?: boolean;
}

function isActiveHref(
  pathname: string,
  href: string,
): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}

export function AdminSidebar({
  admin,
  onNavigate,
  mobile = false,
}: AdminSidebarProps) {
  const pathname =
    usePathname();

  const fullName =
    `${admin.firstName} ${admin.lastName}`.trim();

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-full flex-col bg-[#07111F]"
          : "fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/10 bg-[#07111F] lg:flex"
      }
    >
      {/* ======================================================
          BRAND
      ====================================================== */}
      <div className="shrink-0 border-b border-white/10 px-4 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="
            group
            flex
            items-center
            gap-3
            rounded-xl
            outline-none
            transition
            focus-visible:ring-2
            focus-visible:ring-[#3B82F6]
          "
        >
          <span
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[13px]
              bg-[#0B63F6]
              text-white
              shadow-[0_8px_24px_rgba(11,99,246,0.28)]
            "
          >
            <ShieldCheck
              className="h-5 w-5"
              aria-hidden="true"
            />
          </span>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-[14px]
                font-black
                leading-5
                tracking-[-0.02em]
                text-white
              "
            >
              Express-Führerschein
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.15em]
                text-[#72A9FF]
              "
            >
              Administration
            </p>
          </div>
        </Link>
      </div>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}
      <nav
        className="
          flex-1
          overflow-y-auto
          px-3
          py-5
          [scrollbar-width:thin]
          [scrollbar-color:#25354A_transparent]
        "
        aria-label="Administration"
      >
        <div className="space-y-6">
          {ADMIN_NAVIGATION.map(
            (section) => (
              <section
                key={
                  section.label
                }
              >
                {/* SECTION TITLE */}
                <p
                  className="
                    px-3
                    pb-2
                    text-[9px]
                    font-black
                    uppercase
                    leading-4
                    tracking-[0.14em]
                    text-[#718198]
                  "
                >
                  {section.label}
                </p>

                {/* SECTION ITEMS */}
                <div className="space-y-1">
                  {section.items.map(
                    (item) => {
                      const active =
                        isActiveHref(
                          pathname,
                          item.href,
                        );

                      const Icon =
                        item.icon;

                      return (
                        <Link
                          key={
                            item.href
                          }
                          href={
                            item.href
                          }
                          onClick={
                            onNavigate
                          }
                          aria-current={
                            active
                              ? "page"
                              : undefined
                          }
                          title={
                            item.label
                          }
                          className={`
                            group
                            flex
                            min-h-[44px]
                            items-center
                            gap-3
                            rounded-[11px]
                            px-3
                            py-2.5
                            text-[12px]
                            font-bold
                            leading-[1.3]
                            outline-none
                            transition-all
                            duration-150
                            focus-visible:ring-2
                            focus-visible:ring-[#3B82F6]
                            focus-visible:ring-offset-2
                            focus-visible:ring-offset-[#07111F]
                            ${
                              active
                                ? `
                                  bg-[#0B63F6]
                                  text-white
                                  shadow-[0_7px_20px_rgba(11,99,246,0.25)]
                                `
                                : `
                                  text-[#CBD5E1]
                                  hover:bg-white/[0.07]
                                  hover:text-white
                                `
                            }
                          `}
                        >
                          <Icon
                            className={`
                              h-[18px]
                              w-[18px]
                              shrink-0
                              transition
                              ${
                                active
                                  ? "text-white"
                                  : "text-[#8FA0B5] group-hover:text-[#72A9FF]"
                              }
                            `}
                            strokeWidth={
                              active
                                ? 2.2
                                : 1.9
                            }
                            aria-hidden="true"
                          />

                          <span
                            className="
                              min-w-0
                              flex-1
                              whitespace-normal
                            "
                          >
                            {
                              item.label
                            }
                          </span>
                        </Link>
                      );
                    },
                  )}
                </div>
              </section>
            ),
          )}
        </div>
      </nav>

      {/* ======================================================
          ADMIN PROFILE
      ====================================================== */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div
          className="
            rounded-[14px]
            border
            border-white/[0.07]
            bg-white/[0.05]
            p-3
          "
        >
          <div className="flex items-start gap-3">
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-[10px]
                bg-[#0B63F6]/15
                text-[#72A9FF]
              "
            >
              <ShieldCheck
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-[12px]
                  font-extrabold
                  leading-4
                  text-white
                "
                title={
                  fullName ||
                  "Administrator"
                }
              >
                {fullName ||
                  "Administrator"}
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[9px]
                  font-medium
                  leading-3
                  text-[#8B9AAF]
                "
                title={
                  admin.email
                }
              >
                {admin.email}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <span
              className="
                inline-flex
                rounded-full
                border
                border-[#0B63F6]/20
                bg-[#0B63F6]/15
                px-2.5
                py-1
                text-[8px]
                font-black
                uppercase
                tracking-[0.08em]
                text-[#72A9FF]
              "
            >
              {admin.role ===
              "super_admin"
                ? "Super Admin"
                : "Admin"}
            </span>
          </div>

          <form
            action="/api/admin/auth/logout"
            method="post"
            className="mt-3"
          >
            <button
              type="submit"
              className="
                flex
                min-h-[40px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[10px]
                border
                border-white/10
                bg-white/[0.04]
                px-3
                text-[11px]
                font-bold
                text-[#D5DEE9]
                outline-none
                transition
                hover:border-white/[0.16]
                hover:bg-white/[0.08]
                hover:text-white
                focus-visible:ring-2
                focus-visible:ring-[#3B82F6]
              "
            >
              <LogOut
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span>
                Abmelden
              </span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}