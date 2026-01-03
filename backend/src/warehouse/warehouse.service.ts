import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Warehouse } from "./entities/warehouse.entity";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private repo: Repository<Warehouse>,
  ) {}

  create(dto: CreateWarehouseDto) {
    const wh = this.repo.create(dto);
    return this.repo.save(wh);
  }

  findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: number) {
    const wh = await this.repo.findOne({ where: { id } });
    if (!wh) throw new NotFoundException('Warehouse not found');
    return wh;
  }

  async update(id: number, dto: UpdateWarehouseDto) {
    const wh = await this.findOne(id);
    Object.assign(wh, dto);
    return this.repo.save(wh);
  }

  async remove(id: number) {
    const wh = await this.findOne(id);
    return this.repo.remove(wh);
  }
}
