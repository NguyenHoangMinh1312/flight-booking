const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });

export function formatDateTime(value?: string | null) {
  if (!value) return { date: "N/A", time: "" };
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? { date: value, time: "" }
    : { date: dateFormatter.format(date), time: timeFormatter.format(date) };
}

