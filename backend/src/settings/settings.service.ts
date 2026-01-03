import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentService } from 'src/attachment/attachment.service';
import { Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepo: Repository<Setting>,
    private attachmentService: AttachmentService,
  ) {}

  /**
   * Get current business settings
   */
  async getSettings(): Promise<Setting> {
    let settings = await this.settingsRepo.findOne({
      where: {},
      relations: ['logo_attachment'],
    });

    if (!settings) {
      // Create default settings if none exist with Bangladesh as default country
      settings = await this.settingsRepo.save({
        currency: 'BDT',
        currency_symbol: '৳',
        default_tax_percentage: 0,
        low_stock_threshold: 20,
        include_customer_details: true,
        enable_auto_backup: true,
        backup_retention_days: 30,
        country: 'Bangladesh',
        default_invoice_layout: 'standard',
        show_product_images: false,
        show_product_skus: true,
        show_item_tax_details: false,
        show_payment_breakdown: true,
        invoice_paper_size: 'A4',
        print_duplicate_copy: false,
        use_thermal_printer: false,
        qr_code_type: 'business_info',
        qr_code_custom_content: null,
      });
    }

    return settings;
  }

  /**
   * Update business settings
   */
  async updateSettings(updateDto: UpdateSettingDto): Promise<Setting> {
    let settings = await this.getSettings();

    // Update fields from DTO
    Object.assign(settings, updateDto);

    return await this.settingsRepo.save(settings);
  }

  async setLogoFromAttachment(attachmentId: number): Promise<Setting> {
    const settings = await this.getSettings();

    try {
      await this.attachmentService.getAttachmentById(attachmentId);
    } catch (error) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found`,
      );
    }

    settings.logo_attachment_id = attachmentId;

    // Clear the existing relationship to force refresh
    settings.logo_attachment = null;

    await this.settingsRepo.save(settings);

    // Fetch the settings again with the updated relationship
    return this.settingsRepo.findOne({
      where: { id: settings.id },
      relations: ['logo_attachment'],
    });
  }

  async removeLogo(): Promise<Setting> {
    const settings = await this.getSettings();

    settings.logo_attachment = null;
    settings.logo_attachment_id = null;

    return await this.settingsRepo.save(settings);
  }

  async getReceiptPreview(): Promise<any> {
    const settings = await this.getSettings();

    return {
      business_name: settings.business_name,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      website: settings.website,
      currency: settings.currency,
      currency_symbol: settings.currency_symbol,
      tax_registration: settings.tax_registration,
      company_registration: settings.company_registration,
      footer_text: settings.footer_text,
      receipt_header: settings.receipt_header,
      include_qr_code: settings.include_qr_code,
      qr_code_type: settings.qr_code_type,
      qr_code_custom_content: settings.qr_code_custom_content,
      include_customer_details: settings.include_customer_details,
      logo_url: settings.logo_attachment ? settings.logo_attachment.url : null,
      // Invoice layout settings
      default_invoice_layout: settings.default_invoice_layout,
      show_product_images: settings.show_product_images,
      show_product_skus: settings.show_product_skus,
      show_item_tax_details: settings.show_item_tax_details,
      show_payment_breakdown: settings.show_payment_breakdown,
      invoice_paper_size: settings.invoice_paper_size,
      print_duplicate_copy: settings.print_duplicate_copy,
      invoice_footer_message: settings.invoice_footer_message,
      use_thermal_printer: settings.use_thermal_printer,
    };
  }

  /**
   * Reset settings to default values
   */
  async resetToDefaults(): Promise<Setting> {
    let settings = await this.getSettings();

    Object.assign(settings, {
      business_name: null,
      tagline: null,
      email: null,
      phone: null,
      address: null,
      website: null,
      currency: 'USD',
      currency_symbol: '$',
      tax_registration: null,
      company_registration: null,
      default_tax_percentage: 0,
      low_stock_threshold: 20,
      footer_text: null,
      receipt_header: null,
      include_qr_code: false,
      qr_code_type: 'business_info',
      qr_code_custom_content: null,
      include_customer_details: true,
      enable_auto_backup: true,
      backup_retention_days: 30,
      logo_attachment: null,
      logo_attachment_id: null,
      // Invoice layout defaults
      default_invoice_layout: 'standard',
      show_product_images: false,
      show_product_skus: true,
      show_item_tax_details: false,
      show_payment_breakdown: true,
      invoice_paper_size: 'A4',
      print_duplicate_copy: false,
      invoice_footer_message: null,
      use_thermal_printer: false,
    });

    return await this.settingsRepo.save(settings);
  }

  async getSettingValue(key: string): Promise<any> {
    const settings = await this.getSettings();
    return settings[key];
  }

  async updateSettingValue(key: string, value: any): Promise<Setting> {
    const settings = await this.getSettings();
    settings[key] = value;
    return await this.settingsRepo.save(settings);
  }
}
