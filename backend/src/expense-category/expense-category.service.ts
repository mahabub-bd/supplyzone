import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { Repository } from 'typeorm';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private categoryRepo: Repository<ExpenseCategory>,
  ) {}

  
  async create(dto: CreateExpenseCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException(
        `Expense category already exists: ${dto.name}`,
      );
    }

    const data = this.categoryRepo.create(dto);
    return this.categoryRepo.save(data);
  }

  async findAll(paginationDto: PaginationDto & {
    search?: string;
    isActive?: boolean;
  }): Promise<PaginationResponse<ExpenseCategory>> {
    const { page = 1, limit = 50, search, isActive } = paginationDto;

    // Build query
    const queryBuilder = this.categoryRepo.createQueryBuilder('category');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply active status filter
    if (isActive !== undefined) {
      if (search) {
        queryBuilder.andWhere('category.is_active = :isActive', { isActive });
      } else {
        queryBuilder.where('category.is_active = :isActive', { isActive });
      }
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated data
    const categories = await queryBuilder
      .orderBy('category.id', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const data = await this.categoryRepo.findOne({ where: { id } });
    if (!data) throw new NotFoundException('Expense category not found');
    return data;
  }

  async update(id: number, dto: UpdateExpenseCategoryDto) {
    const data = await this.findOne(id);

    // Prevent duplicate names
    if (dto.name && dto.name !== data.name) {
      const exists = await this.categoryRepo.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new BadRequestException(
          `Another category already exists with this name`,
        );
      }
    }

    Object.assign(data, dto);
    return this.categoryRepo.save(data);
  }

  async remove(id: number) {
    const data = await this.findOne(id);
    await this.categoryRepo.remove(data);

    return { message: 'Expense category deleted successfully' };
  }
}
