import { useMemo, Fragment } from "react";
import { Ticket, SeatClass } from "@/app/types/ticket";
import { ClassConfig } from "@/app/types/flight";
import { currencyFormatter } from "@/app/utils/format-currency";

type Props = {
  rows?: number;
  columns?: number;
  classConfig?: ClassConfig[];
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelect: (ticket: Ticket) => void;
};

const classStyles: Record<SeatClass, string> = {
  first: "border-amber-300 bg-amber-300 text-amber-950 hover:bg-amber-400",
  business: "border-orange-300 bg-orange-300 text-orange-950 hover:bg-orange-400",
  economy: "border-sky-300 bg-sky-300 text-sky-950 hover:bg-sky-400",
};

const classLabels: Record<SeatClass, string> = {
  first: "First Class",
  business: "Business Class",
  economy: "Economy Class",
};

const classBadgeStyles: Record<SeatClass, string> = {
  first: "border-amber-200 bg-amber-50 text-amber-900",
  business: "border-orange-200 bg-orange-50 text-orange-900",
  economy: "border-sky-200 bg-sky-50 text-sky-900",
};

const columnLabel = (column: number) =>
  String.fromCharCode(64 + column);

interface SectionConfig {
  class: SeatClass;
  fromRow: number;
  toRow: number;
  columns: number;
  price?: number;
}

export default function SeatsMatrix({
  rows,
  columns,
  classConfig,
  tickets,
  selectedTicketId,
  onSelect,
}: Props) {
  const ticketsBySeat = useMemo(() => {
    return new Map(
      tickets.map((ticket) => [
        `${ticket.seat.row}-${ticket.seat.column}`,
        ticket,
      ]),
    );
  }, [tickets]);

  const sections: SectionConfig[] = useMemo(() => {
    // 1. If classConfig is provided and not empty, use it
    if (classConfig && classConfig.length > 0) {
      return [...classConfig]
        .sort((a, b) => a.fromRow - b.fromRow)
        .map((cfg) => {
          let cols = cfg.columns;
          if (!cols || cols <= 0) {
            const rowTickets = tickets.filter(
              (t) => t.seat.row >= cfg.fromRow && t.seat.row <= cfg.toRow,
            );
            cols =
              rowTickets.length > 0
                ? Math.max(...rowTickets.map((t) => t.seat.column))
                : (columns ?? 6);
          }
          return {
            class: cfg.class,
            fromRow: cfg.fromRow,
            toRow: cfg.toRow,
            columns: cols,
            price: cfg.price,
          };
        });
    }

    // 2. Otherwise derive sections from tickets if available
    const classSet = new Set(tickets.map((t) => t.class));
    const knownOrder: SeatClass[] = ["first", "business", "economy"];
    const presentClasses = knownOrder.filter((c) => classSet.has(c));
    tickets.forEach((t) => {
      if (!presentClasses.includes(t.class)) {
        presentClasses.push(t.class);
      }
    });

    if (presentClasses.length > 0) {
      return presentClasses
        .map((cls) => {
          const classTickets = tickets.filter((t) => t.class === cls);
          const fromRow = Math.min(...classTickets.map((t) => t.seat.row));
          const toRow = Math.max(...classTickets.map((t) => t.seat.row));
          const maxCol = Math.max(...classTickets.map((t) => t.seat.column));
          return {
            class: cls,
            fromRow,
            toRow,
            columns: maxCol,
            price: classTickets[0]?.price,
          };
        })
        .sort((a, b) => a.fromRow - b.fromRow);
    }

    // 3. Fallback when only rows/columns are passed
    if (rows && rows > 0) {
      return [
        {
          class: "economy" as SeatClass,
          fromRow: 1,
          toRow: rows,
          columns: columns ?? 6,
        },
      ];
    }

    return [];
  }, [classConfig, tickets, rows, columns]);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="seat-map-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Choose your seat
          </p>

          <h2
            id="seat-map-heading"
            className="mt-1 text-2xl font-bold text-slate-900"
          >
            Seat map
          </h2>
        </div>

        <div
          className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600"
          aria-label="Seat legend"
        >
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-amber-300" />
            First
          </span>

          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-orange-300" />
            Business
          </span>

          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-sky-300" />
            Economy
          </span>

          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-slate-300" />
            Unavailable
          </span>
        </div>
      </div>

      <div className="mt-7 overflow-x-auto pb-2">
        {sections.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No seats available for this flight.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-8 min-w-max">
            {sections.map((section, sectionIdx) => (
              <div
                key={`${section.class}-${section.fromRow}-${sectionIdx}`}
                className="w-fit space-y-3"
              >
                {/* Cabin Class Header */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${classBadgeStyles[section.class]}`}
                    >
                      {classLabels[section.class]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {section.fromRow === section.toRow
                        ? `Row ${section.fromRow}`
                        : `Rows ${section.fromRow}–${section.toRow}`}{" "}
                      • {section.columns}{" "}
                      {section.columns === 1 ? "seat" : "seats"} per row
                    </span>
                  </div>

                  {section.price !== undefined && (
                    <span className="text-xs font-medium text-slate-500">
                      From{" "}
                      <span className="font-bold text-slate-900">
                        {currencyFormatter.format(section.price)}
                      </span>
                    </span>
                  )}
                </div>

                {/* Seats Grid */}
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `2.5rem repeat(${section.columns}, minmax(3.25rem, 1fr))`,
                  }}
                >
                  <span />

                  {Array.from({ length: section.columns }, (_, index) => (
                    <span
                      key={index}
                      className="text-center text-xs font-bold text-slate-400"
                    >
                      {columnLabel(index + 1)}
                    </span>
                  ))}

                  {Array.from(
                    { length: section.toRow - section.fromRow + 1 },
                    (_, rowIndex) => {
                      const row = section.fromRow + rowIndex;

                      return (
                        <Fragment key={`row-${row}`}>
                          <span className="flex items-center justify-center text-sm font-bold text-slate-500">
                            {row}
                          </span>

                          {Array.from(
                            { length: section.columns },
                            (_, columnIndex) => {
                              const column = columnIndex + 1;
                              const ticket = ticketsBySeat.get(
                                `${row}-${column}`,
                              );

                              if (!ticket) {
                                return (
                                  <span
                                    key={`${row}-${column}`}
                                    className="h-12 rounded-lg border border-dashed border-slate-200"
                                    aria-label={`Seat ${row}${columnLabel(column)} unavailable`}
                                  />
                                );
                              }

                              const unavailable = Boolean(ticket.orderId);
                              const selected = ticket.id === selectedTicketId;

                              return (
                                <button
                                  key={ticket.id}
                                  type="button"
                                  disabled={unavailable}
                                  onClick={() => onSelect(ticket)}
                                  aria-pressed={selected}
                                  aria-label={`Seat ${row}${columnLabel(column)}, ${ticket.class}${unavailable ? ", unavailable" : ""
                                    }`}
                                  className={`h-12 rounded-lg border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:blur-[1.5px] disabled:opacity-45 ${classStyles[ticket.class]
                                    } ${selected
                                      ? "ring-2 ring-slate-900 ring-offset-2"
                                      : ""
                                    }`}
                                >
                                  {row}
                                  {columnLabel(column)}
                                </button>
                              );
                            },
                          )}
                        </Fragment>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
