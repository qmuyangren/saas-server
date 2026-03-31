import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email' })
  @Index()
  email: string;

  @Column({ name: 'code' })
  code: string;

  @Column({ name: 'type', default: 'register' })
  type: string; // 'register' | 'reset_password'

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'used', default: false })
  used: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.used && !this.isExpired();
  }
}
