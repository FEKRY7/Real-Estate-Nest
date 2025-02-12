import { BadRequestException, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/Users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/Cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Listing } from './listing.entity';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { User } from 'src/Users/users.entity';


@Module({
  controllers: [ListingController],
  providers: [ListingService],
  exports: [ListingService],
  imports: [
    TypeOrmModule.forFeature([Listing,User]),
    CloudinaryModule,
    forwardRef(() => UsersModule),
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
export class ListingsModule {}