import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { CreateProductionRecipeDto } from './dto/create-production-recipe.dto';
import { MaterialConsumptionQueryDto } from './dto/material-consumption.dto';
import { UpdateProductionRecipeDto } from './dto/update-production-recipe.dto';
import { MaterialConsumption } from './entities/material-consumption.entity';
import {
  MaterialType,
  ProductionRecipeItem,
} from './entities/production-recipe-item.entity';
import {
  ProductionRecipe,
  RecipeStatus,
  RecipeType,
} from './entities/production-recipe.entity';

@Injectable()
export class ProductionRecipeService {
  constructor(
    @InjectRepository(ProductionRecipe)
    private productionRecipeRepo: Repository<ProductionRecipe>,

    @InjectRepository(ProductionRecipeItem)
    private productionRecipeItemRepo: Repository<ProductionRecipeItem>,

    @InjectRepository(MaterialConsumption)
    private materialConsumptionRepo: Repository<MaterialConsumption>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,

    private dataSource: DataSource,
  ) {}

  async create(
    createProductionRecipeDto: CreateProductionRecipeDto,
    userId: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // Validate finished product exists
      const finishedProduct = await manager.findOne(Product, {
        where: { id: createProductionRecipeDto.finished_product_id },
      });
      if (!finishedProduct) {
        throw new NotFoundException('Finished product not found');
      }

      // Generate recipe code if not provided
      let recipeCode = createProductionRecipeDto.recipe_code?.trim();
      if (!recipeCode) {
        // Generate recipe code from product name
        const prefix = finishedProduct.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 10);
        const timestamp = Date.now().toString(36).toUpperCase();
        recipeCode = `REC-${prefix}-${timestamp}`;
      }

      // Check for duplicate recipe code
      const existingRecipe = await manager.findOne(ProductionRecipe, {
        where: { recipe_code: recipeCode },
      });
      if (existingRecipe) {
        throw new BadRequestException('Recipe code already exists');
      }

      // Validate all material products exist
      const materialProductIds = createProductionRecipeDto.recipe_items.map(
        (item) => item.material_product_id,
      );
      const materialProducts = await manager.findByIds(
        Product,
        materialProductIds,
      );

      if (materialProducts.length !== materialProductIds.length) {
        throw new NotFoundException('One or more material products not found');
      }

      // Create production recipe
      const recipe = manager.create(ProductionRecipe, {
        name: createProductionRecipeDto.name.trim(),
        recipe_code: recipeCode,
        finished_product_id: createProductionRecipeDto.finished_product_id,
        description: createProductionRecipeDto.description?.trim(),
        version: '1.0',
        recipe_type: RecipeType.MANUFACTURING,
        standard_quantity: createProductionRecipeDto.standard_quantity || 1,
        unit_id: createProductionRecipeDto.unit_id,
        estimated_time_minutes: createProductionRecipeDto.estimated_time_minutes,
        yield_percentage: createProductionRecipeDto.yield_percentage,
        status: RecipeStatus.DRAFT,
      });

      const savedRecipe = await manager.save(recipe);

      // Create recipe items
      const recipeItems = createProductionRecipeDto.recipe_items.map(
        (itemDto, index) => {
          // Get the material product to fetch purchase_price
          const materialProduct = materialProducts.find(
            (p) => p.id === itemDto.material_product_id,
          );

          // Use purchase_price from product
          const unitCost = materialProduct?.purchase_price ?? 0;
          const totalCost = itemDto.required_quantity * unitCost;

          return manager.create(ProductionRecipeItem, {
            recipe_id: savedRecipe.id,
            material_product_id: itemDto.material_product_id,
            material_type: itemDto.material_type || MaterialType.RAW_MATERIAL,
            required_quantity: itemDto.required_quantity,
            unit_id: itemDto.unit_id,
            consumption_rate: itemDto.consumption_rate,
            waste_percentage: itemDto.waste_percentage,
            unit_cost: unitCost,
            total_cost: totalCost,
            specifications: itemDto.description?.trim(),
            priority: itemDto.priority ?? (index + 1),
            is_optional: itemDto.is_optional || false,
          });
        },
      );

      await manager.save(recipeItems);

      return this.findOne(savedRecipe.id);
    });
  }

  async findAll(query: any) {
    const {
      search,
      recipe_type,
      status,
      finished_product_id,
      material_product_id,
      effective_date_from,
      effective_date_to,
      page,
      limit,
      sort_by,
      sort_order,
    } = query;

    // Set defaults after destructuring
    const currentPage = page ? Number(page) : 1;
    const currentLimit = limit ? Number(limit) : 10;
    const currentSortBy = sort_by || 'created_at';
    const currentSortOrder = sort_order || 'DESC';

    const queryBuilder = this.productionRecipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.finished_product', 'finished_product')
      .leftJoinAndSelect('recipe.recipe_items', 'recipe_items')
      .leftJoinAndSelect('recipe_items.material_product', 'material_product');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(recipe.name ILIKE :search OR recipe.description ILIKE :search OR recipe.recipe_code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (recipe_type) {
      queryBuilder.andWhere('recipe.recipe_type = :recipe_type', {
        recipe_type,
      });
    }

    if (status) {
      queryBuilder.andWhere('recipe.status = :status', { status });
    }

    if (finished_product_id) {
      queryBuilder.andWhere(
        'recipe.finished_product_id = :finished_product_id',
        { finished_product_id: Number(finished_product_id) },
      );
    }

    if (material_product_id) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM production_recipe_items pri WHERE pri.recipe_id = recipe.id AND pri.material_product_id = :material_product_id)',
        { material_product_id: Number(material_product_id) },
      );
    }

    // Date filters
    if (effective_date_from) {
      queryBuilder.andWhere('recipe.effective_date >= :effective_date_from', {
        effective_date_from: new Date(effective_date_from),
      });
    }

    if (effective_date_to) {
      queryBuilder.andWhere('recipe.effective_date <= :effective_date_to', {
        effective_date_to: new Date(effective_date_to),
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const skip = (currentPage - 1) * currentLimit;
    queryBuilder
      .skip(skip)
      .take(currentLimit)
      .orderBy(
        `recipe.${currentSortBy}`,
        currentSortOrder.toUpperCase() as 'ASC' | 'DESC',
      );

    const recipes = await queryBuilder.getMany();

    // Calculate summary for each recipe
    const recipesWithSummary = recipes.map((recipe) => {
      const totalMaterialCost = recipe.recipe_items.reduce(
        (sum, item) => sum + (item.total_cost || 0),
        0,
      );
      const totalMaterials = recipe.recipe_items.length;
      const optionalMaterials = recipe.recipe_items.filter(
        (item) => item.is_optional,
      ).length;

      return {
        ...recipe,
        summary: {
          total_material_cost: totalMaterialCost,
          total_materials: totalMaterials,
          optional_materials: optionalMaterials,
          required_materials: totalMaterials - optionalMaterials,
        },
      };
    });

    return {
      data: recipesWithSummary,
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async findOne(id: number) {
    const recipe = await this.productionRecipeRepo.findOne({
      where: { id },
      relations: [
        'finished_product',
        'recipe_items',
        'recipe_items.material_product',
      ],
    });

    if (!recipe) {
      throw new NotFoundException('Production recipe not found');
    }

    // Calculate detailed summary
    const summary = {
      total_material_cost: recipe.recipe_items.reduce(
        (sum, item) => sum + (item.total_cost || 0),
        0,
      ),
      total_materials: recipe.recipe_items.length,
      optional_materials: recipe.recipe_items.filter((item) => item.is_optional)
        .length,
      required_materials: recipe.recipe_items.filter(
        (item) => !item.is_optional,
      ).length,
      total_required_quantity: recipe.recipe_items.reduce(
        (sum, item) => sum + item.required_quantity,
        0,
      ),
      average_waste_percentage:
        recipe.recipe_items.reduce(
          (sum, item) => sum + (item.waste_percentage || 0),
          0,
        ) / recipe.recipe_items.length || 0,
      material_types: [
        ...new Set(recipe.recipe_items.map((item) => item.material_type)),
      ],
    };

    return {
      ...recipe,
      summary,
    };
  }

  async update(
    id: number,
    updateProductionRecipeDto: UpdateProductionRecipeDto,
    userId: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const recipe = await manager.findOne(ProductionRecipe, {
        where: { id },
        relations: ['recipe_items'],
      });

      if (!recipe) {
        throw new NotFoundException('Production recipe not found');
      }

      // Validate finished product if provided
      if (updateProductionRecipeDto.finished_product_id) {
        const finishedProduct = await manager.findOne(Product, {
          where: { id: updateProductionRecipeDto.finished_product_id },
        });
        if (!finishedProduct) {
          throw new NotFoundException('Finished product not found');
        }
      }

      // Check for duplicate recipe code (excluding current recipe)
      if (updateProductionRecipeDto.recipe_code) {
        const existingRecipe = await manager.findOne(ProductionRecipe, {
          where: {
            recipe_code: updateProductionRecipeDto.recipe_code,
            id: Not(id),
          },
        });
        if (existingRecipe) {
          throw new BadRequestException('Recipe code already exists');
        }
      }

      // Update recipe
      await manager.update(ProductionRecipe, id, {
        name: updateProductionRecipeDto.name?.trim(),
        recipe_code: updateProductionRecipeDto.recipe_code?.trim(),
        finished_product_id: updateProductionRecipeDto.finished_product_id,
        description: updateProductionRecipeDto.description?.trim(),
        status: updateProductionRecipeDto.status,
        standard_quantity: updateProductionRecipeDto.standard_quantity,
        unit_id: updateProductionRecipeDto.unit_id,
        estimated_time_minutes: updateProductionRecipeDto.estimated_time_minutes,
        yield_percentage: updateProductionRecipeDto.yield_percentage,
      });

      // Update recipe items if provided
      if (updateProductionRecipeDto.recipe_items) {
        // Fetch all material products for cost lookup
        const allMaterialProductIds = updateProductionRecipeDto.recipe_items
          .map((item) => item.material_product_id)
          .filter((id) => id != null);

        const allMaterialProducts = allMaterialProductIds.length > 0
          ? await manager.findByIds(Product, allMaterialProductIds)
          : [];

        for (const itemDto of updateProductionRecipeDto.recipe_items) {
          // Get the material product to fetch purchase_price
          const materialProduct = allMaterialProducts.find(
            (p) => p.id === itemDto.material_product_id,
          );

          // Use purchase_price from product
          const unitCost = materialProduct?.purchase_price ?? 0;
          const totalCost = itemDto.required_quantity * unitCost;

          if (itemDto.id) {
            // Update existing item
            const item = recipe.recipe_items.find((i) => i.id === itemDto.id);
            if (!item) {
              throw new NotFoundException(
                `Recipe item with ID ${itemDto.id} not found`,
              );
            }

            await manager.update(ProductionRecipeItem, itemDto.id, {
              material_product_id: itemDto.material_product_id,
              material_type: itemDto.material_type,
              required_quantity: itemDto.required_quantity,
              unit_id: itemDto.unit_id,
              consumption_rate: itemDto.consumption_rate,
              waste_percentage: itemDto.waste_percentage,
              unit_cost: unitCost,
              total_cost: totalCost,
              specifications: itemDto.description?.trim(),
              priority: itemDto.priority,
              is_optional: itemDto.is_optional,
            });
          } else {
            // Add new item
            const newItem = manager.create(ProductionRecipeItem, {
              recipe_id: id,
              material_product_id: itemDto.material_product_id,
              material_type: itemDto.material_type || MaterialType.RAW_MATERIAL,
              required_quantity: itemDto.required_quantity,
              unit_id: itemDto.unit_id,
              consumption_rate: itemDto.consumption_rate,
              waste_percentage: itemDto.waste_percentage,
              unit_cost: unitCost,
              total_cost: totalCost,
              specifications: itemDto.description?.trim(),
              priority: itemDto.priority ?? (recipe.recipe_items.length + 1),
              is_optional: itemDto.is_optional || false,
            });

            await manager.save(newItem);
          }
        }
      }

      return await this.findOne(id);
    });
  }

  async remove(id: number) {
    const recipe = await this.productionRecipeRepo.findOne({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException('Production recipe not found');
    }

    // Check if recipe can be deleted (not in active use)
    if (recipe.status === RecipeStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot delete active recipe. Please deactivate it first.',
      );
    }

    await this.productionRecipeRepo.softDelete(id);
    return { message: 'Production recipe deleted successfully' };
  }

  async calculateMaterialRequirements(recipeId: number, quantity: number) {
    const recipe = await this.findOne(recipeId);

    const multiplier = quantity / recipe.standard_quantity;

    const materialRequirements = recipe.recipe_items.map((item) => ({
      material_product_id: item.material_product_id,
      material_name: item.material_product.name,
      material_type: item.material_type,
      required_quantity: item.required_quantity * multiplier,
      unit: item.unit_of_measure,
      estimated_cost: (item.total_cost || 0) * multiplier,
      waste_percentage: item.waste_percentage,
      total_with_waste:
        item.required_quantity *
        multiplier *
        (1 + (item.waste_percentage || 0) / 100),
      is_optional: item.is_optional,
      specifications: item.specifications,
    }));

    return {
      recipe_id: recipeId,
      recipe_code: recipe.recipe_code,
      recipe_name: recipe.name,
      standard_quantity: recipe.standard_quantity,
      requested_quantity: quantity,
      multiplier,
      total_estimated_cost: materialRequirements.reduce(
        (sum, item) => sum + item.estimated_cost,
        0,
      ),
      material_requirements: materialRequirements,
    };
  }

  async getMaterialConsumption(query: MaterialConsumptionQueryDto) {
    const {
      production_order_id,
      production_order_item_id,
      recipe_item_id,
      inventory_batch_id,
      status,
      material_product_id,
      consumption_date_from,
      consumption_date_to,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.materialConsumptionRepo
      .createQueryBuilder('consumption')
      .leftJoinAndSelect('consumption.production_order', 'production_order')
      .leftJoinAndSelect(
        'consumption.production_order_item',
        'production_order_item',
      )
      .leftJoinAndSelect('consumption.recipe_item', 'recipe_item')
      .leftJoinAndSelect('consumption.inventory_batch', 'inventory_batch')
      .leftJoinAndSelect('recipe_item.material_product', 'material_product');

    // Apply filters
    if (production_order_id) {
      queryBuilder.andWhere(
        'consumption.production_order_id = :production_order_id',
        { production_order_id },
      );
    }

    if (production_order_item_id) {
      queryBuilder.andWhere(
        'consumption.production_order_item_id = :production_order_item_id',
        { production_order_item_id },
      );
    }

    if (recipe_item_id) {
      queryBuilder.andWhere('consumption.recipe_item_id = :recipe_item_id', {
        recipe_item_id,
      });
    }

    if (inventory_batch_id) {
      queryBuilder.andWhere(
        'consumption.inventory_batch_id = :inventory_batch_id',
        { inventory_batch_id },
      );
    }

    if (status) {
      queryBuilder.andWhere('consumption.status = :status', { status });
    }

    if (material_product_id) {
      queryBuilder.andWhere(
        'recipe_item.material_product_id = :material_product_id',
        { material_product_id },
      );
    }

    // Date filters
    if (consumption_date_from) {
      queryBuilder.andWhere(
        'consumption.consumption_date >= :consumption_date_from',
        {
          consumption_date_from: new Date(consumption_date_from),
        },
      );
    }

    if (consumption_date_to) {
      queryBuilder.andWhere(
        'consumption.consumption_date <= :consumption_date_to',
        {
          consumption_date_to: new Date(consumption_date_to),
        },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('consumption.created_at', 'DESC');

    const consumptions = await queryBuilder.getMany();

    return {
      data: consumptions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
