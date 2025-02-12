import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { ChangePasswordDto } from './dtos/ChangePassword.dto';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/untils/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfirmDto } from './dtos/confirm.dto';
import { UpdateProfileDto } from './dtos/updateProfile.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST: /api/users/auth/signup
  @Post('auth/signup')
  @UseInterceptors(FileInterceptor('profileImage')) // Handling profile image upload
  async signUp(
    @Body() registerDto: RegisterDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    return this.usersService.SignUp(registerDto, profileImage);
  }

  // PUT: /api/users/confirmEmail
  @Put('/confirmEmail')
  public async confirmEmail(@Body() confirmDto: ConfirmDto) {
    return await this.usersService.ConfirmUser(confirmDto);
  }

  // POST: /api/users/auth/login
  @Post('auth/login')
  public async login(@Body() Body: LoginDto) {
    return await this.usersService.login(Body);
  }

  // GET: /api/users/current-user
  @Get('current-user')
  @UseGuards(AuthGuard)
  public async getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.getCurrentUser(payload.id);
  }

  // POST: /api/users/logout
  @Post('/logout')
  @Roles(UserType.USER, UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public async LogOut(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.logOut(payload);
  }

  // GET: /api/users/refresh/:id
  @Get('/refresh/:id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public async RefreshToken(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.refreshToken(id);
  }

  // PUT: /api/users/change-password
  @Put('/change-password')
  @UseGuards(AuthGuard)
  public async ChangePassword(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: ChangePasswordDto,
  ) {
    return await this.usersService.changePassword(body, payload);
  }

  // PUT: /api/users/update-profile
  @Put('/update-profile')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('profileImage')) // Handling profile image upload
  public async updateUserProfile(
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    return await this.usersService.updateUserProfile(
      updateProfileDto,
      profileImage,
      payload,
    );
  }

  // GET: /api/users/listings
  @Get('/listings')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public async GetUserListings(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.getUserListings(payload);
  }

  // DELETE: /api/users/deleteProfile/:id
  @Delete('/deleteProfile/:id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public DeleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.deleteUserProfile(id, payload);
  }

  // GET: /api/users/favorites
  @Get('/favorites')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public async GetUserFavorites(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.getUserFavorites(payload);
  }
}
