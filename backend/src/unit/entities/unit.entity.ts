import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('units')
export class Unit {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Kilogram' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'KG' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ example: 'Weight measurement unit', required: false })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-01-11T12:34:56.789Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2025-01-12T12:34:56.789Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
