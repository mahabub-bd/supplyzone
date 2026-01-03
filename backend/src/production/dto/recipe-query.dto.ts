import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class RecipeQueryDto {
  @ApiProperty({ required: false })
  search?: any;

  @ApiProperty({ required: false })
  recipe_type?: any;

  @ApiProperty({ required: false })
  status?: any;

  @ApiProperty({ required: false })
  finished_product_id?: any;

  @ApiProperty({ required: false })
  material_product_id?: any;

  @ApiProperty({ required: false })
  effective_date_from?: any;

  @ApiProperty({ required: false })
  effective_date_to?: any;

  @ApiProperty({ required: false })
  page?: any;

  @ApiProperty({ required: false })
  limit?: any;

  @ApiProperty({ required: false })
  sort_by?: any;

  @ApiProperty({ required: false })
  sort_order?: any;
}
