import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import slugify from 'slugify';
import { CategoryType, PurposeType } from 'src/untils/enums';
import { User } from 'src/Users/users.entity';

@Entity({ name: 'listings' })
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value,
    },
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true, // Ensure the slug is unique
  })
  slug: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }
  }

  @Column({ type: 'enum', enum: CategoryType })
  category: CategoryType;

  @Column({
    type: 'varchar',
    length: 250,
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value,
    },
  })
  description: string;
  

  @Column({ type: 'varchar', length: 250 })
  address: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int' })
  discount: number;

  @Column({ type: 'int' })
  bathrooms: number;

  @Column({ type: 'int' })
  bedrooms: number;

  @Column({ default: false })
  furnished: boolean;

  @Column({ default: false })
  parking: boolean;

  @Column({ type: 'enum', enum: PurposeType })
  purpose: PurposeType;

  @Column({
    type: 'json',
    nullable: false,
    default: [], 
  })
  images: { secure_url: string; public_id: string }[];

  @ManyToOne(() => User, (user) => user.favorites, { 
    onDelete: 'CASCADE',
  })
  createdBy: User;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}