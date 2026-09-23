export function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
      style={{
        borderColor: selected ? "var(--pill)" : "var(--border)",
        backgroundColor: selected
          ? "color-mix(in oklch, var(--pill) 15%, transparent)"
          : "transparent",
      }}
    >
      {selected && (
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "var(--pill)" }}
        />
      )}
    </span>
  );
}

export default RadioDot;
