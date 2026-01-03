import { Injectable } from '@nestjs/common';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';
import { SettingsService } from '../settings/settings.service';
import { InvoiceBaseDto } from './dto/invoice-base.dto';

@Injectable()
export class InvoiceService {
  constructor(private settingsService: SettingsService) {}

  // Color palette
  private readonly COLORS = {
    primary: [33, 33, 33],
    secondary: [100, 100, 100],
    accent: [120, 120, 120],
    light: [150, 150, 150],
    divider: [200, 200, 200],
    background: [245, 245, 245],
    backgroundAlt: [252, 252, 252],
    error: [231, 76, 60],
    success: [46, 204, 113],
    info: [52, 152, 219],
    warning: [241, 196, 15],
  };

  private readonly BADGE_COLORS = {
    sale: [0, 51, 102], // Dark blue
    purchase: this.COLORS.info,
    quotation: this.COLORS.warning,
  };

  async generatePdf(data: InvoiceBaseDto): Promise<Buffer> {
    const settings = await this.settingsService.getSettings();

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;

        let currentY = margin;

        // Render sections
        currentY = await this.renderHeader(
          doc,
          settings,
          margin,
          currentY,
          pageWidth,
        );
        currentY = this.renderDivider(doc, margin, pageWidth, currentY);
        currentY = this.renderDocumentInfo(
          doc,
          data,
          settings,
          margin,
          pageWidth,
          currentY,
        );
        currentY = this.renderPartyInfo(doc, data, margin, currentY);
        currentY = this.renderItemsTable(
          doc,
          data,
          margin,
          pageWidth,
          contentWidth,
          currentY,
        );
        currentY = this.renderTotals(doc, data, margin, pageWidth, currentY);
        currentY = this.renderPayments(doc, data, margin, currentY);
        currentY = this.renderNotes(doc, data, margin, contentWidth, currentY);

        await this.renderQRCode(
          doc,
          data,
          settings,
          pageWidth,
          pageHeight,
          margin,
        );
        this.renderFooter(doc, settings, pageWidth, pageHeight, margin);

        // Generate buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        resolve(pdfBuffer);
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  private async renderHeader(
    doc: jsPDF,
    settings: any,
    margin: number,
    currentY: number,
    pageWidth: number,
  ): Promise<number> {
    const logoUrl = (settings as any).logo_url || settings.logo_attachment?.url;
    const logoWidth = 40;
    const logoHeight = 22;
    let contentStartX = margin;

    // Render logo if available
    if (logoUrl) {
      try {
        const imageResponse = await fetch(logoUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');

          let imageFormat: 'PNG' | 'JPEG' | 'WEBP' = 'PNG';
          const contentType = imageResponse.headers.get('content-type') || '';

          if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            imageFormat = 'JPEG';
          } else if (contentType.includes('webp')) {
            imageFormat = 'WEBP';
          }

          const dataUrl = `data:image/${imageFormat.toLowerCase()};base64,${base64Image}`;
          doc.addImage(
            dataUrl,
            imageFormat,
            margin,
            currentY,
            logoWidth,
            logoHeight,
          );
          contentStartX = margin + logoWidth + 10;
        }
      } catch (err) {
        console.error('Logo load failed:', err);
      }
    }

    // Business name
    this.setTextStyle(doc, 18, this.COLORS.primary, 'bold');
    doc.text(
      settings.business_name || 'Business Name',
      contentStartX,
      currentY + 6,
    );

    // Address
    let infoY = currentY + 12;
    if (settings.address) {
      this.setTextStyle(doc, 9, this.COLORS.secondary);
      const addressLines = doc.splitTextToSize(
        settings.address,
        pageWidth - contentStartX - margin,
      );
      doc.text(addressLines, contentStartX, infoY);
      infoY += addressLines.length * 4;
    }

    // Contact info
    const contactParts: string[] = [];
    if (settings.phone) contactParts.push(settings.phone);
    if (settings.email) contactParts.push(settings.email);

    if (contactParts.length > 0) {
      this.setTextStyle(doc, 9, this.COLORS.secondary);
      doc.text(contactParts.join(' • '), contentStartX, infoY);
      infoY += 4;
    }

    // Website
    if (settings.website) {
      this.setTextStyle(doc, 9, [70, 70, 70]);
      doc.text(settings.website, contentStartX, infoY);
      infoY += 4;
    }

    return Math.max(currentY + logoHeight, infoY) + 8;
  }

  private renderDivider(
    doc: jsPDF,
    margin: number,
    pageWidth: number,
    currentY: number,
  ): number {
    doc.setDrawColor(
      this.COLORS.divider[0],
      this.COLORS.divider[1],
      this.COLORS.divider[2],
    );
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    return currentY + 15;
  }

  private renderDocumentInfo(
    doc: jsPDF,
    data: InvoiceBaseDto,
    settings: any,
    margin: number,
    pageWidth: number,
    currentY: number,
  ): number {
    // Document badge
    const badgeWidth = 36;
    const badgeHeight = 10;
    const badgeColor = this.BADGE_COLORS[data.type] || [149, 165, 166];
    const badgeText =
      settings.receipt_header && data.type === 'sale'
        ? 'SALES INVOICE'
        : data.type.toUpperCase();

    // Center the badge on the page
    const badgeX = (pageWidth - badgeWidth) / 2;

    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(badgeX, currentY, badgeWidth, badgeHeight, 3, 3, 'F');

    this.setTextStyle(doc, 9, [255, 255, 255], 'bold');
    doc.text(badgeText, badgeX + badgeWidth / 2, currentY + 6.5, {
      align: 'center',
    });

    // Document number and date (right aligned)
    const infoX = pageWidth - margin;
    this.setTextStyle(doc, 10, [60, 60, 60], 'bold');
    doc.text(`#${data.document_no}`, infoX, currentY + 4, { align: 'right' });

    this.setTextStyle(doc, 9, this.COLORS.accent);
    doc.text(
      new Date(data.document_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      infoX,
      currentY + 10,
      { align: 'right' },
    );

    return currentY + badgeHeight + 15;
  }

  private renderPartyInfo(
    doc: jsPDF,
    data: InvoiceBaseDto,
    margin: number,
    currentY: number,
  ): number {
    if (!data.party) return currentY;

    const partyLabel =
      data.type === 'purchase'
        ? 'SUPPLIER'
        : data.type === 'quotation'
          ? 'CLIENT'
          : 'BILL TO';

    // Label
    this.setTextStyle(doc, 8, this.COLORS.accent, 'bold');
    doc.text(partyLabel, margin, currentY);
    currentY += 6;

    // Party name (larger and bold)
    this.setTextStyle(doc, 12, this.COLORS.primary, 'bold');
    doc.text(data.party.name, margin, currentY);
    currentY += 7;

    this.setTextStyle(doc, 9, this.COLORS.secondary);

    // If billing address exists, show billing details directly
    if (data.party.billing_address) {
      // Street address (with text wrapping)
      if (data.party.billing_address.street) {
        const streetLines = doc.splitTextToSize(
          data.party.billing_address.street,
          140,
        );
        doc.text(streetLines, margin, currentY);
        currentY += streetLines.length * 4.5;
      }

      // Phone (billing phone)
      if (data.party.billing_address.phone) {
        doc.text(data.party.billing_address.phone, margin, currentY);
        currentY += 4.5;
      }
    } else {
      // Fallback: show party address and contact if no billing address
      if (data.party.address) {
        const addressLines = doc.splitTextToSize(data.party.address, 140);
        doc.text(addressLines, margin, currentY);
        currentY += addressLines.length * 4.5;
      }

      const partyContact: string[] = [];
      if (data.party.phone) partyContact.push(data.party.phone);
      if (data.party.email) partyContact.push(data.party.email);

      if (partyContact.length > 0) {
        doc.text(partyContact.join(' • '), margin, currentY);
        currentY += 4.5;
      }
    }

    // Shipping address (only if different from billing)
    if (
      data.party.shipping_address &&
      (!data.party.billing_address ||
        data.party.billing_address.street !==
          data.party.shipping_address.street ||
        data.party.billing_address.city !== data.party.shipping_address.city)
    ) {
      currentY += 5;
      this.setTextStyle(doc, 8, this.COLORS.accent, 'bold');
      doc.text('SHIP TO', margin, currentY);
      currentY += 6;

      this.setTextStyle(doc, 9, this.COLORS.secondary);

      // Contact name (if different from party name)
      if (
        data.party.shipping_address.contact_name &&
        data.party.shipping_address.contact_name !== data.party.name
      ) {
        this.setTextStyle(doc, 10, this.COLORS.primary, 'bold');
        doc.text(data.party.shipping_address.contact_name, margin, currentY);
        currentY += 5;
        this.setTextStyle(doc, 9, this.COLORS.secondary);
      }

      // Street (with text wrapping)
      if (data.party.shipping_address.street) {
        const streetLines = doc.splitTextToSize(
          data.party.shipping_address.street,
          140,
        );
        doc.text(streetLines, margin, currentY);
        currentY += streetLines.length * 4.5;
      }

      // Phone (if different from billing)
      if (
        data.party.shipping_address.phone &&
        data.party.shipping_address.phone !== data.party.billing_address?.phone
      ) {
        doc.text(data.party.shipping_address.phone, margin, currentY);
        currentY += 4.5;
      }
    }

    return currentY + 7;
  }

  private renderItemsTable(
    doc: jsPDF,
    data: InvoiceBaseDto,
    margin: number,
    pageWidth: number,
    contentWidth: number,
    currentY: number,
  ): number {
    const tableStartY = currentY;
    const headerHeight = 10;

    // Table header background
    doc.setFillColor(
      this.COLORS.background[0],
      this.COLORS.background[1],
      this.COLORS.background[2],
    );
    doc.rect(margin, currentY, contentWidth, headerHeight, 'F');

    // Table headers
    this.setTextStyle(doc, 9, [60, 60, 60], 'bold');
    doc.text('ITEM', margin + 3, currentY + 6.5);
    doc.text('QTY', pageWidth - margin - 80, currentY + 6.5, {
      align: 'right',
    });
    doc.text('PRICE', pageWidth - margin - 50, currentY + 6.5, {
      align: 'right',
    });
    doc.text('TOTAL', pageWidth - margin - 3, currentY + 6.5, {
      align: 'right',
    });

    currentY += headerHeight;

    // Table items
    if (data.items && data.items.length > 0) {
      data.items.forEach((item, index) => {
        const rowHeight = 8;

        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(
            this.COLORS.backgroundAlt[0],
            this.COLORS.backgroundAlt[1],
            this.COLORS.backgroundAlt[2],
          );
          doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
        }

        this.setTextStyle(doc, 9, [40, 40, 40]);

        // Item name
        const itemName = item.name || 'Unknown Item';
        const maxWidth = contentWidth - 90;
        const nameLines = doc.splitTextToSize(itemName, maxWidth);
        doc.text(nameLines[0], margin + 3, currentY + 5.5);

        // Quantity
        doc.text(
          item.quantity?.toString() || '0',
          pageWidth - margin - 80,
          currentY + 5.5,
          { align: 'right' },
        );

        // Unit price
        doc.text(
          item.unit_price ? item.unit_price.toFixed(2) : '0.00',
          pageWidth - margin - 50,
          currentY + 5.5,
          { align: 'right' },
        );

        // Total
        this.setTextStyle(doc, 9, [40, 40, 40], 'bold');
        doc.text(
          item.total ? item.total.toFixed(2) : '0.00',
          pageWidth - margin - 3,
          currentY + 5.5,
          { align: 'right' },
        );

        currentY += rowHeight;
      });
    } else {
      this.setTextStyle(doc, 10, this.COLORS.light);
      doc.text('No items', margin + 3, currentY + 8);
      currentY += 15;
    }

    // Table border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.rect(margin, tableStartY, contentWidth, currentY - tableStartY);

    return currentY + 15;
  }

  private renderTotals(
    doc: jsPDF,
    data: InvoiceBaseDto,
    margin: number,
    pageWidth: number,
    currentY: number,
  ): number {
    const totalsX = pageWidth - margin - 60;

    // Subtotal
    this.setTextStyle(doc, 9, [80, 80, 80]);
    doc.text('Subtotal:', totalsX, currentY);
    doc.text(data.subtotal.toFixed(2), pageWidth - margin - 3, currentY, {
      align: 'right',
    });
    currentY += 6;

    // Discount
    if (data.discount > 0) {
      this.setTextStyle(doc, 9, this.COLORS.error);
      doc.text('Discount:', totalsX, currentY);
      doc.text(
        `-${data.discount.toFixed(2)}`,
        pageWidth - margin - 3,
        currentY,
        {
          align: 'right',
        },
      );
      currentY += 6;
    }

    // Tax
    if (data.tax > 0) {
      this.setTextStyle(doc, 9, [80, 80, 80]);
      doc.text('Tax:', totalsX, currentY);
      doc.text(data.tax.toFixed(2), pageWidth - margin - 3, currentY, {
        align: 'right',
      });
      currentY += 6;
    }

    // Divider line
    doc.setDrawColor(
      this.COLORS.divider[0],
      this.COLORS.divider[1],
      this.COLORS.divider[2],
    );
    doc.line(totalsX, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Grand total
    this.setTextStyle(doc, 12, this.COLORS.primary, 'bold');
    doc.text('TOTAL:', totalsX, currentY);
    doc.text(data.total.toFixed(2), pageWidth - margin - 3, currentY, {
      align: 'right',
    });

    return currentY + 15;
  }

  private renderPayments(
    doc: jsPDF,
    data: InvoiceBaseDto,
    margin: number,
    currentY: number,
  ): number {
    if (!data.payments || data.payments.length === 0) return currentY;

    this.setTextStyle(doc, 10, [60, 60, 60], 'bold');
    doc.text('PAYMENTS', margin, currentY);
    currentY += 8;

    data.payments.forEach((payment) => {
      this.setTextStyle(doc, 9, [80, 80, 80]);
      doc.text(payment.method, margin + 3, currentY);

      this.setTextStyle(doc, 9, [80, 80, 80], 'bold');
      doc.text(payment.amount.toFixed(2), margin + 50, currentY);

      if (payment.reference) {
        this.setTextStyle(doc, 8, this.COLORS.accent);
        doc.text(`(${payment.reference})`, margin + 70, currentY);
      }

      currentY += 6;
    });

    return currentY + 10;
  }

  private renderNotes(
    doc: jsPDF,
    data: InvoiceBaseDto,
    margin: number,
    contentWidth: number,
    currentY: number,
  ): number {
    if (!data.notes) return currentY;

    this.setTextStyle(doc, 9, this.COLORS.secondary);
    const noteLines = doc.splitTextToSize(data.notes, contentWidth - 80);
    doc.text(noteLines, margin, currentY);

    return currentY + noteLines.length * 5;
  }

  private async renderQRCode(
    doc: jsPDF,
    data: InvoiceBaseDto,
    settings: any,
    pageWidth: number,
    pageHeight: number,
    margin: number,
  ): Promise<void> {
    try {
      const qrData = JSON.stringify({
        type: data.type,
        document_no: data.document_no,
        total: data.total,
        date: data.document_date,
        business: settings.business_name,
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 100,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      const qrSize = 20;
      const qrX = pageWidth - margin - qrSize;
      const qrY = pageHeight - margin - qrSize - 8;

      // QR code border
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

      // QR code image
      doc.addImage(qrCodeDataUrl, qrX, qrY, qrSize, qrSize);

      // QR code label
      this.setTextStyle(doc, 7, this.COLORS.accent);
      doc.text('Scan to verify', qrX + qrSize / 2, qrY + qrSize + 5, {
        align: 'center',
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  private renderFooter(
    doc: jsPDF,
    settings: any,
    pageWidth: number,
    pageHeight: number,
    margin: number,
  ): void {
    const footerY = pageHeight - margin - 2;

    this.setTextStyle(doc, 7, this.COLORS.light);
    const footerMessage =
      settings.receipt_header && settings.footer_text
        ? settings.footer_text
        : settings.invoice_footer_message || 'Thank you for your business!';

    doc.text(footerMessage, pageWidth / 2, footerY, { align: 'center' });
  }

  // Helper method to set text style
  private setTextStyle(
    doc: jsPDF,
    size: number,
    color: number[],
    weight: 'normal' | 'bold' = 'normal',
  ): void {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', weight);
  }
}
