import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/subcategory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, SubCategory, Permission, Role]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, RbacService],
  exports: [CategoryService],
})
export class CategoryModule {}
