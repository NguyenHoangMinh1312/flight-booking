export interface RouteAndScheduleCardProps {
  departureAirport?: string;
  departureDate?: string;
  arrivalAirport?: string;
  arrivalDate?: string;
}

export default function RouteAndScheduleCard(props: RouteAndScheduleCardProps) {
  const isDepartureAirportReadOnly = props.departureAirport !== undefined;
  const isDepartureDateReadOnly = props.departureDate !== undefined;
  const isArrivalAirportReadOnly = props.arrivalAirport !== undefined;
  const isArrivalDateReadOnly = props.arrivalDate !== undefined;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
        Route & Schedule
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="departureAirport"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Departure Airport <span className="text-red-500">*</span>
          </label>
          <input
            id="departureAirport"
            name="departureAirport"
            type="text"
            required
            placeholder="e.g. Noi Bai"
            defaultValue={props.departureAirport}
            readOnly={isDepartureAirportReadOnly}
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isDepartureAirportReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          />
        </div>

        <div>
          <label
            htmlFor="departureDate"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Departure Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            id="departureDate"
            name="departureDate"
            type="datetime-local"
            required
            defaultValue={props.departureDate}
            readOnly={isDepartureDateReadOnly}
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isDepartureDateReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          />
        </div>

        <div>
          <label
            htmlFor="arrivalAirport"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Arrival Airport <span className="text-red-500">*</span>
          </label>
          <input
            id="arrivalAirport"
            name="arrivalAirport"
            type="text"
            required
            placeholder="e.g. Tan Son Nhat"
            defaultValue={props.arrivalAirport}
            readOnly={isArrivalAirportReadOnly}
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isArrivalAirportReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          />
        </div>

        <div>
          <label
            htmlFor="arrivalDate"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Arrival Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            id="arrivalDate"
            name="arrivalDate"
            type="datetime-local"
            required
            defaultValue={props.arrivalDate}
            readOnly={isArrivalDateReadOnly}
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isArrivalDateReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          />
        </div>
      </div>
    </div>
  );
}