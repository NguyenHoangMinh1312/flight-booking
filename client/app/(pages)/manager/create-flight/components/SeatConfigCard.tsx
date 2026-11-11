"use client";

import { useState } from "react";

export interface SeatConfigCardProps {
  rows?: number;
  firstFromRow?: number;
  firstToRow?: number;
  firstColumns?: number;
  businessFromRow?: number;
  businessToRow?: number;
  businessColumns?: number;
  economyFromRow?: number;
  economyToRow?: number;
  economyColumns?: number;
  enabledClasses?: {
    first: boolean;
    business: boolean;
    economy: boolean;
  };
  onToggleClass?: (
    seatClass: "first" | "business" | "economy",
    enabled: boolean
  ) => void;
}

export default function SeatConfigCard(props: SeatConfigCardProps) {
  const isRowsReadOnly = props.rows !== undefined;
  const isFirstFromRowReadOnly = props.firstFromRow !== undefined;
  const isFirstToRowReadOnly = props.firstToRow !== undefined;
  const isFirstColumnsReadOnly = props.firstColumns !== undefined;
  const isBusinessFromRowReadOnly = props.businessFromRow !== undefined;
  const isBusinessToRowReadOnly = props.businessToRow !== undefined;
  const isBusinessColumnsReadOnly = props.businessColumns !== undefined;
  const isEconomyFromRowReadOnly = props.economyFromRow !== undefined;
  const isEconomyToRowReadOnly = props.economyToRow !== undefined;
  const isEconomyColumnsReadOnly = props.economyColumns !== undefined;

  const isReadOnly = isRowsReadOnly;

  // Internal state used when component is uncontrolled
  const [internalEnabled, setInternalEnabled] = useState({
    first: props.firstFromRow !== undefined,
    business: props.businessFromRow !== undefined,
    economy:
      props.economyFromRow !== undefined ||
      (props.rows === undefined &&
        props.firstFromRow === undefined &&
        props.businessFromRow === undefined),
  });

  const enabled = props.enabledClasses ?? internalEnabled;

  const handleToggle = (
    seatClass: "first" | "business" | "economy",
    checked: boolean
  ) => {
    if (isReadOnly) return;
    if (props.onToggleClass) {
      props.onToggleClass(seatClass, checked);
    } else {
      setInternalEnabled((prev) => ({ ...prev, [seatClass]: checked }));
    }
  };

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
            className={`w-full rounded-md border px-3 py-2 text-slate-900 outline-none transition ${
              isRowsReadOnly
                ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            }`}
          />
        </div>
      </div>

      {/* Class Row Allocation */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Seat Class Row Allocation
          </p>
          <span className="text-xs text-slate-400">
            Select classes available on this flight
          </span>
        </div>

        {/* First Class Rows */}
        <div
          className={`rounded-lg border transition p-3 ${
            enabled.first
              ? "border-amber-200 bg-amber-50/20"
              : "border-slate-200 bg-slate-50/50 opacity-75"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800">
              First Class
            </span>
            {!isReadOnly && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enabled.first}
                  onChange={(e) => handleToggle("first", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Include Class
              </label>
            )}
          </div>

          {enabled.first ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="firstFromRow"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  From Row <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstFromRow"
                  name="firstFromRow"
                  type="number"
                  min={1}
                  defaultValue={props.firstFromRow}
                  readOnly={isFirstFromRowReadOnly}
                  required={enabled.first}
                  placeholder="1"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isFirstFromRowReadOnly
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
                  To Row <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstToRow"
                  name="firstToRow"
                  type="number"
                  min={1}
                  defaultValue={props.firstToRow}
                  readOnly={isFirstToRowReadOnly}
                  required={enabled.first}
                  placeholder="3"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isFirstToRowReadOnly
                      ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="firstColumns"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Columns per Row (Seats A-Z) <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstColumns"
                  name="firstColumns"
                  type="number"
                  min={1}
                  max={26}
                  defaultValue={props.firstColumns}
                  readOnly={isFirstColumnsReadOnly}
                  required={enabled.first}
                  placeholder="4"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isFirstColumnsReadOnly
                      ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No first class seats on this flight
            </p>
          )}
        </div>

        {/* Business Class Rows */}
        <div
          className={`rounded-lg border transition p-3 ${
            enabled.business
              ? "border-orange-200 bg-orange-50/20"
              : "border-slate-200 bg-slate-50/50 opacity-75"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-800">
              Business Class
            </span>
            {!isReadOnly && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enabled.business}
                  onChange={(e) => handleToggle("business", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                Include Class
              </label>
            )}
          </div>

          {enabled.business ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="businessFromRow"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  From Row <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessFromRow"
                  name="businessFromRow"
                  type="number"
                  min={1}
                  defaultValue={props.businessFromRow}
                  readOnly={isBusinessFromRowReadOnly}
                  required={enabled.business}
                  placeholder="4"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isBusinessFromRowReadOnly
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
                  To Row <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessToRow"
                  name="businessToRow"
                  type="number"
                  min={1}
                  defaultValue={props.businessToRow}
                  readOnly={isBusinessToRowReadOnly}
                  required={enabled.business}
                  placeholder="8"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isBusinessToRowReadOnly
                      ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="businessColumns"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Columns per Row (Seats A-Z) <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessColumns"
                  name="businessColumns"
                  type="number"
                  min={1}
                  max={26}
                  defaultValue={props.businessColumns}
                  readOnly={isBusinessColumnsReadOnly}
                  required={enabled.business}
                  placeholder="6"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isBusinessColumnsReadOnly
                      ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No business class seats on this flight
            </p>
          )}
        </div>

        {/* Economy Class Rows */}
        <div
          className={`rounded-lg border transition p-3 ${
            enabled.economy
              ? "border-sky-200 bg-sky-50/20"
              : "border-slate-200 bg-slate-50/50 opacity-75"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-800">
              Economy Class
            </span>
            {!isReadOnly && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enabled.economy}
                  onChange={(e) => handleToggle("economy", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Include Class
              </label>
            )}
          </div>

          {enabled.economy ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="economyFromRow"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  From Row <span className="text-red-500">*</span>
                </label>
                <input
                  id="economyFromRow"
                  name="economyFromRow"
                  type="number"
                  min={1}
                  defaultValue={props.economyFromRow}
                  readOnly={isEconomyFromRowReadOnly}
                  required={enabled.economy}
                  placeholder="9"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isEconomyFromRowReadOnly
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
                  To Row <span className="text-red-500">*</span>
                </label>
                <input
                  id="economyToRow"
                  name="economyToRow"
                  type="number"
                  min={1}
                  defaultValue={props.economyToRow}
                  readOnly={isEconomyToRowReadOnly}
                  required={enabled.economy}
                  placeholder="30"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isEconomyToRowReadOnly
                      ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="economyColumns"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Columns per Row (Seats A-Z) <span className="text-red-500">*</span>
                </label>
                <input
                  id="economyColumns"
                  name="economyColumns"
                  type="number"
                  min={1}
                  max={26}
                  defaultValue={props.economyColumns}
                  readOnly={isEconomyColumnsReadOnly}
                  required={enabled.economy}
                  placeholder="6"
                  className={`w-full rounded-md border px-3 py-1.5 text-sm text-slate-900 outline-none transition ${
                    isEconomyColumnsReadOnly
                      ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  }`}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No economy class seats on this flight
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
