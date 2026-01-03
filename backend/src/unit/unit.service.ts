import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  create(createUnitDto: CreateUnitDto) {
    const unit = this.unitRepository.create(createUnitDto);
    return this.unitRepository.save(unit);
  }

  findAll() {
    return this.unitRepository.find();
  }

  async findOne(id: number) {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    await this.findOne(id);
    await this.unitRepository.update(id, updateUnitDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.unitRepository.delete(id);
    return { message: 'Unit deleted successfully' };
  }
}
