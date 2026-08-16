import {
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import type {
  AdminPraxisCustomerView,
} from "@/types/admin-praxis";

export interface AdminPraxisCustomerCardProps {
  customer:
    AdminPraxisCustomerView;
}

export function AdminPraxisCustomerCard({
  customer,
}: AdminPraxisCustomerCardProps) {
  return (
    <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#EEF5FF] text-[#0B63F6]">
          <UserRound
            aria-hidden="true"
            className="h-4.5 w-4.5"
          />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#7A899C]">
            Kunde
          </p>

          <h2 className="mt-1 text-[15px] font-black text-[#0A172A]">
            {
              customer.fullName
            }
          </h2>
        </div>
      </div>

      <dl className="mt-5 space-y-3 border-t border-[#EDF1F6] pt-4">
        <div className="flex items-start gap-3">
          <Mail
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-[#8A98AA]"
          />
          <div className="min-w-0">
            <dt className="text-[8px] font-black uppercase tracking-[0.08em] text-[#8A98AA]">
              E-Mail
            </dt>
            <dd className="mt-1 break-all text-[10px] font-bold text-[#334155]">
              {
                customer.email
              }
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-[#8A98AA]"
          />
          <div>
            <dt className="text-[8px] font-black uppercase tracking-[0.08em] text-[#8A98AA]">
              Telefon
            </dt>
            <dd className="mt-1 text-[10px] font-bold text-[#334155]">
              {
                customer.phone
              }
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}

export default AdminPraxisCustomerCard;
