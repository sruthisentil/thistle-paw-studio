"use client";

import { useState } from "react";

export function RowEditor({ schema, pkKey, mode, initial, onCancel, onSubmit }) {
  const fields = schema.filter((c) => c.key !== pkKey);
  const [values, setValues] = useState(() => {
    const v = {};
    for (const c of fields) v[c.key] = initial?.[c.key] ?? "";
    return v;
  });
  const [saving, setSaving] = useState(false);

  function set(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const editable = {};
    for (const c of fields) if (!c.masked) editable[c.key] = values[c.key];
    await onSubmit(editable);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="max-h-[80vh] w-[420px] overflow-y-auto rounded border border-line2 bg-panel p-4 shadow-xl"
      >
        <h2 className="pb-3 text-[13.5px] font-medium text-fg">
          {mode === "insert" ? "Insert row" : `Edit ${initial?.[pkKey]}`}
        </h2>

        <div className="space-y-2.5">
          {fields.map((c) => (
            <label key={c.key} className="block">
              <span className="block pb-1 text-[11.5px] text-muted">{c.label}</span>
              {c.masked ? (
                <span className="block rounded border border-line2 bg-ink px-2.5 py-1.5 font-mono text-[12px] text-faint">
                  {mode === "insert" ? "server-assigned, masked" : values[c.key]}
                </span>
              ) : (
                <input
                  type={c.key === "weight_kg" || c.key === "refills_left" ? "number" : "text"}
                  value={values[c.key]}
                  onChange={(e) => set(c.key, e.target.value)}
                  className="w-full rounded border border-line2 bg-ink px-2.5 py-1.5 text-[12.5px] text-fg outline-none focus:border-brand/60"
                />
              )}
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-brand px-3 py-1.5 text-[12.5px] font-medium text-ink hover:bg-brand/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-line2 px-3 py-1.5 text-[12.5px] text-muted hover:text-fg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
