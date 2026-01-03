import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AttachmentService } from './attachment.service';
@ApiBearerAuth('token')
@ApiTags('Attachments')
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  // ==== Single Upload ====
  @Post('single')
  @ApiOperation({ summary: 'Upload single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const userId = req.user?.id ? Number(req.user.id) : null;
    return await this.attachmentService.uploadFile(file, userId);
  }

  // ==== Multiple Upload ====
  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB each
    }),
  )
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return await this.attachmentService.uploadMultipleFiles(files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attachments' })
  @ApiResponse({ status: 200, description: 'Return all attachments.' })
  async getAll() {
    return await this.attachmentService.getAllAttachments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single attachment by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Id of attachment' })
  @ApiResponse({ status: 200, description: 'Return attachment data.' })
  @ApiResponse({ status: 404, description: 'Attachment not found.' })
  async getOne(@Param('id') id: string) {
    return await this.attachmentService.getAttachmentById(Number(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attachment by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Id of attachment' })
  @ApiResponse({ status: 200, description: 'Deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Attachment not found.' })
  async deleteFile(@Param('id') id: string) {
    return await this.attachmentService.deleteAttachment(Number(id));
  }
}
