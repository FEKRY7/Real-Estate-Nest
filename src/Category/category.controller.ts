import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserType } from 'src/untils/enums';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { Roles } from 'src/Users/decorators/user-role.decorator';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';

@Controller('/api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

    // GET: /api/category/:id
    @Get('/:id')
    @Roles(UserType.USER)
    @UseGuards(AuthRolesGuard)
    public GetCategoryById(@Param('id', ParseIntPipe) id: number) {
      return this.categoryService.GetCategoryById(id);
    }
  
    // GET: /api/category
    @Get()
    public GetAllCategories(
      @Query('pageNumber', ParseIntPipe) pageNumber: number,
      @Query('reviewPerPage', ParseIntPipe) reviewPerPage: number
    ) {
      return this.categoryService.GetAllCategories(pageNumber, reviewPerPage);
    }
  
    // POST: /api/category
    @Post()
    @Roles(UserType.USER)
    @UseGuards(AuthRolesGuard)
    @UseInterceptors(FileInterceptor('categories-image'))
    async CreateCategory(
      @Body() createCategoryDto: CreateCategoryDto,
      @UploadedFile() image: Express.Multer.File,
    ) {
      return this.categoryService.AddNewCategory(createCategoryDto, image);
    }
  
    // PUT: /api/category/:id
    @Put(':id')
    @Roles(UserType.USER)
    @UseGuards(AuthRolesGuard)
    @UseInterceptors(FileInterceptor('categories-image')) 
    public async UpdateCategory(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCategoryDto: UpdateCategoryDto, 
      @UploadedFile() image: Express.Multer.File, 
    ) {
      return this.categoryService.updateCategory(id, updateCategoryDto, image);
    }
  
    // DELETE: /api/category/:id
    @Delete(':id')
    @Roles(UserType.USER)
    @UseGuards(AuthRolesGuard)
    public DeleteCategory(
      @Param('id', ParseIntPipe) id: number,
      @CurrentUser() payload: JWTPayloadType
    ) {
      return this.categoryService.deleteCategory(id,payload);
    }
}


