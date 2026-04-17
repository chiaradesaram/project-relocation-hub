// Strip everything except digits and a single decimal point.
export function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

// Format a numeric string for display with thousands separators.
// Preserves a trailing "." or trailing zeros after the decimal so users can keep typing.
export function formatAmountDisplay(value: string): string {
  if (!value) return "";
  const [intPart, decPart] = value.split(".");
  const intFormatted = intPart ? Number(intPart).toLocaleString("en-US") : "0";
  if (value.includes(".")) return `${intFormatted}.${decPart ?? ""}`;
  return intFormatted;
}
