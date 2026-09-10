import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { downloadDocx, downloadPdf } from "@/lib/documents";
import { Button } from "@/components/ui/button";

export function DownloadButtons({ title, text }: { title: string; text: string }) {
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  async function run(kind: "pdf" | "docx") {
    setBusy(kind);
    try {
      if (kind === "pdf") await downloadPdf(title, text);
      else await downloadDocx(title, text);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the file.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => run("pdf")}>
        {busy === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}{" "}
        PDF
      </Button>
      <Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => run("docx")}>
        {busy === "docx" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}{" "}
        Word
      </Button>
    </>
  );
}
