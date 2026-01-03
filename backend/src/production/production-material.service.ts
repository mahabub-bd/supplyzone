import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Repository } from 'typeorm';
import { ConsumptionStatus, MaterialConsumption } from './entities/material-consumption.entity';
import { ProductionRecipeService } from './production-recipe.service';

@Injectable()
export class ProductionMaterialService {
  constructor(
    @InjectRepository(MaterialConsumption)
    private materialConsumptionRepo: Repository<MaterialConsumption>,

    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

    private productionRecipeService: ProductionRecipeService,
  ) {}

  async planMaterialConsumption(productionOrderId: number, productionOrderItemId: number, recipeId: number, quantity: number) {
    // Calculate material requirements using recipe
    const materialRequirements = await this.productionRecipeService.calculateMaterialRequirements(recipeId, quantity);

    // Create material consumption records
    const consumptions = [];

    for (const requirement of materialRequirements.material_requirements) {
      // Find available inventory batches
      const availableInventory = await this.findAvailableInventory(
        requirement.material_product_id,
        requirement.total_with_waste
      );

      if (availableInventory.length === 0) {
        throw new BadRequestException(
          `Insufficient inventory for material ${requirement.material_name}. Required: ${requirement.total_with_waste}, Available: 0`
        );
      }

      // Create consumption records for each batch
      let remainingQuantity = requirement.total_with_waste;

      for (const batch of availableInventory) {
        if (remainingQuantity <= 0) break;

        const consumeQuantity = Math.min(batch.quantity, remainingQuantity);

        const consumption = this.materialConsumptionRepo.create({
          production_order_id: productionOrderId,
          production_order_item_id: productionOrderItemId,
          recipe_item_id: 0, // Will be set later when we find the recipe item
          inventory_batch_id: batch.id,
          planned_quantity: consumeQuantity,
          unit_cost: batch.purchase_price,
          total_cost: consumeQuantity * batch.purchase_price,
          status: ConsumptionStatus.PLANNED,
        });

        consumptions.push(consumption);
        remainingQuantity -= consumeQuantity;
      }

      if (remainingQuantity > 0) {
        throw new BadRequestException(
          `Insufficient inventory for material ${requirement.material_name}. Required: ${requirement.total_with_waste}, Available: ${requirement.total_with_waste - remainingQuantity}`
        );
      }
    }

    // Save all consumption records
    return await this.materialConsumptionRepo.save(consumptions);
  }

  async consumeMaterials(productionOrderId: number, userId: number) {
    const plannedConsumptions = await this.materialConsumptionRepo.find({
      where: {
        production_order_id: productionOrderId,
        status: ConsumptionStatus.PLANNED,
      },
      relations: ['inventory_batch'],
    });

    if (plannedConsumptions.length === 0) {
      throw new NotFoundException('No planned material consumption found for this production order');
    }

    const results = [];

    for (const consumption of plannedConsumptions) {
      // Check if inventory has enough quantity
      if (consumption.inventory_batch.quantity < consumption.planned_quantity) {
        throw new BadRequestException(
          `Insufficient quantity in inventory batch ${consumption.inventory_batch.batch_no}. Available: ${consumption.inventory_batch.quantity}, Planned: ${consumption.planned_quantity}`
        );
      }

      // Update inventory quantity
      consumption.inventory_batch.quantity -= consumption.planned_quantity;
      await this.inventoryRepo.save(consumption.inventory_batch);

      // Update consumption record
      consumption.actual_quantity = consumption.planned_quantity;
      consumption.wasted_quantity = 0;
      consumption.status = ConsumptionStatus.CONSUMED;
      consumption.consumption_date = new Date();

      const updatedConsumption = await this.materialConsumptionRepo.save(consumption);
      results.push(updatedConsumption);
    }

    return results;
  }

  async reserveMaterials(productionOrderId: number) {
    const plannedConsumptions = await this.materialConsumptionRepo.find({
      where: {
        production_order_id: productionOrderId,
        status: ConsumptionStatus.PLANNED,
      },
      relations: ['inventory_batch'],
    });

    const results = [];

    for (const consumption of plannedConsumptions) {
      // Check if inventory has enough quantity
      if (consumption.inventory_batch.quantity < consumption.planned_quantity) {
        throw new BadRequestException(
          `Insufficient quantity in inventory batch ${consumption.inventory_batch.batch_no}. Available: ${consumption.inventory_batch.quantity}, Required: ${consumption.planned_quantity}`
        );
      }

      // Update consumption status to reserved
      consumption.status = ConsumptionStatus.RESERVED;
      const updatedConsumption = await this.materialConsumptionRepo.save(consumption);
      results.push(updatedConsumption);
    }

    return results;
  }

  async releaseReservedMaterials(productionOrderId: number) {
    const reservedConsumptions = await this.materialConsumptionRepo.find({
      where: {
        production_order_id: productionOrderId,
        status: ConsumptionStatus.RESERVED,
      },
    });

    const results = [];

    for (const consumption of reservedConsumptions) {
      // Update consumption status back to planned
      consumption.status = ConsumptionStatus.PLANNED;
      const updatedConsumption = await this.materialConsumptionRepo.save(consumption);
      results.push(updatedConsumption);
    }

    return results;
  }

  async getMaterialAvailability(materialProductId: number, requiredQuantity: number) {
    const inventory = await this.inventoryRepo.find({
      where: {
        product_id: materialProductId,
      },
      order: { created_at: 'ASC' }, // FIFO (First In, First Out)
    });

    const totalAvailable = inventory.reduce((sum, item) => sum + item.quantity, 0);

    return {
      material_product_id: materialProductId,
      required_quantity: requiredQuantity,
      total_available: totalAvailable,
      is_sufficient: totalAvailable >= requiredQuantity,
      available_batches: inventory.map(batch => ({
        batch_id: batch.id,
        batch_no: batch.batch_no,
        quantity: batch.quantity,
        expiry_date: batch.expiry_date,
        purchase_price: batch.purchase_price,
      })),
    };
  }

  private async findAvailableInventory(materialProductId: number, requiredQuantity: number): Promise<Inventory[]> {
    return await this.inventoryRepo.find({
      where: {
        product_id: materialProductId,
      },
      order: { created_at: 'ASC' }, // FIFO (First In, First Out)
    });
  }

  async getMaterialConsumptionSummary(productionOrderId: number) {
    const consumptions = await this.materialConsumptionRepo.find({
      where: {
        production_order_id: productionOrderId,
      },
      relations: [
        'recipe_item',
        'recipe_item.material_product',
        'inventory_batch',
      ],
    });

    const summary = {
      total_materials_planned: consumptions.length,
      total_materials_consumed: consumptions.filter(c => c.status === ConsumptionStatus.CONSUMED).length,
      total_planned_cost: consumptions.reduce((sum, c) => sum + c.total_cost, 0),
      total_actual_cost: consumptions.reduce((sum, c) => sum + (c.actual_quantity || 0) * c.unit_cost, 0),
      total_wasted_cost: consumptions.reduce((sum, c) => sum + (c.wasted_quantity || 0) * c.unit_cost, 0),
      material_breakdown: {},
    };

    // Group by material
    for (const consumption of consumptions) {
      const materialId = consumption.recipe_item.material_product_id;
      const materialName = consumption.recipe_item.material_product.name;

      if (!summary.material_breakdown[materialId]) {
        summary.material_breakdown[materialId] = {
          material_name: materialName,
          planned_quantity: 0,
          actual_quantity: 0,
          wasted_quantity: 0,
          total_cost: 0,
        };
      }

      summary.material_breakdown[materialId].planned_quantity += consumption.planned_quantity;
      summary.material_breakdown[materialId].actual_quantity += consumption.actual_quantity || 0;
      summary.material_breakdown[materialId].wasted_quantity += consumption.wasted_quantity || 0;
      summary.material_breakdown[materialId].total_cost += consumption.total_cost;
    }

    return summary;
  }
}