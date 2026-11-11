export interface TicketPriceCardProps {
  firstPrice?: number;
  businessPrice?: number;
  economyPrice?: number;
  enabledClasses?: {
    first: boolean;
    business: boolean;
    economy: boolean;
  };
}

export default function TicketPriceCard(props: TicketPriceCardProps) {
  const showFirst = props.enabledClasses
    ? props.enabledClasses.first
    : props.firstPrice !== undefined ||
      (!props.businessPrice && !props.economyPrice);
  const showBusiness = props.enabledClasses
    ? props.enabledClasses.business
    : props.businessPrice !== undefined ||
      (!props.firstPrice && !props.economyPrice);
  const showEconomy = props.enabledClasses
    ? props.enabledClasses.economy
    : props.economyPrice !== undefined ||
      (!props.firstPrice && !props.businessPrice);

  const hasAnyClass = showFirst || showBusiness || showEconomy;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
        Ticket Pricing (VND)
      </h2>

      {!hasAnyClass ? (
        <div className="rounded-md border border-dashed border-amber-200 bg-amber-50/50 p-4 text-center text-sm text-amber-800">
          Please include at least one seat class in the Seating Configuration above.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {showFirst && (
            <div>
              <label
                htmlFor="firstPrice"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                First Class <span className="text-red-500">*</span>
              </label>
              <input
                id="firstPrice"
                name="firstPrice"
                type="number"
                min={1}
                defaultValue={props.firstPrice}
                required={showFirst}
                placeholder="5000000"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          {showBusiness && (
            <div>
              <label
                htmlFor="businessPrice"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Business Class <span className="text-red-500">*</span>
              </label>
              <input
                id="businessPrice"
                name="businessPrice"
                type="number"
                min={1}
                defaultValue={props.businessPrice}
                required={showBusiness}
                placeholder="3000000"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          {showEconomy && (
            <div>
              <label
                htmlFor="economyPrice"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Economy Class <span className="text-red-500">*</span>
              </label>
              <input
                id="economyPrice"
                name="economyPrice"
                type="number"
                min={1}
                defaultValue={props.economyPrice}
                required={showEconomy}
                placeholder="1000000"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
