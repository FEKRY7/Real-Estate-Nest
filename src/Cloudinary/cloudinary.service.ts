import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME, // Fixed the typo here
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  }

  public async uploadProfileImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file or file buffer is missing');
    }
    console.log('File:', file);

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'ProfileImage' },
        (error, result) => {
          if (error) {
            console.error('Image upload failed:', error); // Log the error
            return reject(
              new InternalServerErrorException(
                'Image upload failed: ' + error.message,
              ),
            );
          }
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

  public async destroyImage(publicId: string): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required to delete an image');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error('Image deletion failed:', error); // Log the error
          return reject(
            new InternalServerErrorException(
              'Image deletion failed: ' + error.message,
            ),
          );
        }
        resolve(result);
      });
    });
  }
  public async uploadCategoryImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file or file buffer is missing');
    }
    console.log('File:', file);

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'categories' },
        (error, result) => {
          if (error) {
            return reject(new Error('Image upload failed: ' + error.message));
          }
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

  public async uploadListingImages(
    files: Express.Multer.File[],
  ): Promise<UploadApiResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadPromises = files.map((file) => {
      if (!file.buffer) {
        throw new BadRequestException('File buffer is missing');
      }
      console.log('Uploading listing slider image:', file.originalname);

      return new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: 'Listing' },
          (error, result) => {
            if (error) {
              return reject(
                new Error(
                  'Listing slider image upload failed: ' + error.message,
                ),
              );
            }
            resolve(result);
          },
        );
        Readable.from(file.buffer).pipe(upload);
      });
    });

    return Promise.all(uploadPromises);
  }
}
