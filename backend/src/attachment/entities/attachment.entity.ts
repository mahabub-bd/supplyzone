import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  file_name: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ nullable: true })
  mime_type: string;

  @Column({ type: 'bigint', nullable: true })
  size: number;

  @Column({ default: 'S3' })
  storage_type: string;

  @Column({ type: 'int', nullable: true })
  uploaded_by: number;

  @ManyToOne(() => User, (user) => user.attachments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploaded_user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
