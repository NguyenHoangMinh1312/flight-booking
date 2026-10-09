import { Ticket, SeatClass } from "@/app/types/ticket";

type Props = {
  rows: number;
  columns: number;
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelect: (ticket: Ticket) => void;
};

const classStyles: Record<SeatClass, string> = {
  first: "border-amber-300 bg-amber-300 text-amber-950 hover:bg-amber-400",
  business: "border-orange-300 bg-orange-300 text-orange-950 hover:bg-orange-400",
  economy: "border-sky-300 bg-sky-300 text-sky-950 hover:bg-sky-400",
};

const orderedStyle =
  "border-slate-400 bg-slate-300 text-slate-700 hover:bg-slate-400";

const columnLabel = (column: number) =>
  String.fromCharCode(64 + column);

export default function SeatsMatrix({
  rows,
  columns,
  tickets,
  selectedTicketId,
  onSelect,
}: Props) {
  const ticketsBySeat = new Map(
    tickets.map((ticket) => [
      `${ticket.seat.row}-${ticket.seat.column}`,
      ticket,
    ]),
  );

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="seat-map-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
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
            Ordered
          </span>
        </div>
      </div>

      <div className="mt-7 overflow-x-auto pb-2">
        <div
          className="mx-auto grid min-w-max gap-2"
          style={{
            gridTemplateColumns: `2.5rem repeat(${columns}, minmax(3.25rem, 1fr))`,
          }}
        >
          <span />

          {Array.from({ length: columns }, (_, index) => (
            <span
              key={index}
              className="text-center text-xs font-bold text-slate-400"
            >
              {columnLabel(index + 1)}
            </span>
          ))}

          {Array.from({ length: rows }, (_, rowIndex) => {
            const row = rowIndex + 1;

            return [
              <span
                key={`row-${row}`}
                className="flex items-center justify-center text-sm font-bold text-slate-500"
              >
                {row}
              </span>,

              ...Array.from(
                { length: columns },
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

                  const isOrdered = ticket.orderId !== undefined;
                  const selected = ticket.id === selectedTicketId;

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => onSelect(ticket)}
                      aria-pressed={selected}
                      aria-label={`Seat ${row}${columnLabel(column)}, ${ticket.class}${
                        isOrdered ? ", Ordered" : ""
                      }`}
                      className={`h-12 rounded-lg border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                        isOrdered ? orderedStyle : classStyles[ticket.class]
                      } ${
                        selected
                          ? "ring-2 ring-slate-900 ring-offset-2"
                          : ""
                      }`}
                    >
                      {row}
                      {columnLabel(column)}
                    </button>
                  );
                },
              ),
            ];
          })}
        </div>
      </div>
    </section>
  );
}