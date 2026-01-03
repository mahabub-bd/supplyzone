import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrandModule } from 'src/brand/brand.module';
import { Brand } from 'src/brand/entities/brand.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Product } from 'src/product/entities/product.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';

import { Unit } from 'src/unit/entities/unit.entity';
import { MaterialConsumption } from './entities/material-consumption.entity';
import { ProductionLog } from './entities/production-log.entity';
import { ProductionOrderItem } from './entities/production-order-item.entity';
import { ProductionOrder } from './entities/production-order.entity';
import { ProductionRecipeItem } from './entities/production-recipe-item.entity';
import { ProductionRecipe } from './entities/production-recipe.entity';
import { ProductionMaterialService } from './production-material.service';
import { ProductionRecipeController } from './production-recipe.controller';
import { ProductionRecipeService } from './production-recipe.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrder,
      ProductionOrderItem,
      ProductionLog,
      ProductionRecipe,
      ProductionRecipeItem,
      MaterialConsumption,
      Product,
      Brand,
      User,
      Unit,
      Warehouse,
      Inventory,
      Role,
      Permission,
    ]),
    BrandModule,
  ],
  controllers: [ProductionController, ProductionRecipeController],
  providers: [ProductionService, ProductionRecipeService, ProductionMaterialService, RbacService],
  exports: [ProductionService, ProductionRecipeService, ProductionMaterialService],
})
export class ProductionModule {}