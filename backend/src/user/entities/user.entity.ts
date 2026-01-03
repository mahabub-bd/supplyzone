import { ApiProperty } from '@nestjs/swagger';
import { Attachment } from 'src/attachment/entities/attachment.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { UserStatus } from 'src/common/enum';
import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @ApiProperty()
  full_name: string;

  // Virtual property for name consistency
  @ApiProperty({ readOnly: true })
  get name(): string {
    return this.full_name;
  }

  @Column({ nullable: true })
  phone: string;

  @Column({ select: false })
  password_hash: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];

  @ManyToMany(() => Branch, (branch) => branch.users, { eager: false })
  @JoinTable({
    name: 'user_branches',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'branch_id' },
  })
  branches: Branch[];

  @OneToMany(() => Attachment, (attachment) => attachment.uploaded_user)
  attachments: Attachment[];

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
