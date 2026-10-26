import { useState } from "react";

const FIELDS = [
  { key: "first_name", label: "First name", placeholder: "First", autoComplete: "given-name" },
  { key: "last_name", label: "Last name", placeholder: "Last", autoComplete: "family-name" },
  { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/…", inputMode: "url" },
  { key: "phone", label: "Phone", placeholder: "(760) 555-0100", autoComplete: "tel", inputMode: "tel" },
  { key: "payment", label: "Preferred payment", placeholder: "e.g. Zelle, Venmo @name, cash" },
];

function formatPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

const PAYMENT_OPTIONS = ["Zelle", "Venmo", "Cash"];

function PaymentSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next.join(", "));
  };
  return (
    <div className="relative">
      {open && (
        <button type="button" aria-hidden tabIndex={-1} onClick={() => setOpen(false)}
          className="fixed inset-0 z-10 cursor-default bg-transparent border-0 p-0" />
      )}
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm text-navy font-normal bg-white text-left flex items-center justify-between gap-2">
        <span className={selected.length ? "" : "text-navy/40"}>
          {selected.length ? selected.join(", ") : "Select…"}
        </span>
        <span className="text-navy/40 text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-navy/15 bg-white shadow-lg p-1">
          {PAYMENT_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-2 py-1.5 text-sm text-navy font-normal hover:bg-cream rounded cursor-pointer">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                className="h-4 w-4 accent-navy" />
              {opt}
            </label>
          ))}
          {selected.filter((s) => !PAYMENT_OPTIONS.includes(s)).map((other) => (
            <div key={other} className="flex items-center justify-between px-2 py-1.5 text-sm text-navy/60">
              <span>{other} <span className="text-xs">(custom)</span></span>
              <button type="button" onClick={() => toggle(other)} className="text-xs font-bold hover:text-brick">remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setOpen(false)}
            className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-black">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default function UmpireProfileForm({ initial = {}, onSave, busy, saveLabel = "Save profile" }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, initial[f.key] || ""]))
  );
  const set = (key) => (e) => setForm((p) => ({
    ...p,
    [key]: key === "phone" ? formatPhone(e.target.value) : e.target.value,
  }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {FIELDS.map((f) => (
        <div key={f.key} className="block text-xs font-bold text-navy/60 uppercase tracking-wide">
          {f.label}
          {f.key === "payment" ? (
            <PaymentSelect value={form.payment} onChange={(v) => setForm((p) => ({ ...p, payment: v }))} />
          ) : (
            <input
              value={form[f.key]} onChange={set(f.key)}
              placeholder={f.placeholder} autoComplete={f.autoComplete} inputMode={f.inputMode}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm text-navy font-normal normal-case tracking-normal"
            />
          )}
        </div>
      ))}
      <div className="sm:col-span-2">
        <button type="submit" disabled={!!busy}
          className="px-5 py-2 rounded-full bg-navy text-white text-xs font-black hover:bg-navy-deep transition disabled:opacity-50">
          {busy ? "Saving…" : saveLabel}
        </button>
      </div>
    </form>
  );
}
