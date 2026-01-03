import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly repo: Repository<Tag>,
  ) {}

  async create(dto: CreateTagDto) {
    const tag = this.repo.create(dto);
    return this.repo.save(tag);
  }

  async findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: number) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    return this.repo.save(tag);
  }

  async remove(id: number) {
    const tag = await this.findOne(id);
    return this.repo.remove(tag);
  }
}
