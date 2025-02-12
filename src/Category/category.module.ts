import { BadRequestException, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/Users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryModule } from 'src/Cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';


@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
  imports: [
    TypeOrmModule.forFeature([Category]),
    CloudinaryModule,
    UsersModule,
    JwtModule,
    MulterModule.register({
        storage: memoryStorage(), // Store files in memory
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.startsWith('image')) {
            return cb(
              new BadRequestException('Only image files are allowed'),
              false,
            );
          }
          cb(null, true);
        },
      }),
  ],
})
export class CategorysModule {}