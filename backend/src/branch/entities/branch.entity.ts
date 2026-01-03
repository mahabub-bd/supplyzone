import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('branches')
export class Branch {
  @ApiProperty({ description: 'Unique identifier for the branch', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Unique branch code', example: 'BR-001' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: 'Branch name', example: 'Main Branch' })
  @Column()
  name: string;

  @ApiPropertyOptional({
    description: 'Branch address',
    example: '123 Street, Dhaka',
  })
  @Column({ nullable: true })
  address?: string;

  @ApiPropertyOptional({
    description: 'Branch contact number',
    example: '+8801712345678',
  })
  @Column({ nullable: true })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Branch email address',
    example: 'branch@example.com',
  })
  @Column({ nullable: true })
  email?: string;

  @ApiProperty({ description: 'Whether the branch is active', example: true })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Default warehouse linked to this branch',
    example: 3,
  })
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.branches, { nullable: true })
  @JoinColumn({ name: 'default_warehouse_id' })
  default_warehouse?: Warehouse;

  @ManyToMany(() => User, (user) => user.branches)
  users: User[];

  @ApiProperty({
    description: 'Record creation time',
    example: '2025-01-01T12:00:00Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Record last update time',
    example: '2025-01-01T14:30:00Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
