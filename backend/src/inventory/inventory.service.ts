import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { TransferStockDto } from './dto/transfet-stock.dto';

import { Inventory } from './entities/inventory.entity';
import {
  StockMovement,
  StockMovementType,
} from './entities/stock-movement.entity';

import { Product } from 'src/product/entities/product.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private invRepo: Repository<Inventory>,

    @InjectRepository(StockMovement)
    private movRepo: Repository<StockMovement>,

    private dataSource: DataSource,
  ) {}

  // 📦 ADD NEW STOCK ENTRY WITH PRICE SYNC
  async addStock(dto: CreateInventoryDto) {
    return await this.dataSource.transaction(async (manager) => {
      // Validate product exists
      const product = await manager.findOne(Product, {
        where: { id: dto.product_id },
      });
      if (!product) throw new NotFoundException('Product not found');

      // Validate warehouse exists
      const warehouse = await manager.findOne(Warehouse, {
        where: { id: dto.warehouse_id },
      });
      if (!warehouse) throw new NotFoundException('Warehouse not found');

      // Save inventory stock
      const inv = manager.create(Inventory, dto);
      const saved = await manager.save(inv);

      // Sync purchase price to Product
      if (dto.purchase_price) {
        await manager.update(Product, dto.product_id, {
          purchase_price: dto.purchase_price,
        });
      }

      // Record stock movement
      await manager.save(StockMovement, {
        product_id: dto.product_id,
        warehouse_id: dto.warehouse_id,
        quantity: dto.quantity,
        type: StockMovementType.IN,
        note: 'New stock added',
      });

      return saved;
    });
  }

  // 📄 GET ALL INVENTORY (BATCH-WISE WITH VALUES)
  async findAll() {
    const batches = await this.invRepo.find({
      relations: ['product', 'warehouse'],
      order: { created_at: 'DESC' },
    });

    // Add calculated values to each batch
    return batches.map((batch) => {
      const remaining = batch.quantity - batch.sold_quantity;
      const purchasePrice = Number(batch.product?.purchase_price || 0);
      const sellingPrice = Number(batch.product?.selling_price || 0);

      return {
        ...batch,
        remaining_quantity: remaining,
        purchase_value: remaining * purchasePrice,
        sale_value: remaining * sellingPrice,
        potential_profit: remaining * (sellingPrice - purchasePrice),
      };
    });
  }

  // 🔍 GET STOCK BY PRODUCT (WITH VALUES)
  async getProductStock(product_id: number) {
    const batches = await this.invRepo.find({
      where: { product_id },
      relations: ['warehouse', 'product'],
    });

    // Add calculated values to each batch
    return batches.map((batch) => {
      const remaining = batch.quantity - batch.sold_quantity;
      const purchasePrice = Number(batch.product?.purchase_price || 0);
      const sellingPrice = Number(batch.product?.selling_price || 0);

      return {
        ...batch,
        remaining_quantity: remaining,
        purchase_value: remaining * purchasePrice,
        sale_value: remaining * sellingPrice,
        potential_profit: remaining * (sellingPrice - purchasePrice),
      };
    });
  }

  async getProductWiseStock(product_type?: string) {
    // Build query with optional product type filter
    const query = this.invRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('product.images', 'productImages')
      .leftJoinAndSelect('inv.warehouse', 'warehouse');

    // Filter by product type if provided (supports comma-separated values)
    if (product_type) {
      const productTypes = product_type.split(',').map((t) => t.trim());
      query.andWhere('product.product_type IN (:...productTypes)', {
        productTypes,
      });
    }

    const inventories = await query.getMany();

    const grouped = {};

    inventories.forEach((inv) => {
      const pid = inv.product_id;
      const remaining = inv.quantity - inv.sold_quantity;

      if (!grouped[pid]) {
        grouped[pid] = {
          product_id: pid,
          product: inv.product,
          total_stock: 0,
          total_sold_quantity: 0,
          remaining_stock: 0,
          purchase_value: 0,
          sale_value: 0,
          warehouses: [],
        };
      }

      grouped[pid].total_stock += inv.quantity;
      grouped[pid].total_sold_quantity += inv.sold_quantity;
      grouped[pid].remaining_stock += remaining;
      // Calculate values based on remaining stock
      const purchasePrice = Number(inv.product?.purchase_price || 0);
      const sellingPrice = Number(inv.product?.selling_price || 0);

      grouped[pid].purchase_value += remaining * purchasePrice;
      grouped[pid].sale_value += remaining * sellingPrice;

      grouped[pid].warehouses.push({
        id: inv.id, // Inventory ID for stock adjustment
        warehouse_id: inv.warehouse_id, // Warehouse ID for stock transfer
        warehouse: inv.warehouse,
        purchased_quantity: inv.quantity,
        sold_quantity: inv.sold_quantity,
        remaining_quantity: remaining,
        batch_no: inv.batch_no,
        purchase_value: remaining * purchasePrice,
        sale_value: remaining * sellingPrice,
      });
    });

    return Object.values(grouped);
  }

  async getWarehouseWiseStock(warehouseId?: number, search?: string) {
    // Build query with optional filters
    const query = this.invRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('product.images', 'productImages')
      .leftJoinAndSelect('inv.warehouse', 'warehouse');

    // Filter by warehouse if provided
    if (warehouseId) {
      query.where('inv.warehouse_id = :warehouseId', { warehouseId });
    }

    // Search by product name or SKU if provided
    if (search) {
      query.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.sku) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const inventories = await query.getMany();

    // Group images by product to avoid duplication
    const productImagesMap = {};
    inventories.forEach((inv) => {
      if (inv.product && inv.product.images) {
        const productId = inv.product_id;
        if (!productImagesMap[productId]) {
          productImagesMap[productId] = inv.product.images;
        }
      }
    });

    const grouped = {};

    inventories.forEach((inv) => {
      const wid = inv.warehouse_id;
      const remaining = inv.quantity - inv.sold_quantity;

      if (!grouped[wid]) {
        grouped[wid] = {
          warehouse_id: wid,
          warehouse: inv.warehouse,
          total_stock: 0, // total purchased
          total_sold_quantity: 0, // total sold
          remaining_stock: 0, // total available
          purchase_value: 0, // 👈 Total purchase value
          sale_value: 0, // 👈 Total sale value
          products: [],
        };
      }

      grouped[wid].total_stock += inv.quantity;
      grouped[wid].total_sold_quantity += inv.sold_quantity;
      grouped[wid].remaining_stock += remaining;

      // Calculate values
      const purchasePrice = Number(inv.product?.purchase_price || 0);
      const sellingPrice = Number(inv.product?.selling_price || 0);

      grouped[wid].purchase_value += remaining * purchasePrice;
      grouped[wid].sale_value += remaining * sellingPrice;

      // Format product data to include images
      const productData = {
        ...inv.product,
        images: productImagesMap[inv.product_id] || [],
      };

      grouped[wid].products.push({
        product: productData,
        purchased_quantity: inv.quantity,
        sold_quantity: inv.sold_quantity,
        remaining_quantity: remaining,
        batch_no: inv.batch_no,
        purchase_value: remaining * purchasePrice, // Product-level purchase value
        sale_value: remaining * sellingPrice, // Product-level sale value
      });
    });

    return Object.values(grouped);
  }

  // 📉 ADJUST STOCK
  // Accepts either a numeric ID (inventory.id) or composite ID (productId-warehouseId)
  async adjustStock(id: string | number, dto: AdjustStockDto) {
    let inv: Inventory;

    // Check if id is a composite format (e.g., "1-2" for productId-warehouseId)
    if (typeof id === 'string' && id.includes('-')) {
      const parts = id.split('-').map(Number);

      if (parts.length !== 2 || parts.some(isNaN)) {
        throw new BadRequestException(
          'Invalid composite ID format. Expected: productId-warehouseId',
        );
      }

      const [productId, warehouseId] = parts;

      inv = await this.invRepo.findOne({
        where: { product_id: productId, warehouse_id: warehouseId },
      });
    } else {
      // Traditional numeric ID lookup
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

      if (isNaN(numericId)) {
        throw new BadRequestException('Invalid inventory ID');
      }

      inv = await this.invRepo.findOne({ where: { id: numericId } });
    }

    if (!inv) throw new NotFoundException('Inventory not found');

    const newQty = inv.quantity + dto.quantity;
    if (newQty < 0) throw new BadRequestException('Stock cannot be negative');

    inv.quantity = newQty;
    await this.invRepo.save(inv);

    // Keep signed quantity (not always absolute) for tracking
    await this.movRepo.save({
      product_id: inv.product_id,
      warehouse_id: inv.warehouse_id,
      quantity: dto.quantity,
      type: StockMovementType.ADJUST,
      note: dto.note ?? 'Stock adjusted',
    });

    return inv;
  }

  // 📋 GET STOCK MOVEMENT HISTORY
  async getStockMovements(
    productId?: number,
    warehouseId?: number,
    type?: StockMovementType,
  ) {
    const query = this.movRepo
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.from_warehouse', 'from_warehouse')
      .leftJoinAndSelect('movement.to_warehouse', 'to_warehouse')
      .leftJoinAndSelect('movement.created_by', 'created_by')
      .orderBy('movement.created_at', 'DESC');

    // Filter by product if provided
    if (productId) {
      query.andWhere('movement.product_id = :productId', { productId });
    }

    // Filter by warehouse if provided
    if (warehouseId) {
      query.andWhere('movement.warehouse_id = :warehouseId', { warehouseId });
    }

    // Filter by type if provided
    if (type) {
      query.andWhere('movement.type = :type', { type });
    }

    return await query.getMany();
  }

  // 📖 GET INVENTORY JOURNAL (LEDGER-STYLE WITH RUNNING BALANCE)
  async getInventoryJournal(
    productId?: number,
    warehouseId?: number,
    startDate?: string,
    endDate?: string,
    sort: 'asc' | 'desc' = 'desc',
  ) {
    const query = this.movRepo
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('product.images', 'productImages')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.from_warehouse', 'from_warehouse')
      .leftJoinAndSelect('movement.to_warehouse', 'to_warehouse')
      .leftJoinAndSelect('movement.created_by', 'created_by')
      .orderBy('movement.created_at', sort.toUpperCase() as 'DESC' | 'ASC');

    // Filter by product if provided
    if (productId) {
      query.andWhere('movement.product_id = :productId', { productId });
    }

    // Filter by warehouse if provided
    if (warehouseId) {
      query.andWhere('movement.warehouse_id = :warehouseId', { warehouseId });
    }

    // Filter by date range if provided
    if (startDate) {
      query.andWhere('movement.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('movement.created_at <= :endDate', { endDate });
    }

    const movements = await query.getMany();

    // Get initial balances from inventory for accurate running balance
    const inventoryQuery = this.invRepo
      .createQueryBuilder('inv')
      .select('inv.product_id', 'product_id')
      .addSelect('inv.warehouse_id', 'warehouse_id')
      .addSelect('inv.quantity', 'quantity');

    // Apply same filters to inventory
    if (productId) {
      inventoryQuery.where('inv.product_id = :productId', { productId });
    }
    if (warehouseId) {
      inventoryQuery.andWhere('inv.warehouse_id = :warehouseId', {
        warehouseId,
      });
    }

    const inventories = await inventoryQuery.getRawMany();

    // Initialize balance map with current inventory quantities
    const balanceMap = new Map<string, number>();
    inventories.forEach((inv) => {
      const key = `${inv.product_id}-${inv.warehouse_id}`;
      balanceMap.set(key, inv.quantity);
    });

    // Calculate running balances and format journal entries
    const journalEntries = [];

    // For ascending sort, we need to process forward and calculate running balance
    // For descending sort, we still need to process movements chronologically to calculate balances correctly
    const chronologicalMovements =
      sort === 'asc' ? movements : [...movements].reverse();

    // Initialize running balances
    const runningBalances = new Map<string, number>();
    inventories.forEach((inv) => {
      const key = `${inv.product_id}-${inv.warehouse_id}`;
      runningBalances.set(key, inv.quantity);
    });

    if (sort === 'asc') {
      // Process in chronological order
      chronologicalMovements.forEach((movement) => {
        const key = `${movement.product_id}-${movement.warehouse_id}`;
        const currentBalance = runningBalances.get(key) || 0;

        // Determine debit/credit based on movement type
        let debit = 0;
        let credit = 0;
        let description = movement.note || '';

        switch (movement.type) {
          case StockMovementType.IN:
            debit = movement.quantity;
            description = description || 'Stock received';
            break;
          case StockMovementType.OUT:
            credit = movement.quantity;
            description = description || 'Stock sold';
            break;
          case StockMovementType.ADJUST:
            if (movement.quantity > 0) {
              debit = movement.quantity;
              description = description || 'Stock increase adjustment';
            } else {
              credit = Math.abs(movement.quantity);
              description = description || 'Stock decrease adjustment';
            }
            break;
          case StockMovementType.TRANSFER:
            credit = movement.quantity;
            description =
              description ||
              `Transferred to ${movement.to_warehouse?.name || 'warehouse'}`;
            break;
        }

        journalEntries.push({
          id: movement.id,
          date: movement.created_at,
          product: {
            id: movement.product?.id,
            name: movement.product?.name,
            sku: movement.product?.sku,
            image: movement.product?.images?.[0]?.url || null,
          },
          warehouse: movement.warehouse
            ? {
                id: movement.warehouse.id,
                name: movement.warehouse.name,
              }
            : null,
          type: movement.type,
          description,
          reference:
            movement.type === StockMovementType.TRANSFER
              ? `From: ${movement.from_warehouse?.name || 'N/A'} → To: ${movement.to_warehouse?.name || 'N/A'}`
              : null,
          debit, // Quantity IN
          credit, // Quantity OUT
          balance: currentBalance + debit - credit, // Balance after this transaction
          created_by: movement.created_by
            ? {
                id: movement.created_by.id,
                name: movement.created_by.full_name,
              }
            : null,
        });

        // Update running balance
        runningBalances.set(key, currentBalance + debit - credit);
      });
    } else {
      // For descending sort, calculate balances backwards
      const tempBalances = new Map<string, number>();
      runningBalances.forEach((value, key) => {
        tempBalances.set(key, value);
      });

      // Process backwards to calculate what balance was at each point
      for (let i = chronologicalMovements.length - 1; i >= 0; i--) {
        const movement = chronologicalMovements[i];
        const key = `${movement.product_id}-${movement.warehouse_id}`;
        const currentBalance = tempBalances.get(key) || 0;

        // Determine debit/credit based on movement type
        let debit = 0;
        let credit = 0;
        let description = movement.note || '';

        switch (movement.type) {
          case StockMovementType.IN:
            debit = movement.quantity;
            description = description || 'Stock received';
            break;
          case StockMovementType.OUT:
            credit = movement.quantity;
            description = description || 'Stock sold';
            break;
          case StockMovementType.ADJUST:
            if (movement.quantity > 0) {
              debit = movement.quantity;
              description = description || 'Stock increase adjustment';
            } else {
              credit = Math.abs(movement.quantity);
              description = description || 'Stock decrease adjustment';
            }
            break;
          case StockMovementType.TRANSFER:
            credit = movement.quantity;
            description =
              description ||
              `Transferred to ${movement.to_warehouse?.name || 'warehouse'}`;
            break;
        }

        // Add to journal entries (will be reversed at the end)
        journalEntries.push({
          id: movement.id,
          date: movement.created_at,
          product: {
            id: movement.product?.id,
            name: movement.product?.name,
            sku: movement.product?.sku,
            image: movement.product?.images?.[0]?.url || null,
          },
          warehouse: movement.warehouse
            ? {
                id: movement.warehouse.id,
                name: movement.warehouse.name,
              }
            : null,
          type: movement.type,
          description,
          reference:
            movement.type === StockMovementType.TRANSFER
              ? `From: ${movement.from_warehouse?.name || 'N/A'} → To: ${movement.to_warehouse?.name || 'N/A'}`
              : null,
          debit, // Quantity IN
          credit, // Quantity OUT
          balance: currentBalance, // Balance after this transaction
          created_by: movement.created_by
            ? {
                id: movement.created_by.id,
                name: movement.created_by.full_name,
              }
            : null,
        });

        // Calculate balance before this transaction
        const balanceBefore = currentBalance - debit + credit;
        tempBalances.set(key, balanceBefore);
      }

      // Reverse to maintain descending order
      journalEntries.reverse();
    }

    return journalEntries;
  }

  // 🔁 TRANSFER STOCK BETWEEN WAREHOUSES
  async transferStock(dto: TransferStockDto, userId?: number) {
    return await this.dataSource.transaction(async (manager) => {
      const { product_id, from_warehouse_id, to_warehouse_id, quantity, note } =
        dto;

      if (from_warehouse_id === to_warehouse_id) {
        throw new BadRequestException(
          'Cannot transfer stock to the same warehouse',
        );
      }

      const sourceInv = await manager.findOne(Inventory, {
        where: { product_id, warehouse_id: from_warehouse_id },
      });
      if (!sourceInv)
        throw new NotFoundException(
          'Stock not found in source warehouse for this product',
        );

      if (sourceInv.quantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock! Available: ${sourceInv.quantity}`,
        );
      }

      // Deduct from source
      sourceInv.quantity -= quantity;
      await manager.save(sourceInv);

      // Add to destination
      let destInv = await manager.findOne(Inventory, {
        where: { product_id, warehouse_id: to_warehouse_id },
      });

      if (destInv) {
        destInv.quantity += quantity;
      } else {
        // Create new inventory entry with all source information
        destInv = manager.create(Inventory, {
          product_id,
          warehouse_id: to_warehouse_id,
          quantity,
          batch_no: sourceInv.batch_no, // Copy batch number
          supplier: sourceInv.supplier, // Copy supplier
          purchase_price: sourceInv.purchase_price, // Copy purchase price
          expiry_date: sourceInv.expiry_date, // Copy expiry date
          purchase_item_id: sourceInv.purchase_item_id, // Copy purchase item reference
        });
      }
      await manager.save(destInv);

      // Log transfer movement
      await manager.save(StockMovement, {
        product_id,
        warehouse_id: from_warehouse_id,
        quantity,
        type: StockMovementType.TRANSFER,
        from_warehouse_id,
        to_warehouse_id,
        note: note ?? `Transferred ${quantity} units`,
        created_by: userId ? ({ id: userId } as any) : undefined,
      });

      return {
        message: 'Stock transferred successfully',
        transferred_quantity: quantity,
        from: from_warehouse_id,
        to: to_warehouse_id,
      };
    });
  }
}
