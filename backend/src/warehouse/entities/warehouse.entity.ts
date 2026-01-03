import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Branch } from "src/branch/entities/branch.entity";

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  location?: string;
  @Column({ nullable: true })
  address?: string;
  @Column({ default: true })
  status: boolean;

  @OneToMany(() => Branch, (branch) => branch.default_warehouse)
  branches: Branch[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
