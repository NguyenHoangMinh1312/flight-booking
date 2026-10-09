import {
  FaUser,
  FaEnvelope,
  FaIdCard,
} from "react-icons/fa";
import { User } from "@/app/types/user";

type CustomerInfoProps = {
  customer: User | null;
  userId?: string;
};

export default function CustomerInfo({ customer, userId }: CustomerInfoProps) {
  const displayUserId = customer?.id || userId || "N/A";
  const displayEmail = customer?.email || null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <FaUser className="text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Information</h2>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Customer Email */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaEnvelope className="text-slate-400" />
            <span>Email Address</span>
          </div>
          {displayEmail ? (
            <a
              href={`mailto:${displayEmail}`}
              className="mt-2 block text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline break-all"
            >
              {displayEmail}
            </a>
          ) : (
            <p className="mt-2 text-sm font-semibold text-slate-400">
              {userId ? "Loading email..." : "No email available"}
            </p>
          )}
        </div>

        {/* Customer User ID */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaIdCard className="text-slate-400" />
            <span>User ID</span>
          </div>
          <p className="mt-2 font-mono text-sm font-bold text-slate-900 break-all">
            {displayUserId}
          </p>
        </div>
      </div>
    </section>
  );
}
