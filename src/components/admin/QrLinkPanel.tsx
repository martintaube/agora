"use client";

import { Check, Copy, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export function QrLinkPanel({ path }: { path: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const absolute = new URL(path, window.location.origin).toString();
    if (canvasRef.current) void QRCode.toCanvas(canvasRef.current, absolute, { width: 180, margin: 1, color: { dark: "#0e4d3a", light: "#ffffff" } });
  }, [path]);
  async function copy() { await navigator.clipboard.writeText(new URL(path, window.location.origin).toString()); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  return <section className="border border-[var(--line)] bg-white p-5"><div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-[var(--brand)]" /><h2 className="font-bold">QR- und Deeplink</h2></div><div className="mt-4 flex flex-wrap items-center gap-5"><canvas ref={canvasRef} className="h-[180px] w-[180px] border border-[var(--line)]" /><div className="min-w-0 flex-1"><p className="break-all text-sm text-[var(--muted)]">{path}</p><button type="button" onClick={copy} className="mt-3 inline-flex min-h-10 items-center gap-2 border border-[var(--line)] bg-white px-3 text-sm font-semibold">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Kopiert" : "Link kopieren"}</button></div></div></section>;
}
