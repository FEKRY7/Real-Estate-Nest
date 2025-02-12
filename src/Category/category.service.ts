import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { Category } from './category.entity';
import { CloudinaryService } from 'src/Cloudinary/cloudinary.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async GetAllCategories(pageNumber: number, reviewPerPage: number = 2) {
    const categories = await this.categoryRepository.find({
      skip: reviewPerPage * (pageNumber - 1),
      take: reviewPerPage,
      order: { createdAt: 'DESC' },
    });

    return categories;
  }

  public async GetCategoryById(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    } else {
      return category;
    }
  }

  public async AddNewCategory(
    createCategoryDto: CreateCategoryDto,
    image: Express.Multer.File,
  ): Promise<Category> {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }
    const { name } = createCategoryDto;

    // Check if a category with the same name already exists
    const existingCategory = await this.categoryRepository.findOneBy({ name });
    if (existingCategory) {
      throw new BadRequestException(`This Category Name: ${name} Already Exists`);
    }

    // Upload image to Cloudinary
    const uploadResult =
      await this.cloudinaryService.uploadCategoryImage(image);

    // Create a new category
    const newCategory = this.categoryRepository.create({
      name,
      image: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });

    // Save category to the database
    return this.categoryRepository.save(newCategory);
  }

  public async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    image?: Express.Multer.File,
  ) {
    const { name } = updateCategoryDto;

    // Retrieve the category to be updated
    const existingCategory = await this.categoryRepository.findOneBy({ id });
    if (!existingCategory) {
      throw new BadRequestException('Category not found');
    }

    // Check if a category with the same name already exists
    if (name) {
      const duplicateCategory = await this.categoryRepository.findOneBy({
        name,
      });
      if (duplicateCategory && duplicateCategory.id !== id) {
        throw new BadRequestException(
          `This Category Name: ${name} Already Exists`,
        );
      }
    }

    // Upload the new image to Cloudinary (if provided)
    let updatedImage = existingCategory.image;
    if (image) {
      const uploadResult =
        await this.cloudinaryService.uploadCategoryImage(image);

      // Delete the existing image from Cloudinary if present
      if (existingCategory.image?.public_id) {
        await this.cloudinaryService.destroyImage(
          existingCategory.image.public_id,
        );
      }

      updatedImage = {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Update the category fields
    existingCategory.name = name || existingCategory.name;
    existingCategory.image = updatedImage;
    existingCategory.updatedAt = new Date();

    // Save the updated category
    const updatedCategory =
      await this.categoryRepository.save(existingCategory);

    return { message: 'Category updated successfully', updatedCategory };
  }

  public async deleteCategory(id: number, payload: JWTPayloadType) {
    // Ensure the user is authorized
    if (!payload.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this category',
      );
    }

    // Retrieve the category
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Delete the category image from Cloudinary if it exists
    if (category.image?.public_id) {
      await this.cloudinaryService.destroyImage(category.image.public_id);
    }

    // Remove the category from the database
    await this.categoryRepository.remove(category);

    return { message: 'Category deleted successfully' };
  }
}
