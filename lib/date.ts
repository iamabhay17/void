export function formatDate(value: string | Date) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  try {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d.toDateString();
  }
}
