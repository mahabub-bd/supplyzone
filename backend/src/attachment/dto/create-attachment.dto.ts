import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty()
  file_name: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false })
  mime_type?: string;

  @ApiProperty({ required: false })
  size?: number;

  @ApiProperty({ required: false })
  storage_type?: string;

  @ApiProperty({ example: 'user-1', required: true })
  uploaded_by: string;
}
