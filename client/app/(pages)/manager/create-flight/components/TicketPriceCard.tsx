export interface TicketPriceCardProps {
  priceFirst?: number;
  priceBusiness?: number;
  priceEconomy?: number;
}

export default function TicketPriceCard(props: TicketPriceCardProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
        4. Ticket Pricing (VND)
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            required
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition`}
          />
        </div>

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
            required
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition`}
          />
        </div>

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
            required
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition`}
          />
        </div>
      </div>
    </div>
  );
}