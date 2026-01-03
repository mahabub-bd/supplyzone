import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('expense_categories')
export class ExpenseCategory {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the expense category',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Office Supplies',
    description: 'Name of the expense category',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: 'Expenses related to office stationery',
    description: 'Optional description of the expense category',
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the category is active',
    default: true,
  })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({
    example: '2025-11-27T05:20:00.000Z',
    description: 'When the category was created',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: '2025-11-27T05:20:00.000Z',
    description: 'When the category was last updated',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
