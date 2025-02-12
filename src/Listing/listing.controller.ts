import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserType } from 'src/untils/enums';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { Roles } from 'src/Users/decorators/user-role.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ListingService } from './listing.service';
import { JWTPayloadType } from 'src/untils/types';
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('/api/listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  // GET: /api/listing/:id
  @Get('/:id')
  @UseGuards(AuthGuard)
  public GetCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.listingService.GetListingById(id);
  }

  // GET: /api/listing
  @Get()
  @UseGuards(AuthGuard)
  public GetAllCategories(
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('reviewPerPage', ParseIntPipe) reviewPerPage: number,
  ) {
    return this.listingService.GetAllListings(pageNumber, reviewPerPage);
  }

  // POST: /api/listing
  @Post()
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'listing-images', maxCount: 6 }]),
  )
  async CreateCategory(
    @Body() createListingDto: CreateListingDto,
    @UploadedFiles()
    files: {
      'listing-images'?: Express.Multer.File[];
    },
    @CurrentUser() payload: JWTPayloadType,
  ) {
    const images = files['listing-images'] || [];
    return this.listingService.CreateNewListing(
      createListingDto,
      payload,
      images,
    );
  }

  // PUT: /api/listing/:id
  @Put(':id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'listing-images', maxCount: 6 }]),
  )
  public async UpdateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListingDto: UpdateListingDto,
    @UploadedFiles()
    files: {
      'listing-images'?: Express.Multer.File[];
    },
  ) {
    const images = files['listing-images'] || [];
    // Pass the DTO's name and the image to the service
    return this.listingService.UpdateListing(id, updateListingDto, images);
  }

  // DELETE: /api/listing/:id
  @Delete(':id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public DeleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.listingService.DeleteListing(id);
  }
}
