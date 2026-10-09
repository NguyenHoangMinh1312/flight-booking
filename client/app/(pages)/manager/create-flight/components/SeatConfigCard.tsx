export interface SeatConfigCardProps {
  rows?: number;
  columns?: number;
  firstFromRow?: number;
  firstToRow?: number;
  businessFromRow?: number;
  businessToRow?: number;
  economyFromRow?: number;
  economyToRow?: number;
}

export default function SeatConfigCard(props: SeatConfigCardProps) {
  const isRowsReadOnly = props.rows !== undefined;
  const isColumnsReadOnly = props.columns !== undefined;
  const isFirstFromRowReadOnly = props.firstFromRow !== undefined;
  const isFirstToRowReadOnly = props.firstToRow !== undefined;
  const isBusinessFromRowReadOnly = props.businessFromRow !== undefined;
  const isBusinessToRowReadOnly = props.businessToRow !== undefined;
  const isEconomyFromRowReadOnly = props.economyFromRow !== undefined;
  const isEconomyToRowReadOnly = props.economyToRow !== undefined;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
        Seating Configuration
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="rows"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Total Rows <span className="text-red-500">*</span>
          </label>
          <input
            id="rows"
            name="rows"
            type="number"
            min={1}
            max={100}
            defaultValue={props.rows}
            readOnly={isRowsReadOnly}
            required
            placeholder="30"
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isRowsReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          />
        </div>

        <div>
          <label
            htmlFor="columns"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Columns per Row (Seats A-Z) <span className="text-red-500">*</span>
          </label>
          <input
            id="columns"
            name="columns"
            type="number"
            min={1}
            max={26}
            defaultValue={props.columns}
            readOnly={isColumnsReadOnly}
            required
            placeholder="6"
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${isColumnsReadOnly
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              }`}
          />
        </div>
      </div>

      {/* Class Row Allocation */}
      <div className="space-y-3 pt-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Seat Class Row Allocation
        </p>

        {/* First Class Rows */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          <span className="text-xs font-bold text-amber-800 block mb-2">
            First Class
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstFromRow"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                From Row
              </label>
              <input
                id="firstFromRow"
                name="firstFromRow"
                type="number"
                min={1}
                defaultValue={props.firstFromRow}
                readOnly={isFirstFromRowReadOnly}
                required
                className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${isFirstFromRowReadOnly
                  ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
              />
            </div>
            <div>
              <label
                htmlFor="firstToRow"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                To Row
              </label>
              <input
                id="firstToRow"
                name="firstToRow"
                type="number"
                min={1}
                defaultValue={props.firstToRow}
                readOnly={isFirstToRowReadOnly}
                required
                className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${isFirstToRowReadOnly
                  ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Business Class Rows */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          <span className="text-xs font-bold text-orange-800 block mb-2">
            Business Class
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="businessFromRow"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                From Row
              </label>
              <input
                id="businessFromRow"
                name="businessFromRow"
                type="number"
                min={1}
                defaultValue={props.businessFromRow}
                readOnly={isBusinessFromRowReadOnly}
                required
                className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${isBusinessFromRowReadOnly
                  ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
              />
            </div>
            <div>
              <label
                htmlFor="businessToRow"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                To Row
              </label>
              <input
                id="businessToRow"
                name="businessToRow"
                type="number"
                min={1}
                defaultValue={props.businessToRow}
                readOnly={isBusinessToRowReadOnly}
                required
                className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${isBusinessToRowReadOnly
                  ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Economy Class Rows */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          <span className="text-xs font-bold text-sky-800 block mb-2">
            Economy Class
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="economyFromRow"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                From Row
              </label>
              <input
                id="economyFromRow"
                name="economyFromRow"
                type="number"
                min={1}
                defaultValue={props.economyFromRow}
                readOnly={isEconomyFromRowReadOnly}
                required
                className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${isEconomyFromRowReadOnly
                  ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
              />
            </div>
            <div>
              <label
                htmlFor="economyToRow"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                To Row
              </label>
              <input
                id="economyToRow"
                name="economyToRow"
                type="number"
                min={1}
                defaultValue={props.economyToRow}
                readOnly={isEconomyToRowReadOnly}
                required
                className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${isEconomyToRowReadOnly
                  ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}