import { Airport } from "@/app/types/airport";

export interface RouteAndScheduleCardProps {
  airports?: Airport[];
  departureAirport?: string;
  departureDate?: string;
  arrivalAirport?: string;
  arrivalDate?: string;
}

export default function RouteAndScheduleCard({
  airports = [],
  ...props
}: RouteAndScheduleCardProps) {
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
          <select
            id="departureAirport"
            name="departureAirport"
            defaultValue={props.departureAirport ?? ""}
            required
            disabled={isDepartureAirportReadOnly}
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isDepartureAirportReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          >
            <option value="">Select departure airport</option>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {`${airport.code} (${airport.name}, ${airport.city}, ${airport.country})`}
              </option>
            ))}
          </select>
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
          {isArrivalAirportReadOnly && (
            <input type="hidden" name="arrivalAirport" value={props.arrivalAirport} />
          )}
          <select
            id="arrivalAirport"
            name="arrivalAirport"
            required
            defaultValue={props.arrivalAirport ?? ""}
            disabled={isArrivalAirportReadOnly}
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isArrivalAirportReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          >
            <option value="">Select arrival airport</option>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {`${airport.code} (${airport.name}, ${airport.city}, ${airport.country})`}
              </option>
            ))}
          </select>
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