import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
  ) {}

  async getPermissionsForRoles(roleNames: string[]): Promise<string[]> {
    if (!roleNames?.length) return [];

    const roles = await this.roleRepo.find({
      where: { name: In(roleNames) },
      relations: ['permissions'],
    });

    const permSet = new Set<string>();
    for (const r of roles) {
      for (const p of r.permissions || []) permSet.add(p.key);
    }
    return Array.from(permSet);
  }

  async getPermissionsForRole(roleName: string): Promise<string[]> {
    const role = await this.roleRepo.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });
    return (role?.permissions || []).map((p) => p.key);
  }
}
