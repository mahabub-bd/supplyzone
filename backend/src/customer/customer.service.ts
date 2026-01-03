import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { BillingAddress } from './entities/billing-address.entity';
import { ShippingAddress } from './entities/shipping-address.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,

    @InjectRepository(Account)
    private accountRepo: Repository<Account>,

    @InjectRepository(BillingAddress)
    private billingAddressRepo: Repository<BillingAddress>,

    @InjectRepository(ShippingAddress)
    private shippingAddressRepo: Repository<ShippingAddress>,

    private dataSource: DataSource,
  ) {}
  async generateCustomerAccountNumber() {
    const last = await this.accountRepo
      .createQueryBuilder('a')
      .where('CAST(a.account_number AS INTEGER) BETWEEN :start AND :end', {
        start: 1000,
        end: 1999,
      })
      .orderBy('CAST(a.account_number AS INTEGER)', 'DESC')
      .getOne();

    if (!last) return 1000;

    return parseInt(last.account_number, 10) + 1;
  }

  async create(dto: CreateCustomerDto) {
    return await this.dataSource.transaction(async (manager) => {
      if (dto.phone) {
        const existingPhone = await manager.findOne(Customer, {
          where: { phone: dto.phone },
        });
        if (existingPhone) {
          throw new BadRequestException(
            `Phone number already exists: ${dto.phone}`,
          );
        }
      }

      if (dto.email) {
        const existingEmail = await manager.findOne(Customer, {
          where: { email: dto.email },
        });
        if (existingEmail) {
          throw new BadRequestException(`Email already exists: ${dto.email}`);
        }
      }

      // 🔹 Generate Customer Code (CUS-001, CUS-002...)
      const lastCustomer = await manager
        .createQueryBuilder(Customer, 'c')
        .orderBy('c.id', 'DESC')
        .getOne();

      let nextCode = 'CUS-001';
      if (lastCustomer?.customer_code) {
        const num = parseInt(lastCustomer.customer_code.split('-')[1], 10) || 0;
        nextCode = `CUS-${String(num + 1).padStart(3, '0')}`;
      }

      // Create Customer
      const customer = manager.create(Customer, {
        ...dto,
        customer_code: nextCode,
      });

      const saved = await manager.save(customer);

      // Create or Update Billing Address if provided
      if (dto.billing_address) {
        let billingAddress = await manager.findOne(BillingAddress, {
          where: { customer_id: saved.id },
        });

        if (billingAddress) {
          // Update existing billing address
          Object.assign(billingAddress, dto.billing_address);
          await manager.save(billingAddress);
        } else {
          // Create new billing address
          billingAddress = manager.create(BillingAddress, {
            ...dto.billing_address,
            customer_id: saved.id,
          });
          await manager.save(billingAddress);
        }
      }

      // Create or Update Shipping Address if provided
      if (dto.shipping_address) {
        let shippingAddress = await manager.findOne(ShippingAddress, {
          where: { customer_id: saved.id },
        });

        if (shippingAddress) {
          // Update existing shipping address
          Object.assign(shippingAddress, dto.shipping_address);
          await manager.save(shippingAddress);
        } else {
          // Create new shipping address
          shippingAddress = manager.create(ShippingAddress, {
            ...dto.shipping_address,
            customer_id: saved.id,
          });
          await manager.save(shippingAddress);
        }
      }

      // Create Receivable Account for the customer
      const accountCode = `AR.CUSTOMER.${saved.id}`;
      let account = await manager.findOne(Account, {
        where: { code: accountCode },
      });

      if (!account) {
        const account_number = (
          await this.generateCustomerAccountNumber()
        ).toString();

        account = await manager.save(
          manager.create(Account, {
            account_number,
            code: accountCode,
            name: `${saved.name} Receivable`,
            type: 'asset',
            isCash: false,
            isBank: false,
            isCustomer: true,
          }),
        );
      }

      saved.account_id = account.id;
      await manager.save(saved);

      //  Return customer with account and addresses
      return manager.findOne(Customer, {
        where: { id: saved.id },
        relations: ['account', 'billing_address', 'shipping_address'],
      });
    });
  }

  async findAll(search?: string, page: number = 1, limit: number = 10) {
    const qb = this.customerRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.account', 'account')
      .leftJoinAndSelect('c.group', 'group')
      .leftJoinAndSelect('c.billing_address', 'billing_address')
      .leftJoinAndSelect('c.shipping_address', 'shipping_address')
      .orderBy('c.id', 'DESC');

    // 🔍 Search by name or phone
    if (search) {
      qb.where('LOWER(c.name) LIKE :search OR c.phone LIKE :searchExact', {
        search: `%${search.toLowerCase()}%`,
        searchExact: `%${search}%`,
      });
    }

    // 📄 Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.customerRepo.findOne({
      where: { id },
      relations: ['account', 'group', 'sales', 'sales.items', 'sales.payments', 'billing_address', 'shipping_address'],
    });

    if (!data) throw new NotFoundException('Customer not found');
    return data;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    return await this.dataSource.transaction(async (manager) => {
      // Extract billing and shipping addresses from dto
      const { billing_address, shipping_address, ...customerData } = dto;

      // Update customer basic info
      await manager.update(Customer, id, customerData);

      // Update billing address if provided
      if (billing_address) {
        const customer = await manager.findOne(Customer, {
          where: { id },
          relations: ['billing_address'],
        });

        if (customer.billing_address) {
          // Update existing billing address
          await manager.update(
            BillingAddress,
            customer.billing_address.id,
            billing_address,
          );
        } else {
          // Create new billing address
          const billingAddress = manager.create(BillingAddress, {
            ...billing_address,
            customer_id: id,
          });
          await manager.save(billingAddress);
        }
      }

      // Update shipping address if provided
      if (shipping_address) {
        const customer = await manager.findOne(Customer, {
          where: { id },
          relations: ['shipping_address'],
        });

        if (customer.shipping_address) {
          // Update existing shipping address
          await manager.update(
            ShippingAddress,
            customer.shipping_address.id,
            shipping_address,
          );
        } else {
          // Create new shipping address
          const shippingAddress = manager.create(ShippingAddress, {
            ...shipping_address,
            customer_id: id,
          });
          await manager.save(shippingAddress);
        }
      }

      // Return updated customer with all relations
      return manager.findOne(Customer, {
        where: { id },
        relations: ['account', 'billing_address', 'shipping_address'],
      });
    });
  }

  async remove(id: number) {
    await this.customerRepo.delete(id);
    return { message: 'Customer deleted successfully' };
  }

  async addRewardPoints(customerId: number, points: number) {
    const customer = await this.findOne(customerId);
    customer.reward_points = Number(customer.reward_points || 0) + points;
    await this.customerRepo.save(customer);
    return customer;
  }

  async redeemRewardPoints(customerId: number, points: number) {
    const customer = await this.findOne(customerId);
    const currentPoints = Number(customer.reward_points || 0);

    if (currentPoints < points) {
      throw new BadRequestException(
        `Insufficient reward points. Available: ${currentPoints}, Requested: ${points}`,
      );
    }

    customer.reward_points = currentPoints - points;
    await this.customerRepo.save(customer);
    return customer;
  }

  async updateBillingAddress(customerId: number, billingAddressData: any) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
      relations: ['billing_address'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.billing_address) {
      // Update existing billing address
      await this.billingAddressRepo.update(
        customer.billing_address.id,
        billingAddressData,
      );
    } else {
      // Create new billing address
      const billingAddress = this.billingAddressRepo.create({
        ...billingAddressData,
        customer_id: customerId,
      });
      await this.billingAddressRepo.save(billingAddress);
    }

    return this.findOne(customerId);
  }

  async updateShippingAddress(customerId: number, shippingAddressData: any) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
      relations: ['shipping_address'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.shipping_address) {
      // Update existing shipping address
      await this.shippingAddressRepo.update(
        customer.shipping_address.id,
        shippingAddressData,
      );
    } else {
      // Create new shipping address
      const shippingAddress = this.shippingAddressRepo.create({
        ...shippingAddressData,
        customer_id: customerId,
      });
      await this.shippingAddressRepo.save(shippingAddress);
    }

    return this.findOne(customerId);
  }
}
