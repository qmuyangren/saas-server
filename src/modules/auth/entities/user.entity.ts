import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ name: 'login_failures', default: 0 })
  loginFailures: number;

  @Column({ name: 'locked_until', type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  getLockRemainingSeconds(): number {
    if (!this.lockedUntil) return 0;
    const remaining = this.lockedUntil.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}
