import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateBranchDto) {
    const exists = await this.branchRepo.findOne({ where: { code: dto.code } });

    if (exists) {
      throw new BadRequestException(`Branch code already exists: ${dto.code}`);
    }

    const branch = this.branchRepo.create(dto);
    return this.branchRepo.save(branch);
  }

  async findAll() {
    return this.branchRepo.find({
      relations: ['default_warehouse'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const branch = await this.branchRepo.findOne({
      where: { id },
      relations: ['default_warehouse'],
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: number, dto: UpdateBranchDto) {
    const branch = await this.branchRepo.findOne({
      where: { id },
      relations: ['default_warehouse'],
    });

    if (!branch) throw new NotFoundException('Branch not found');

    // prevent duplicate branch code
    if (dto.code && dto.code !== branch.code) {
      const exists = await this.branchRepo.findOne({
        where: { code: dto.code },
      });
      if (exists) {
        throw new BadRequestException(
          `Branch code already exists: ${dto.code}`,
        );
      }
    }

    // Handle default_warehouse_id separately
    const { default_warehouse_id, ...updateData } = dto as any;

    // Update regular fields
    Object.assign(branch, updateData);

    // Handle warehouse relation if provided
    if (default_warehouse_id !== undefined) {
      if (default_warehouse_id === null) {
        branch.default_warehouse = null;
      } else {
        branch.default_warehouse = { id: default_warehouse_id } as any;
      }
    }

    const saved = await this.branchRepo.save(branch);

    // Fetch and return with relations
    return this.branchRepo.findOne({
      where: { id: saved.id },
      relations: ['default_warehouse'],
    });
  }

  async remove(id: number) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    await this.branchRepo.remove(branch);
    return { message: 'Branch deleted successfully' };
  }
}
