"use client";

import { Check, Copy, Download, ExternalLink, ImageDown, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export function QrLinkPanel({ path }: { path: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const absolute = new URL(path, window.location.origin).toString();
    if (canvasRef.current) {
      void QRCode.toCanvas(canvasRef.current, absolute, {
        width: 180,
        margin: 1,
        color: { dark: "#0e4d3a", light: "#ffffff" },
      });
    }
  }, [path]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
    showFeedback("Link kopiert");
  }

  async function copyImage() {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.clipboard.write || typeof ClipboardItem === "undefined") {
      showFeedback("Grafik kann in diesem Browser nicht kopiert werden");
      return;
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showFeedback("QR-Code-Grafik kopiert");
    } catch {
      showFeedback("Grafik kann in diesem Browser nicht kopiert werden");
    }
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "agora-qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showFeedback("QR-Code heruntergeladen");
  }

  return <section className="border border-[var(--line)] bg-white p-5">
    <div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-[var(--brand)]" /><h2 className="font-bold">QR-Code und öffentlicher Link</h2></div>
    <div className="mt-4 flex flex-wrap items-center gap-5">
      <canvas ref={canvasRef} className="h-[180px] w-[180px] border border-[var(--line)]" />
      <div className="min-w-0 flex-1">
        <p className="break-all text-sm text-[var(--muted)]">{path}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={path} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white no-underline"><ExternalLink className="h-4 w-4" />Themenseite öffnen</a>
          <button type="button" onClick={copyLink} className="inline-flex min-h-10 items-center gap-2 border border-[var(--line)] bg-white px-3 text-sm font-semibold"><Copy className="h-4 w-4" />Link kopieren</button>
          <button type="button" onClick={copyImage} className="inline-flex min-h-10 items-center gap-2 border border-[var(--line)] bg-white px-3 text-sm font-semibold"><ImageDown className="h-4 w-4" />Grafik kopieren</button>
          <button type="button" onClick={downloadImage} className="inline-flex min-h-10 items-center gap-2 border border-[var(--line)] bg-white px-3 text-sm font-semibold"><Download className="h-4 w-4" />PNG herunterladen</button>
        </div>
        <p aria-live="polite" className="mt-2 min-h-5 text-xs text-[var(--muted)]">{feedback && <><Check className="mr-1 inline h-3 w-3" />{feedback}</>}</p>
      </div>
    </div>
  </section>;
}
