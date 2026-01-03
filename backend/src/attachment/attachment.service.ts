import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Attachment } from './entities/attachment.entity';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
  });

  async uploadFile(file: Express.Multer.File, userId: number | null) {
    if (!file) {
      throw new InternalServerErrorException('File is required');
    }
    const uploadResult = await this.uploadToS3(file);

    const attachment = this.attachmentRepository.create({
      file_name: uploadResult.fileName,
      url: uploadResult.url,
      mime_type: uploadResult.mimeType,
      size: file.size,
      storage_type: 'S3',
      uploaded_by: userId,
    });

    return await this.attachmentRepository.save(attachment);
  }

  async uploadMultipleFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new InternalServerErrorException('Files are required');
    }
    return Promise.all(files.map((file) => this.uploadToS3(file)));
  }

  private async uploadToS3(file: Express.Multer.File) {
    const fileName = `${uuid()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3.send(new PutObjectCommand(params));

      return {
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
        fileName,
        mimeType: file.mimetype,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error uploading file');
    }
  }

  async getAllAttachments() {
    return await this.attachmentRepository.find({
      order: { created_at: 'DESC' },
      relations: ['uploaded_user'],
      select: {
        id: true,
        file_name: true,
        url: true,
        mime_type: true,
        size: true,
        storage_type: true,
        created_at: true,
        uploaded_user: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    });
  }

  async getAttachmentById(id: number) {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['uploaded_user'],
      select: {
        id: true,
        file_name: true,
        url: true,
        mime_type: true,
        size: true,
        storage_type: true,
        created_at: true,
        uploaded_user: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');
    return attachment;
  }
  private async deleteFromS3(fileName: string) {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
        }),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }
  async deleteAttachment(id: number) {
    const attachment = await this.getAttachmentById(id);
    if (!attachment) throw new NotFoundException('Attachment not found');

    await this.deleteFromS3(attachment.file_name);
    await this.attachmentRepository.remove(attachment);

    return { message: 'Attachment deleted successfully' };
  }
}
