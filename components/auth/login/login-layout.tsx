import type {
  ReactNode,
} from "react";

import { LoginHeader } from "@/components/auth/login/login-header";
import { LoginSecurityNotice } from "@/components/auth/login/login-security-notice";
import { LoginSidePanel } from "@/components/auth/login/login-side-panel";

import { cn } from "@/lib/utils";

export interface LoginLayoutProps {
  children:
    ReactNode;

  className?:
    string;

  mainClassName?:
    string;

  showSecurityNotice?:
    boolean;
}

/**
 * Main authentication layout matching the provided desktop/mobile architecture.
 *
 * Desktop:
 * ┌─────────────────────────────┬──────────────────────────────┐
 * │ dark Berlin side panel      │ language                    │
 * │                             │                              │
 * │ benefits                    │ white login card             │
 * │                             │                              │
 * │ trust bar                   │ security notice              │
 * └─────────────────────────────┴──────────────────────────────┘
 *
 * Mobile:
 * ┌────────────────────────────────────────────────────────────┐
 * │ dark logo + language header                                │
 * │ white login card                                           │
 * │ security notice                                            │
 * └────────────────────────────────────────────────────────────┘
 */
export function LoginLayout({
  children,

  className,
  mainClassName,

  showSecurityNotice =
    true,
}: LoginLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#020914]",
        className,
      )}
    >
      <div className="flex min-h-screen">
        <LoginSidePanel />

        <main
          id="main-content"
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            "bg-[#F4F6F8]",
            "lg:bg-[#F6F7F9]",
            mainClassName,
          )}
        >
          {/* Mobile + desktop language area */}

          <div
            className="
              lg:flex
              lg:min-h-[86px]
              lg:items-center
              lg:justify-end
              lg:px-8
              xl:px-10
            "
          >
            <LoginHeader />
          </div>

          {/* Main content */}

          <div
            className="
              flex flex-1 flex-col
              px-3 pb-4 pt-3
              sm:px-5 sm:pb-5
              lg:px-8 lg:pb-8 lg:pt-1
              xl:px-10
            "
          >
            <div
              className="
                mx-auto
                flex w-full max-w-[590px]
                flex-1 flex-col
                justify-center
              "
            >
              {children}

              {showSecurityNotice ? (
                <LoginSecurityNotice
                  className="mt-5"
                />
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
