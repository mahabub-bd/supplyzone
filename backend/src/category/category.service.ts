import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/subcategory.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    @InjectRepository(SubCategory)
    private subCategoryRepo: Repository<SubCategory>,
  ) { }

  async create(dto: CreateCategoryDto, user: User) {
    const existingCategory = await this.categoryRepo.findOne({
      where: { name: dto.name.trim() },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with name '${dto.name}' already exists`,
      );
    }
    const category = this.categoryRepo.create({
      ...dto,
      created_by: user,
    });
    return await this.categoryRepo.save(category);
  }

  // Create subcategory
  async createSubCategory(dto: CreateSubCategoryDto, user: User) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.category_id },
    });
    if (!category) throw new NotFoundException('Main category not found');

    const subCategory = this.subCategoryRepo.create({
      ...dto,
      created_by: user, // Assign user
    });
    return await this.subCategoryRepo.save(subCategory);
  }

  // Get all
  async findAll() {
    return this.categoryRepo.find({
      relations: ['logo_attachment'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
  async getSubcategoriesByCategory(categoryId: string) {
    // Validate category first
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    // Fetch subcategories
    return this.subCategoryRepo.find({
      where: { category_id: categoryId },
      relations: ['logo_attachment'],
      order: { name: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: string) {
    await this.subCategoryRepo.delete({ category_id: id });
    const category = await this.findOne(id);
    return this.categoryRepo.remove(category);
  }
  // Update subcategory
  async updateSubCategory(id: string, dto: UpdateSubCategoryDto) {
    const subCategory = await this.subCategoryRepo.findOne({ where: { id } });

    if (!subCategory) throw new NotFoundException('Subcategory not found');

    if (dto.category_id) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.category_id },
      });
      if (!category) throw new NotFoundException('Main category not found');
    }

    Object.assign(subCategory, dto);
    return await this.subCategoryRepo.save(subCategory);
  }

  // Delete subcategory
  async removeSubCategory(id: string) {
    const subCategory = await this.subCategoryRepo.findOne({ where: { id } });
    if (!subCategory) throw new NotFoundException('Subcategory not found');
    return await this.subCategoryRepo.remove(subCategory);
  }

  // Category tree
  async getTree() {
    const categories = await this.categoryRepo.find({
      order: { name: 'ASC' },
      relations: ['logo_attachment'],
    });

    const subcategories = await this.subCategoryRepo.find({
      order: { name: 'ASC' },
      relations: ['logo_attachment'], // ← add this
    });

    return categories.map((cat) => ({
      ...cat,
      children: subcategories.filter((sub) => sub.category_id === cat.id),
    }));
  }

}
