// Client-only helpers: read CV files (PDF/Word) and export results to PDF/Word.

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) return (await file.text()).trim();

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value.trim();
  }

  if (name.endsWith(".doc")) {
    throw new Error("Old .doc files aren't supported — please save as .docx or PDF.");
  }

  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = (
      await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
    ).default;
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const content = await (await pdf.getPage(i)).getTextContent();
      pages.push(
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      );
    }
    return pages.join("\n\n").trim();
  }

  throw new Error("Unsupported file. Please upload a PDF, .docx or .txt file.");
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pathway";
}

export async function downloadPdf(title: string, text: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const height = pdf.internal.pageSize.getHeight();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(title, margin, margin);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  let y = margin + 28;
  for (const paragraph of text.split(/\n/)) {
    const lines = pdf.splitTextToSize(paragraph || " ", width) as string[];
    for (const line of lines) {
      if (y > height - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += 16;
    }
  }

  save(pdf.output("blob"), `${slug(title)}.pdf`);
}

export async function downloadDocx(title: string, text: string): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(title)] }),
          ...text
            .split(/\n/)
            .map((line) => new Paragraph({ children: [new TextRun(line)] })),
        ],
      },
    ],
  });
  save(await Packer.toBlob(doc), `${slug(title)}.docx`);
}

export function careerResultToText(result: {
  summary: string;
  careers: Array<{ title: string; fit: string; skillsToBuild: string[]; firstStep: string }>;
}): string {
  const parts = [result.summary, ""];
  result.careers.forEach((career, index) => {
    parts.push(
      `${index + 1}. ${career.title}`,
      career.fit,
      career.skillsToBuild.length ? `Skills to build: ${career.skillsToBuild.join(", ")}` : "",
      career.firstStep ? `First step: ${career.firstStep}` : "",
      "",
    );
  });
  return parts.filter((part) => part !== undefined).join("\n");
}
