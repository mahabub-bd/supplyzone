import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';

import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,
  ) {}

  
  /** CREATE PERMISSION */
  async createPermission(dto: CreatePermissionDto) {
    if (!dto.key) {
      throw new BadRequestException('Permission key is required');
    }

    const exists = await this.permRepo.findOne({ where: { key: dto.key } });
    if (exists) {
      throw new BadRequestException(
        `Permission key '${dto.key}' already exists`,
      );
    }

    const permission = this.permRepo.create(dto);
    return this.permRepo.save(permission);
  }

  findAll() {
    return this.permRepo.find({
      order: { key: 'ASC' },
    });
  }

  findByKey(key: string) {
    return this.permRepo.findOne({ where: { key } });
  }

  async findById(id: string) {
    const permission = await this.permRepo.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  /** UPDATE PERMISSION */
  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const permission = await this.findById(id);

    // Validate key uniqueness (if updated)
    if (dto.key && dto.key !== permission.key) {
      const exists = await this.permRepo.findOne({ where: { key: dto.key } });
      if (exists) {
        throw new BadRequestException(
          `Permission key '${dto.key}' already exists`,
        );
      }
    }

    Object.assign(permission, dto);
    return this.permRepo.save(permission);
  }

  /** DELETE PERMISSION */
  async deletePermission(id: string) {
    const permission = await this.findById(id);
    await this.permRepo.remove(permission);

    return {
      id,
      message: 'Permission deleted successfully',
    };
  }
}
