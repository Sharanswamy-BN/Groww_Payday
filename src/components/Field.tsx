import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-groww-text">{label}</span>
      {hint ? <span className="mt-0.5 block text-[11px] text-groww-muted">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-groww-line bg-groww-wash px-3 py-2.5 text-[15px] text-groww-text outline-none focus:border-groww-green ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-groww-green py-3 text-[15px] font-semibold text-[#0b3d32] disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl border border-groww-line py-3 text-[15px] font-semibold text-groww-text ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
