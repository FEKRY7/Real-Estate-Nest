import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
      envFilePath: '.env.development', // Load variables from a .env file
    }),
  ],
  providers: [CloudinaryService],
  exports: [CloudinaryService], // Export for use in other modules
})
export class CloudinaryModule {}
