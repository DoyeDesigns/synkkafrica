"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { exportMyData } from "@/lib/api/users";

export function ExportDataButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const bundle = await exportMyData(token);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "synka-data-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't export your data.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-[10px] border border-[#C9C9C9] bg-white px-5 py-2.5 text-sm font-medium font-satoshi text-foreground transition-colors hover:bg-black/[0.03] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
        ) : (
          <Download className="h-4 w-4" strokeWidth={1.75} />
        )}
        {busy ? "Preparing…" : "Download my data"}
      </button>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
