const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

function formatParts(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1); // 1–12
  const day = pad2(d.getDate()); // 1–31
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${hh}:${mm} - ${y}/${m}/${day}`;
}

export default function formatDate(date?: string | Date): string | undefined {
  if (!date) return;

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return;

  return formatParts(d);
}
