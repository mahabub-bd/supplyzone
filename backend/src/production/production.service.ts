import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/brand/entities/brand.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { ProductionQueryDto } from './dto/production-query.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import {
  ProductionLog,
  ProductionLogType,
} from './entities/production-log.entity';
import {
  ProductionItemStatus,
  ProductionOrderItem,
} from './entities/production-order-item.entity';
import {
  ProductionOrder,
  ProductionOrderStatus,
  ProductionPriority,
} from './entities/production-order.entity';
import {
  ProductionRecipe,
  RecipeStatus,
} from './entities/production-recipe.entity';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrder)
    private productionOrderRepo: Repository<ProductionOrder>,

    @InjectRepository(ProductionOrderItem)
    private productionOrderItemRepo: Repository<ProductionOrderItem>,

    @InjectRepository(ProductionLog)
    private productionLogRepo: Repository<ProductionLog>,

    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,

    @InjectRepository(ProductionRecipe)
    private productionRecipeRepo: Repository<ProductionRecipe>,

    private dataSource: DataSource,
  ) {}

  async create(
    createProductionOrderDto: CreateProductionOrderDto,
    userId: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // Validate warehouse exists
      const warehouse = await manager.findOne(Warehouse, {
        where: { id: createProductionOrderDto.warehouse_id },
      });
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }

      // Validate brand if provided
      if (createProductionOrderDto.brand_id) {
        const brand = await manager.findOne(Brand, {
          where: { id: createProductionOrderDto.brand_id },
        });
        if (!brand) {
          throw new NotFoundException('Brand not found');
        }
      }

      // Validate assigned user if provided
      if (createProductionOrderDto.assigned_to) {
        const assignedUser = await manager.findOne(User, {
          where: { id: createProductionOrderDto.assigned_to },
        });
        if (!assignedUser) {
          throw new NotFoundException('Assigned user not found');
        }
      }

      // Validate products and create items
      const productIds = createProductionOrderDto.items.map(
        (item) => item.product_id,
      );
      const products = await manager.findByIds(Product, productIds);

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products not found');
      }

      // Generate order number
      const orderNumber = await this.generateOrderNumber(manager);

      // Create production order
      const productionOrder = manager.create(ProductionOrder, {
        order_number: orderNumber,
        title: createProductionOrderDto.title.trim(),
        description: createProductionOrderDto.description?.trim(),
        brand_id: createProductionOrderDto.brand_id,
        warehouse_id: createProductionOrderDto.warehouse_id,
        priority:
          createProductionOrderDto.priority || ProductionPriority.NORMAL,
        planned_start_date: createProductionOrderDto.planned_start_date
          ? new Date(createProductionOrderDto.planned_start_date)
          : null,
        planned_completion_date:
          createProductionOrderDto.planned_completion_date
            ? new Date(createProductionOrderDto.planned_completion_date)
            : null,
        assigned_to: createProductionOrderDto.assigned_to,
        notes: createProductionOrderDto.notes?.trim(),
        created_by: userId,
      });

      const savedProductionOrder = await manager.save(productionOrder);

      // Validate recipes and collect recipe IDs
      const recipeIds = createProductionOrderDto.items
        .filter((item) => item.recipe_id)
        .map((item) => item.recipe_id);

      let activeRecipes = [];
      if (recipeIds.length > 0) {
        activeRecipes = await manager.find(ProductionRecipe, {
          where: { status: RecipeStatus.ACTIVE },
        });
      }

      // Create production order items
      const items = createProductionOrderDto.items.map((itemDto) => {
        const product = products.find((p) => p.id === itemDto.product_id);
        const estimatedCost =
          itemDto.planned_quantity * (itemDto.unit_cost || 0);

        // Validate recipe if provided
        if (itemDto.recipe_id) {
          const recipe = activeRecipes.find(
            (r) =>
              r.id === itemDto.recipe_id &&
              r.finished_product_id === itemDto.product_id,
          );

          if (!recipe) {
            throw new NotFoundException(
              `Active recipe not found for product ${itemDto.product_id}`,
            );
          }
        }

        return manager.create(ProductionOrderItem, {
          production_order_id: savedProductionOrder.id,
          product_id: itemDto.product_id,
          recipe_id: itemDto.recipe_id,
          planned_quantity: itemDto.planned_quantity,
          unit_cost: itemDto.unit_cost,
          estimated_cost: estimatedCost,
          specifications: itemDto.specifications?.trim(),
          expiry_date: itemDto.expiry_date
            ? new Date(itemDto.expiry_date)
            : null,
          status: ProductionItemStatus.PENDING,
        });
      });

      await manager.save(items);

      // Create log entry
      await this.createLog(
        manager,
        savedProductionOrder.id,
        ProductionLogType.ORDER_CREATED,
        `Production order ${orderNumber} created with ${items.length} items`,
        userId,
      );

      return await this.findOne(savedProductionOrder.id);
    });
  }

  async findAll(query: ProductionQueryDto) {
    const {
      search,
      status,
      priority,
      brand_id,
      warehouse_id,
      assigned_to,
      created_by,
      start_date_from,
      start_date_to,
      completion_date_from,
      completion_date_to,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.productionOrderRepo
      .createQueryBuilder('production_order')
      .leftJoinAndSelect('production_order.brand', 'brand')
      .leftJoinAndSelect('production_order.warehouse', 'warehouse')
      .leftJoinAndSelect('production_order.created_by_user', 'created_by_user')
      .leftJoinAndSelect(
        'production_order.assigned_to_user',
        'assigned_to_user',
      )
      .leftJoinAndSelect('production_order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(production_order.title ILIKE :search OR production_order.description ILIKE :search OR production_order.order_number ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('production_order.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('production_order.priority = :priority', {
        priority,
      });
    }

    if (brand_id) {
      queryBuilder.andWhere('production_order.brand_id = :brand_id', {
        brand_id,
      });
    }

    if (warehouse_id) {
      queryBuilder.andWhere('production_order.warehouse_id = :warehouse_id', {
        warehouse_id,
      });
    }

    if (assigned_to) {
      queryBuilder.andWhere('production_order.assigned_to = :assigned_to', {
        assigned_to,
      });
    }

    if (created_by) {
      queryBuilder.andWhere('production_order.created_by = :created_by', {
        created_by,
      });
    }

    // Date filters
    if (start_date_from) {
      queryBuilder.andWhere(
        'production_order.planned_start_date >= :start_date_from',
        {
          start_date_from: new Date(start_date_from),
        },
      );
    }

    if (start_date_to) {
      queryBuilder.andWhere(
        'production_order.planned_start_date <= :start_date_to',
        {
          start_date_to: new Date(start_date_to),
        },
      );
    }

    if (completion_date_from) {
      queryBuilder.andWhere(
        'production_order.planned_completion_date >= :completion_date_from',
        {
          completion_date_from: new Date(completion_date_from),
        },
      );
    }

    if (completion_date_to) {
      queryBuilder.andWhere(
        'production_order.planned_completion_date <= :completion_date_to',
        {
          completion_date_to: new Date(completion_date_to),
        },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const skip = (page - 1) * limit;
    queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('production_order.created_at', 'DESC');

    const productionOrders = await queryBuilder.getMany();

    return {
      data: productionOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    // Validate input to prevent NaN values
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid production order ID');
    }

    const productionOrder = await this.productionOrderRepo.findOne({
      where: { id },
      relations: [
        'brand',
        'warehouse',
        'created_by_user',
        'assigned_to_user',
        'items',
        'items.product',
      ],
    });

    if (!productionOrder) {
      throw new NotFoundException('Production order not found');
    }

    // Calculate summary statistics
    const summary = {
      total_planned_quantity: productionOrder.items.reduce(
        (sum, item) => sum + item.planned_quantity,
        0,
      ),
      total_actual_quantity: productionOrder.items.reduce(
        (sum, item) => sum + (item.actual_quantity || 0),
        0,
      ),
      total_good_quantity: productionOrder.items.reduce(
        (sum, item) => sum + (item.good_quantity || 0),
        0,
      ),
      total_defective_quantity: productionOrder.items.reduce(
        (sum, item) => sum + (item.defective_quantity || 0),
        0,
      ),
      total_estimated_cost: productionOrder.items.reduce(
        (sum, item) => sum + (item.estimated_cost || 0),
        0,
      ),
      total_actual_cost: productionOrder.items.reduce(
        (sum, item) => sum + (item.actual_cost || 0),
        0,
      ),
    };

    return {
      ...productionOrder,
      summary,
    };
  }

  async update(
    id: number,
    updateProductionOrderDto: UpdateProductionOrderDto,
    userId: number,
  ) {
    // Validate input to prevent NaN values
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid production order ID');
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    return await this.dataSource.transaction(async (manager) => {
      const productionOrder = await manager.findOne(ProductionOrder, {
        where: { id },
        relations: ['items'],
      });

      if (!productionOrder) {
        throw new NotFoundException('Production order not found');
      }

      // Validate relationships if provided
      if (updateProductionOrderDto.brand_id) {
        const brand = await manager.findOne(Brand, {
          where: { id: updateProductionOrderDto.brand_id },
        });
        if (!brand) {
          throw new NotFoundException('Brand not found');
        }
      }

      if (updateProductionOrderDto.warehouse_id) {
        const warehouse = await manager.findOne(Warehouse, {
          where: { id: updateProductionOrderDto.warehouse_id },
        });
        if (!warehouse) {
          throw new NotFoundException('Warehouse not found');
        }
      }

      if (updateProductionOrderDto.assigned_to) {
        const assignedUser = await manager.findOne(User, {
          where: { id: updateProductionOrderDto.assigned_to },
        });
        if (!assignedUser) {
          throw new NotFoundException('Assigned user not found');
        }
      }

      // Track status changes
      const statusChanged =
        updateProductionOrderDto.status &&
        updateProductionOrderDto.status !== productionOrder.status;

      // Update production order
      await manager.update(ProductionOrder, id, {
        title: updateProductionOrderDto.title?.trim(),
        description: updateProductionOrderDto.description?.trim(),
        brand_id: updateProductionOrderDto.brand_id,
        warehouse_id: updateProductionOrderDto.warehouse_id,
        status: updateProductionOrderDto.status,
        priority: updateProductionOrderDto.priority,
        planned_start_date: updateProductionOrderDto.planned_start_date
          ? new Date(updateProductionOrderDto.planned_start_date)
          : undefined,
        planned_completion_date:
          updateProductionOrderDto.planned_completion_date
            ? new Date(updateProductionOrderDto.planned_completion_date)
            : undefined,
        actual_start_date: updateProductionOrderDto.actual_start_date
          ? new Date(updateProductionOrderDto.actual_start_date)
          : undefined,
        actual_completion_date: updateProductionOrderDto.actual_completion_date
          ? new Date(updateProductionOrderDto.actual_completion_date)
          : undefined,
        assigned_to: updateProductionOrderDto.assigned_to,
        notes: updateProductionOrderDto.notes?.trim(),
      });

      // Update items if provided
      if (updateProductionOrderDto.items) {
        for (const itemDto of updateProductionOrderDto.items) {
          const item = productionOrder.items.find((i) => i.id === itemDto.id);
          if (!item) {
            throw new NotFoundException(
              `Production order item with ID ${itemDto.id} not found`,
            );
          }

          await manager.update(ProductionOrderItem, itemDto.id, {
            planned_quantity: itemDto.planned_quantity,
            actual_quantity: itemDto.actual_quantity,
            good_quantity: itemDto.good_quantity,
            defective_quantity: itemDto.defective_quantity,
            unit_cost: itemDto.unit_cost,
            actual_cost: itemDto.actual_cost,
            specifications: itemDto.specifications?.trim(),
            quality_notes: itemDto.quality_notes?.trim(),
            batch_number: itemDto.batch_number?.trim(),
            serial_number_range: itemDto.serial_number_range?.trim(),
            expiry_date: itemDto.expiry_date
              ? new Date(itemDto.expiry_date)
              : undefined,
          });
        }
      }

      // Create log entry for status change
      if (statusChanged) {
        await this.createLog(
          manager,
          id,
          ProductionLogType.STATUS_CHANGED,
          `Status changed from ${productionOrder.status} to ${updateProductionOrderDto.status}`,
          userId,
        );
      }

      return await this.findOne(id);
    });
  }

  async remove(id: number, userId: number) {
    // Validate input to prevent NaN values
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid production order ID');
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    const productionOrder = await this.productionOrderRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!productionOrder) {
      throw new NotFoundException('Production order not found');
    }

    // Check if production order can be deleted
    if (productionOrder.status === ProductionOrderStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Cannot delete production order that is in progress',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      // Soft delete production order (cascades to items)
      await manager.softDelete(ProductionOrder, id);

      // Create log entry
      await this.createLog(
        manager,
        id,
        ProductionLogType.ORDER_UPDATED,
        `Production order ${productionOrder.order_number} deleted`,
        userId,
      );
    });

    return { message: 'Production order deleted successfully' };
  }

  async getProductionLogs(productionOrderId: number) {
    // Validate input to prevent NaN values
    if (!Number.isInteger(productionOrderId) || productionOrderId <= 0) {
      throw new BadRequestException('Invalid production order ID');
    }

    const productionOrder = await this.productionOrderRepo.findOne({
      where: { id: productionOrderId },
    });

    if (!productionOrder) {
      throw new NotFoundException('Production order not found');
    }

    const logs = await this.productionLogRepo.find({
      where: { production_order_id: productionOrderId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return logs;
  }

  async getProductionStats() {
    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.productionOrderRepo.count(),
      this.productionOrderRepo.count({
        where: { status: ProductionOrderStatus.PENDING },
      }),
      this.productionOrderRepo.count({
        where: { status: ProductionOrderStatus.IN_PROGRESS },
      }),
      this.productionOrderRepo.count({
        where: { status: ProductionOrderStatus.COMPLETED },
      }),
      this.productionOrderRepo.count({
        where: { status: ProductionOrderStatus.CANCELLED },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      onHoldOrders:
        totalOrders -
        pendingOrders -
        inProgressOrders -
        completedOrders -
        cancelledOrders,
    };
  }

  private async generateOrderNumber(manager: any): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}`;

    const latestOrder = await manager
      .createQueryBuilder(ProductionOrder, 'production_order')
      .where('production_order.order_number LIKE :prefix', {
        prefix: `${prefix}-%`,
      })
      .orderBy('production_order.order_number', 'DESC')
      .getOne();

    let sequenceNumber = 1;
    if (latestOrder) {
      const latestSequence = parseInt(latestOrder.order_number.split('-')[2]);
      sequenceNumber = latestSequence + 1;
    }

    return `${prefix}-${sequenceNumber.toString().padStart(3, '0')}`;
  }

  private async createLog(
    manager: any,
    productionOrderId: number,
    logType: ProductionLogType,
    message: string,
    userId?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const log = manager.create(ProductionLog, {
      production_order_id: productionOrderId,
      log_type: logType,
      message,
      user_id: userId,
      metadata,
    });

    await manager.save(log);
  }
}
