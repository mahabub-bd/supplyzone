import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

/**
 * Controller for managing business settings and configuration
 */
@ApiTags('Settings')
@ApiBearerAuth('token')
@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Business Settings Endpoints
   */

  @Get()
  @Permissions('settings.view')
  @ApiOperation({
    summary: 'Get business settings',
    description: 'Retrieve current business configuration and preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: Setting,
  })
  async getSettings(): Promise<Setting> {
    return this.settingsService.getSettings();
  }

  @Post()
  @Permissions('settings.update')
  @ApiOperation({
    summary: 'Update business settings',
    description: 'Update business configuration and preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: Setting,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  async updateSettings(@Body() updateDto: UpdateSettingDto): Promise<Setting> {
    return this.settingsService.updateSettings(updateDto);
  }

  /**
   * Logo Management Endpoints
   */

  @Post('logo/:attachmentId')
  @Permissions('settings.update')
  @ApiOperation({
    summary: 'Set attachment as business logo',
    description: 'Set an existing attachment as the business logo',
  })
  @ApiParam({
    name: 'attachmentId',
    description: 'ID of the attachment to set as logo',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Logo set successfully',
    type: Setting,
  })
  @ApiResponse({
    status: 404,
    description: 'Attachment not found',
  })
  async setLogo(
    @Param('attachmentId') attachmentId: number,
  ): Promise<Setting> {
    return this.settingsService.setLogoFromAttachment(attachmentId);
  }

  @Delete('logo')
  @Permissions('settings.update')
  @ApiOperation({
    summary: 'Remove business logo',
    description: 'Remove the current business logo attachment',
  })
  @ApiResponse({
    status: 200,
    description: 'Logo removed successfully',
    type: Setting,
  })
  async removeLogo(): Promise<Setting> {
    return this.settingsService.removeLogo();
  }

  /**
   * Utility and Preview Endpoints
   */

  @Get('receipt/preview')
  @Permissions('settings.view')
  @ApiOperation({
    summary: 'Get receipt preview settings',
    description: 'Get current settings formatted for receipt printing',
  })
  @ApiResponse({
    status: 200,
    description: 'Receipt preview settings retrieved successfully',
  })
  async getReceiptPreview(): Promise<any> {
    return this.settingsService.getReceiptPreview();
  }

  @Get('invoice/layouts')
  @Permissions('settings.view')
  @ApiOperation({
    summary: 'Get available invoice layouts',
    description: 'Get list of available invoice layout templates',
  })
  @ApiResponse({
    status: 200,
    description: 'Available invoice layouts retrieved successfully',
  })
  async getAvailableInvoiceLayouts(): Promise<any> {
    // Return static reference to dynamic layouts
    // The actual layouts are managed through the invoice-layouts endpoints
    return {
      layouts: [
        {
          id: 'standard',
          name: 'Standard Invoice',
          description: 'Traditional invoice layout with all details',
          preview: '/invoice-rendering/layouts/standard/preview',
          paper_size: 'A4',
          is_thermal: false,
        },
        {
          id: 'compact',
          name: 'Compact Receipt',
          description: 'Space-efficient layout for smaller receipts',
          preview: '/invoice-rendering/layouts/compact/preview',
          paper_size: 'A4',
          is_thermal: false,
        },
        {
          id: 'thermal',
          name: 'Thermal Printer',
          description: 'Optimized for thermal receipt printers',
          preview: '/invoice-rendering/layouts/thermal/preview',
          paper_size: 'thermal',
          is_thermal: true,
        },
      ],
      note: 'For custom layouts management, use /invoice-layouts endpoints',
    };
  }

  /**
   * Administrative Endpoints
   */

  @Post('reset')
  @Permissions('settings.admin')
  @ApiOperation({
    summary: 'Reset settings to defaults',
    description: 'Reset all settings to default values (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings reset to defaults successfully',
    type: Setting,
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  async resetToDefaults(): Promise<Setting> {
    return this.settingsService.resetToDefaults();
  }
}