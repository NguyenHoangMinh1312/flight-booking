export interface TicketPriceCardProps {
  priceFirst?: number;
  priceBusiness?: number;
  priceEconomy?: number;
  enabledClasses?: {
    first: boolean;
    business: boolean;
    economy: boolean;
  };
}

export default function TicketPriceCard(props: TicketPriceCardProps) {
  const showFirst = props.enabledClasses
    ? props.enabledClasses.first
    : props.priceFirst !== undefined ||
      (!props.priceBusiness && !props.priceEconomy);
  const showBusiness = props.enabledClasses
    ? props.enabledClasses.business
    : props.priceBusiness !== undefined ||
      (!props.priceFirst && !props.priceEconomy);
  const showEconomy = props.enabledClasses
    ? props.enabledClasses.economy
    : props.priceEconomy !== undefined ||
      (!props.priceFirst && !props.priceBusiness);

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
                htmlFor="priceFirst"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                First Class <span className="text-red-500">*</span>
              </label>
              <input
                id="priceFirst"
                name="priceFirst"
                type="number"
                min={1}
                defaultValue={props.priceFirst}
                required={showFirst}
                placeholder="5000000"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          {showBusiness && (
            <div>
              <label
                htmlFor="priceBusiness"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Business Class <span className="text-red-500">*</span>
              </label>
              <input
                id="priceBusiness"
                name="priceBusiness"
                type="number"
                min={1}
                defaultValue={props.priceBusiness}
                required={showBusiness}
                placeholder="3000000"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          {showEconomy && (
            <div>
              <label
                htmlFor="priceEconomy"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Economy Class <span className="text-red-500">*</span>
              </label>
              <input
                id="priceEconomy"
                name="priceEconomy"
                type="number"
                min={1}
                defaultValue={props.priceEconomy}
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
