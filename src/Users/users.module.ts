import {
  ClassSerializerInterceptor,
  Module,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthProvider } from './auth.provider';
import { Token } from 'src/Token/token.entity';
import { ListingsModule } from 'src/Listing/listing.module';
import { MailModule } from 'src/mail/mail.module';
import { CloudinaryModule } from 'src/Cloudinary/cloudinary.module';
import { OtpService } from './otpGenerator.provider';
import { Listing } from 'src/Listing/listing.entity';

@Module({
  controllers: [UsersController],
  exports: [UsersService], // Export UsersService for use in other modules
  imports: [
    TypeOrmModule.forFeature([User,Token,Listing]),
    JwtModule.registerAsync({ 
      imports: [ConfigModule],
      useFactory: () => ({
        global: true,
        secret: process.env.JWT_SECRET, // Ensure the JWT secret is set in .env
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      }),
    }),
    ListingsModule,
    MailModule,
    CloudinaryModule,
  ],
  providers: [
    UsersService,
    AuthProvider,
    OtpService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor, // Applies serialization globally
    },
  ],
})
export class UsersModule {}
