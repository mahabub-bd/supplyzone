import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { AccountService } from 'src/account/account.service';
import { DataSource, Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,

    @InjectRepository(Account)
    private accountRepo: Repository<Account>,

    private dataSource: DataSource,
    private accountService: AccountService,
  ) {}

  async create(dto: CreateSupplierDto) {
    const existingSupplier = await this.supplierRepo.findOne({
      where: { name: dto.name.trim() },
    });

    if (existingSupplier) {
      throw new BadRequestException(
        `Supplier with name "${dto.name}" already exists`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // 🔹 Generate Supplier Code (SUP-001, SUP-002...)
      const lastSupplier = await manager
        .createQueryBuilder(Supplier, 's')
        .orderBy('s.id', 'DESC')
        .getOne();

      let nextCode = 'SUP-001';
      if (lastSupplier?.supplier_code) {
        const num = parseInt(lastSupplier.supplier_code.split('-')[1], 10) || 0;
        nextCode = `SUP-${String(num + 1).padStart(3, '0')}`;
      }

      // Create supplier first to get the ID
      const tempSupplier = manager.create(Supplier, {
        ...dto,
        supplier_code: nextCode,
      });
      const savedSupplier = await manager.save(tempSupplier);

      // Create or get supplier account using the same logic as purchase service
      const account = await this.accountService.getOrCreateSupplierAccount(
        savedSupplier.id,
        savedSupplier.name
      );

      // Update supplier with the account
      savedSupplier.account = account;
      return await manager.save(savedSupplier);
    });
  }

  async findAll() {
    return this.supplierRepo.find({
      relations: [
        'products',
        'account',
        'purchase_history',
        'purchase_history.items',
        'purchase_history.items.product',
      ],
    });
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
      relations: [
        'products',
        'account',
        'purchase_history',
        'purchase_history.items',
        'purchase_history.items.product',
      ],
    });

    if (!supplier) throw new NotFoundException('Supplier not found');

    const totalPurchased = supplier.purchase_history.reduce((sum, purchase) => {
      const purchaseTotal = purchase.items.reduce(
        (itemTotal, item) =>
          itemTotal + Number(item.quantity) * Number(item.price),
        0,
      );
      return sum + purchaseTotal;
    }, 0);

    return { ...supplier, totalPurchased };
  }

  async update(id: number, dto: UpdateSupplierDto) {
    await this.supplierRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.supplierRepo.delete(id);
    return { message: 'Supplier deleted successfully' };
  }
}
