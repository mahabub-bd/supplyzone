import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerGroupDto } from './dto/create-customer-group.dto';
import { UpdateCustomerGroupDto } from './dto/update-customer-group.dto';
import { CustomerGroup } from './entities/customer-group.entity';

@Injectable()
export class CustomerGroupService {
  constructor(
    @InjectRepository(CustomerGroup)
    private customerGroupRepo: Repository<CustomerGroup>,
  ) {}

  async create(dto: CreateCustomerGroupDto) {
    // Check if group name already exists
    const existing = await this.customerGroupRepo.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Customer group with this name already exists');
    }

    const group = this.customerGroupRepo.create(dto);
    return await this.customerGroupRepo.save(group);
  }

  async findAll() {
    return await this.customerGroupRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const group = await this.customerGroupRepo.findOne({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Customer group not found');
    }

    return group;
  }

  async update(id: number, dto: UpdateCustomerGroupDto) {
    const group = await this.findOne(id);

    // Check if new name conflicts with existing group
    if (dto.name && dto.name !== group.name) {
      const existing = await this.customerGroupRepo.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new BadRequestException('Customer group with this name already exists');
      }
    }

    Object.assign(group, dto);
    return await this.customerGroupRepo.save(group);
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    await this.customerGroupRepo.remove(group);

    return {
      message: 'Customer group deleted successfully',
    };
  }
}