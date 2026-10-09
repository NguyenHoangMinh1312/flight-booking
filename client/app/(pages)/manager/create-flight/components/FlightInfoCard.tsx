export interface FlightInfoCardProps {
  flightNumber?: string
  description?: string
}

export default function FlightInfoCard(props: FlightInfoCardProps) {
  const isFlightNumberReadOnly = props.flightNumber !== undefined;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
        Flight Information
      </h2>

      <div>
        <label
          htmlFor="flightNumber"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Flight Number <span className="text-red-500">*</span>
        </label>
        <input
          id="flightNumber"
          name="flightNumber"
          type="text"
          required
          placeholder="e.g. VN123"
          defaultValue={props.flightNumber}
          readOnly={isFlightNumberReadOnly}
          className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isFlightNumberReadOnly
            ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
            : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            }`}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          placeholder="e.g. Hanoi to Ho Chi Minh City"
          defaultValue={props.description}
          className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition`}
        />
      </div>
    </div>
  );
}