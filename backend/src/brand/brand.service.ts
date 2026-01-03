import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto, userId: number) {
    const brand = this.brandRepository.create({
      name: dto.name,
      description: dto.description,
      logo_attachment_id: dto.logo_attachment_id || null,
      created_by: userId ? { id: userId } : null,
    });

    return this.brandRepository.save(brand);
  }

  async findAll() {
    return this.brandRepository.find({
      relations: ['logo_attachment'],
      order: { created_at: 'DESC' },
      select: {
        id: true,
        name: true,
        description: true,
        logo_attachment: { id: true, url: true },
        created_at: true,
      },
    });
  }

  async findOne(id: string) {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['logo_attachment'],
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id); // Ensure exists

    await this.brandRepository.update(id, {
      name: dto.name,
      description: dto.description,
      logo_attachment_id: dto.logo_attachment_id || null,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);
    return { message: 'Brand deleted successfully' };
  }
}