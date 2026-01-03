import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from 'src/attachment/entities/attachment.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { Category } from 'src/category/entities/category.entity';
import { SubCategory } from 'src/category/entities/subcategory.entity';

import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Unit } from 'src/unit/entities/unit.entity';

import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Permission,
      Role,
      Tag,
      Attachment,
      Supplier,
      Inventory,
      Category,
      SubCategory,
      Brand,
      Unit,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, RbacService],
  exports: [ProductService],
})
export class ProductModule {}
