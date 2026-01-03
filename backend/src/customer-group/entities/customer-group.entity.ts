import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Customer } from 'src/customer/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customer_groups')
export class CustomerGroup {
  @ApiProperty({
    description: 'Unique ID of the customer group',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the customer group',
    example: 'VIP Customers',
  })
  @Column({ unique: true })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the customer group',
    example: 'High-value customers with special discounts',
  })
  @Column({ nullable: true })
  description?: string;

  @ApiPropertyOptional({
    description: 'Discount percentage for this group',
    example: 10,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percentage: number;

  @ApiProperty({
    description: 'Status of the customer group',
    example: true,
  })
  @Column({ default: true })
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Customers belonging to this group',
    type: () => [Customer],
  })
  @OneToMany(() => Customer, (customer) => customer.group)
  customers?: Customer[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-29T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-29T15:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}