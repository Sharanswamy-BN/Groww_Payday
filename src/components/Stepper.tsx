const STEPS = ["Fund", "Date", "Review", "Pay"];

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-5 flex items-center gap-1">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`h-1 w-full rounded-full ${
                active || done ? "bg-groww-green" : "bg-groww-line"
              }`}
            />
            <span className={`text-[10px] ${active ? "font-semibold text-groww-greenDark" : "text-groww-muted"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
