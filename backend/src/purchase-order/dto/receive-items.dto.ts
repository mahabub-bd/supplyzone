import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReceiveItemDto {
  @ApiProperty({ description: 'Purchase Order Item ID' })
  @IsNumber()
  @IsNotEmpty()
  item_id: number;

  @ApiProperty({ description: 'Quantity to receive' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Warehouse ID where items will be stored',
    required: false,
  })
  @IsNumber()
  @Min(1)
  warehouse_id?: number;
}

export class ReceiveItemsDto {
  @ApiProperty({ type: [ReceiveItemDto], description: 'Items to receive' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];

  @ApiProperty({
    description: 'Notes about the receiving process',
    required: false,
  })
  notes?: string;
}
