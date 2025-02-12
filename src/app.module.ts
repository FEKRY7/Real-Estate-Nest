import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ConfigModule } from '@nestjs/config';
import { User } from './Users/users.entity';
import { Token } from './Token/token.entity';
import { UsersModule } from './Users/users.module';
import { TokenModule } from './Token/token.module';
import { Category } from './Category/category.entity';
import { CategorysModule } from './Category/category.module';
import { CloudinaryModule } from './Cloudinary/cloudinary.module';
import { Listing } from './Listing/listing.entity';
import { ListingsModule } from './Listing/listing.module';
import { MailModule } from './mail/mail.module';
  
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Ensure it's available globally
      envFilePath: '.env.development', // Specify the correct path to your environment file
    }),
    TokenModule, 
    UsersModule,
    CategorysModule,
    ListingsModule,
    CloudinaryModule,
    MailModule,
    TypeOrmModule.forRoot({
      type: 'postgres', 
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
      host: 'localhost',
      database: process.env.DB_DATABASS,
      synchronize: true,
      entities: [
      Token,
      User,
      Category,
      Listing
      ], 
    }),
  ], 
})
export class AppModule {}
