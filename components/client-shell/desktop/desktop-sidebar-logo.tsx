/**
 * Express-Führerschein
 * Desktop sidebar logo area.
 */

import {
  ClientBrandLogo,
} from "@/components/client-shell/shared/client-brand-logo";

export function DesktopSidebarLogo() {
  return (
    <div
      className="flex h-[92px] shrink-0 items-center border-b border-white/[0.06] px-5"
    >
      <ClientBrandLogo
        variant="sidebar"
      />
    </div>
  );
}
