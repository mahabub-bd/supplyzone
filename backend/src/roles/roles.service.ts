import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private repo: Repository<Role>) {}

  
  /**
   * CREATE ROLE (Validated)
   */
  async create(payload: CreateRoleDto) {
    const existing = await this.repo.findOne({
      where: { name: payload.name },
    });


    if (existing) {
      throw new BadRequestException(`Role '${payload.name}' already exists.`);
    }

    const role = this.repo.create({
      name: payload.name,
      description: payload.description,
    });

    return this.repo.save(role);
  }

  async findAll() {
    return this.repo.find({ relations: ['permissions'] });
  }
  async save(role: Role) {
    return this.repo.save(role);
  }
  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByName(name: string) {
    return this.repo.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async update(id: string, payload: Partial<Role>) {
    const role = await this.findById(id);
    if (!role) throw new NotFoundException(`Role not found`);

    // Prevent updating to a duplicate name
    if (payload.name && payload.name !== role.name) {
      const exists = await this.repo.findOne({
        where: { name: payload.name },
      });
      if (exists) {
        throw new BadRequestException(`Role '${payload.name}' already exists.`);
      }
    }

    Object.assign(role, payload);
    return this.repo.save(role);
  }

  async delete(id: string) {
    const role = await this.repo.findOne({ where: { id } });

    if (!role) throw new NotFoundException('Role not found');

    return this.repo.remove(role);
  }

  async ensureRoles(roleNames: string[]) {
    const existing = await this.repo.find({ where: { name: In(roleNames) } });
    const existingNames = new Set(existing.map((r) => r.name));

    const toCreate = roleNames.filter((n) => !existingNames.has(n));

    if (!toCreate.length) return;

    const entities = toCreate.map((name) => this.repo.create({ name }));
    await this.repo.save(entities);
  }
}
