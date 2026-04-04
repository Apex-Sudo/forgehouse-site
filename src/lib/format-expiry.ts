function ordinalSuffix(day: number): string {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  if (mod10 === 1) return "st";
  if (mod10 === 2) return "nd";
  if (mod10 === 3) return "rd";
  return "th";
}

export function formatExpiryOrdinal(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;

  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const yy = String(d.getFullYear()).slice(-2);

  return `${month} ${day}${ordinalSuffix(day)}, '${yy}`;
}
