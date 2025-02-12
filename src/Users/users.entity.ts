import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { StatusType, UserType } from 'src/untils/enums';
import { Listing } from 'src/Listing/listing.entity';
import { Token } from 'src/Token/token.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  username: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  email: string;

  @Column()
  @Exclude() 
  password: string;

  @Column({ type: 'varchar', length: 150 })
  phone: string;

  @Column({
    type: 'json',
    nullable: false,
    default: { secure_url: '', public_id: '' },
  })
  profileImage: { secure_url: string; public_id: string };

  @Column({ default: false })
  confirmEmail: boolean;

  @Column({ type: 'enum', enum: StatusType, default: StatusType.OFFLINE })
  status: StatusType;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  role: UserType;

  @Column({ type: 'json', nullable: true }) 
  OTP?: { OTPCode: string; expireDate: Date };

  @Column({ type: 'int', default: 0 }) 
  OTPNumber: number;

  @OneToMany(() => Listing, (listing) => listing.createdBy, { eager: true })
  favorites: Listing[];

  @OneToOne(() => Token, (token) => token.user, { onDelete: 'CASCADE' })
  token: Token;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
