import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('login_logs')
export class LoginLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @Column()
  email: string;

  @Column()
  success: boolean;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
