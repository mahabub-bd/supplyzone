import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { In, Repository } from 'typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserStatus } from 'src/common/enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Branch) private readonly branchRepo: Repository<Branch>,
  ) {}

  
  private toSafe(user: Partial<User>): Partial<User> {
    if (!user) return null;
    const { password_hash, ...rest } = user as any;
    return rest;
  }

  async create(dto: CreateUserDto) {
    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    let roleEntities: Role[] = [];
    if (dto.roles?.length) {
      roleEntities = await this.roleRepo.find({
        where: { name: In(dto.roles) },
      });

      if (roleEntities.length !== dto.roles.length) {
        const found = roleEntities.map((r) => r.name);
        const missing = dto.roles.filter((r) => !found.includes(r));
        throw new BadRequestException(`Roles not found: ${missing.join(', ')}`);
      }
    } else {
      const defaultRole = await this.roleRepo.findOne({
        where: { name: 'user' },
      });
      if (defaultRole) roleEntities = [defaultRole];
    }

    let branchEntities: Branch[] = [];
    if (dto.branch_ids?.length) {
      branchEntities = await this.branchRepo.find({
        where: { id: In(dto.branch_ids) },
      });

      if (branchEntities.length !== dto.branch_ids.length) {
        const found = branchEntities.map((b) => b.id);
        const missing = dto.branch_ids.filter((id) => !found.includes(id));
        throw new BadRequestException(`Branches not found: ${missing.join(', ')}`);
      }
    }

    const user = this.repo.create({
      username: dto.username,
      email: dto.email,
      full_name: dto.full_name,
      phone: dto.phone,
      password_hash,
      roles: roleEntities,
      branches: branchEntities,
      status: UserStatus.PENDING,
    });

    const saved = await this.repo.save(user);
    return this.toSafe(await this.findById(saved.id));
  }

  async findAll() {
    const users = await this.repo.find({
      relations: ['roles', 'branches'],
    });
    return users.map((u) => this.toSafe(u));
  }

  async findById(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['roles', 'branches'],
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return this.toSafe(user);
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return await this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.email = :identifier', { identifier })
      .orWhere('user.username = :identifier', { identifier })
      .addSelect('user.password_hash')
      .getOne();
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['roles', 'branches'],
    });

    if (!user) throw new NotFoundException('User not found');

    if (dto.roles) {
      const roleEntities = await this.roleRepo.find({
        where: { name: In(dto.roles) },
      });

      if (roleEntities.length !== dto.roles.length) {
        const found = roleEntities.map((r) => r.name);
        const missing = dto.roles.filter((r) => !found.includes(r));
        throw new BadRequestException(`Roles not found: ${missing.join(', ')}`);
      }

      user.roles = roleEntities;
    }

    if (dto.branch_ids) {
      const branchEntities = await this.branchRepo.find({
        where: { id: In(dto.branch_ids) },
      });

      if (branchEntities.length !== dto.branch_ids.length) {
        const found = branchEntities.map((b) => b.id);
        const missing = dto.branch_ids.filter((id) => !found.includes(id));
        throw new BadRequestException(`Branches not found: ${missing.join(', ')}`);
      }

      user.branches = branchEntities;
    }

    delete (dto as any).roles;
    delete (dto as any).branch_ids;

    // Handle password
    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, 10);
      delete (dto as any).password;
    }

    Object.assign(user, dto);

    const saved = await this.repo.save(user);
    return this.toSafe(await this.findById(saved.id));
  }

  async delete(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['roles', 'branches'],
    });

    if (!user) throw new NotFoundException('User not found');

    await this.repo.remove(user);
    return this.toSafe(user);
  }
}
