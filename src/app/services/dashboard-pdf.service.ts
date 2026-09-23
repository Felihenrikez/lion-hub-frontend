import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type PdfSlice = { y: number; height: number };

type RasterOptions = { scale: number; quality: number };

@Injectable({ providedIn: 'root' })
export class DashboardPdfService {
  private readonly marginMm = 10;
  private readonly gapMm = 6;
  private readonly maxBytes = 3 * 1024 * 1024;

  async downloadElementAsPdf(element: HTMLElement, fileName: string): Promise<void> {
    const attempts: RasterOptions[] = [
      { scale: 1.35, quality: 0.62 },
      { scale: 1.2, quality: 0.5 },
      { scale: 1.1, quality: 0.4 },
      { scale: 1, quality: 0.32 }
    ];

    let best: jsPDF | null = null;

    for (const attempt of attempts) {
      const pdf = await this.buildRasterPdf(element, attempt);
      best = pdf;
      if (pdf.output('blob').size <= this.maxBytes) {
        break;
      }
    }

    best?.save(this.safeFileName(fileName));
  }

  private async buildRasterPdf(element: HTMLElement, raster: RasterOptions): Promise<jsPDF> {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - this.marginMm * 2;
    const contentHeight = pageHeight - this.marginMm * 2;

    const sections = this.collectSections(element);
    let cursorY = this.marginMm;
    let isFirstImage = true;

    for (const section of sections) {
      const canvas = await html2canvas(section, {
        scale: raster.scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: Math.min(section.scrollWidth, 1200),
        scrollX: 0,
        scrollY: 0
      });

      const imgWidthMm = contentWidth;
      const fullHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      const pxPerMm = canvas.height / fullHeightMm;
      const maxSlicePx = Math.floor(contentHeight * pxPerMm);
      const preferredBreaks = this.getPreferredBreaks(section, canvas.height, raster.scale);

      const slices =
        fullHeightMm <= contentHeight
          ? [{ y: 0, height: canvas.height }]
          : this.sliceCanvasAtBreaks(canvas.height, maxSlicePx, preferredBreaks);

      for (const slice of slices) {
        const sliceHeightMm = (slice.height * imgWidthMm) / canvas.width;
        const remaining = pageHeight - this.marginMm - cursorY;

        if (!isFirstImage && sliceHeightMm > remaining) {
          pdf.addPage();
          cursorY = this.marginMm;
        }

        const sliceCanvas = this.cropCanvas(canvas, slice);
        const imgData = sliceCanvas.toDataURL('image/jpeg', raster.quality);
        pdf.addImage(imgData, 'JPEG', this.marginMm, cursorY, imgWidthMm, sliceHeightMm);

        cursorY += sliceHeightMm + this.gapMm;
        isFirstImage = false;
      }
    }

    return pdf;
  }

  private collectSections(root: HTMLElement): HTMLElement[] {
    const header = root.querySelector<HTMLElement>('.header');
    const panels = Array.from(root.querySelectorAll<HTMLElement>('.panel'));
    return [header, ...panels].filter((section): section is HTMLElement => !!section);
  }

  private getPreferredBreaks(section: HTMLElement, canvasHeight: number, scale: number): number[] {
    const sectionRect = section.getBoundingClientRect();
    const breaks = new Set<number>();

    const pushBreak = (el: Element) => {
      const rect = el.getBoundingClientRect();
      const relativeBottom = rect.bottom - sectionRect.top;
      const y = Math.round(relativeBottom * scale);
      if (y > 0 && y < canvasHeight) {
        breaks.add(y);
      }
    };

    section.querySelectorAll('.summary-hub, thead, tbody tr, h2').forEach(pushBreak);
    return [...breaks].sort((a, b) => a - b);
  }

  private sliceCanvasAtBreaks(
    canvasHeight: number,
    maxSliceHeight: number,
    preferredBreaks: number[]
  ): PdfSlice[] {
    const slices: PdfSlice[] = [];
    let start = 0;

    while (start < canvasHeight) {
      const hardLimit = Math.min(start + maxSliceHeight, canvasHeight);
      if (hardLimit >= canvasHeight) {
        slices.push({ y: start, height: canvasHeight - start });
        break;
      }

      const minUseful = start + Math.floor(maxSliceHeight * 0.35);
      const candidates = preferredBreaks.filter((y) => y > minUseful && y <= hardLimit);
      const breakAt = candidates.length > 0 ? candidates[candidates.length - 1] : hardLimit;

      slices.push({ y: start, height: breakAt - start });
      start = breakAt;
    }

    return slices;
  }

  private cropCanvas(source: HTMLCanvasElement, slice: PdfSlice): HTMLCanvasElement {
    const cropped = document.createElement('canvas');
    cropped.width = source.width;
    cropped.height = Math.max(1, Math.floor(slice.height));
    const ctx = cropped.getContext('2d');
    if (!ctx) {
      return source;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cropped.width, cropped.height);
    ctx.drawImage(
      source,
      0,
      Math.floor(slice.y),
      source.width,
      Math.floor(slice.height),
      0,
      0,
      source.width,
      Math.floor(slice.height)
    );
    return cropped;
  }

  private safeFileName(fileName: string): string {
    const safeName = fileName.replace(/[^\w.-]+/g, '_').toLowerCase();
    return `${safeName}.pdf`;
  }
}
