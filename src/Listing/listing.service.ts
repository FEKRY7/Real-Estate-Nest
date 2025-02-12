import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { CloudinaryService } from 'src/Cloudinary/cloudinary.service';
import { Listing } from './listing.entity';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async GetAllListings(pageNumber: number, reviewPerPage: number = 2) {
    const Listings = await this.listingRepository.find({
      skip: reviewPerPage * (pageNumber - 1),
      take: reviewPerPage,
      order: { createdAt: 'DESC' },
    });

    return Listings;
  }

  public async GetListingById(id: number) {
    const listing = await this.listingRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException(`Listing with id ${id} not found`);
    } else {
      return listing;
    }
  }

  public async CreateNewListing(
    createListingDto: CreateListingDto,
    payload: JWTPayloadType,
    images: Express.Multer.File[],
  ) {
    let formattedImages = [];

    if (images && images.length > 0) {
      const ImagesUploadResults =
        await this.cloudinaryService.uploadListingImages(images);

      formattedImages = ImagesUploadResults.map((result) => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
      }));
    }

    const listing = this.listingRepository.create({
      ...createListingDto,
      createdBy: { id: payload.id }, // Ensure the user ID is correctly set
      images: formattedImages, // Always an array (even if empty)
    });

    await this.listingRepository.save(listing);
    return { message: 'Done', listing };
  }

  public async UpdateListing(
    id: number,
    updateListingDto: UpdateListingDto,
    images: Express.Multer.File[],
  ) {
    // Retrieve the listing
    const listing = await this.listingRepository.findOne({ where: { id } });

    if (!listing) {
      throw new BadRequestException('Listing not found');
    }

    // Upload new images if provided
    let formattedImages = listing.images; // Keep existing images by default

    if (images && images.length > 0) {
      // Upload new images
      const ImagesUploadResults =
        await this.cloudinaryService.uploadListingImages(images);

      formattedImages = ImagesUploadResults.map((result) => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
      }));

      // Delete old images from Cloudinary
      if (listing.images && listing.images.length > 0) {
        await Promise.all(
          listing.images.map(async (image) => {
            await this.cloudinaryService.destroyImage(image.public_id);
          }),
        );
      }
    }

    // Update listing properties (Only update provided fields)
    Object.assign(listing, {
      title: updateListingDto.title ?? listing.title,
      description: updateListingDto.description ?? listing.description,
      address: updateListingDto.address ?? listing.address,
      category: updateListingDto.category ?? listing.category,
      price: updateListingDto.price ?? listing.price,
      discount: updateListingDto.discount ?? listing.discount,
      bathrooms: updateListingDto.bathrooms ?? listing.bathrooms,
      bedrooms: updateListingDto.bedrooms ?? listing.bedrooms,
      furnished: updateListingDto.furnished ?? listing.furnished,
      parking: updateListingDto.parking ?? listing.parking,
      purpose: updateListingDto.purpose ?? listing.purpose,
      images: formattedImages, // Updated images
      updatedAt: new Date(),
    });

    // Save the updated listing
    const updatedListing = await this.listingRepository.save(listing);

    return { message: 'Listing updated successfully', updatedListing };
  }

  public async DeleteListing(id: number) {
    // Retrieve the car to be deleted
    const listing = await this.GetListingById(id);

    // Delete all images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      await Promise.all(
        listing.images.map(async (image) => {
          await this.cloudinaryService.destroyImage(image.public_id);
        }),
      );
    }

    // Remove the listing from the database
    await this.listingRepository.delete(id);

    return { message: 'Listing deleted successfully' };
  }
}
