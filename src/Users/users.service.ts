import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from 'src/untils/types';
import { AuthProvider } from './auth.provider';
import { ChangePasswordDto } from './dtos/ChangePassword.dto';
import * as bcrypt from 'bcryptjs';
import { Token } from 'src/Token/token.entity';
import { ConfirmDto } from './dtos/confirm.dto';
import * as otpGenerator from 'otp-generator';
import { StatusType, UserType } from 'src/untils/enums';
import { UpdateProfileDto } from './dtos/updateProfile.dto';
import { CloudinaryService } from 'src/Cloudinary/cloudinary.service';
import * as CryptoJS from 'crypto-js';
import { Listing } from 'src/Listing/listing.entity';

@Injectable()
export class UsersService {
  // constructor(private readonly reviewsService:ReviewsService){}
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  /**
   * Creates a new user in the database.
   * @param registerDto The user's registration data.
   * @returns JWT (access token)
   */

  public async SignUp(
    registerDto: RegisterDto,
    profileImage: Express.Multer.File,
  ) {
    return await this.authProvider.SignUp(registerDto, profileImage);
  }

  /**
   * Log In user
   * @param loginDto The user's login data.
   * @returns JWT (access token)
   */

  public async login(loginDto: LoginDto) {
    return await this.authProvider.login(loginDto);
  }

  public async ConfirmUser(confirmDto: ConfirmDto) {
    const { email, otp } = confirmDto;

    // Find the user by email
    const user = await this.usersRepository.findOne({ where: { email } });

    // Check if the user exists
    if (!user) {
      throw new NotFoundException('This Email Does Not Exist');
    }

    // Check if the email is already confirmed
    if (user.confirmEmail) {
      throw new BadRequestException(
        'This Email Is Already Confirmed. Please Go To Login Page',
      );
    }

    // Check if the OTP exists
    if (!user.OTP) {
      throw new BadRequestException('Invalid OTP');
    }

    // Verify if the provided OTP matches the stored OTP
    if (user.OTP.OTPCode !== otp) {
      throw new BadRequestException('OTP does not match');
    }

    // Generate a new OTP (if necessary, for the next step)
    const newOTP = otpGenerator.generate(10);

    // Update user confirmation status and OTP
    user.confirmEmail = true;
    user.OTP = newOTP; // Update OTP with new generated one (optional)

    // Save the updated user record
    const confirmUser = await this.usersRepository.save(user);

    return { message: 'Email successfully confirmed', confirmUser };
  }

  public async logOut(payload: JWTPayloadType) {
    const user = await this.getCurrentUser(payload.id);
    user.status = StatusType.OFFLINE;
    await this.usersRepository.save(user);
    return { message: 'User logged out successfully' };
  }

  /**
   *  Get user by id.
   * @param id id of the user.
   * @returns User.
   */
  public async getCurrentUser(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    } else {
      return user;
    }
  }

  public async refreshToken(id: number) {
    const user = await this.getCurrentUser(id);

    const payload: JWTPayloadType = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };
    const newToken = await this.authProvider.generateJWT(payload);
    this.tokenRepository.create({
      token: newToken,
      user: user.id,
    });

    return { token: newToken };
  }

  public async changePassword(
    changePasswordDto: ChangePasswordDto,
    payload: JWTPayloadType,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.getCurrentUser(payload.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password,
    );
    if (isSameAsOldPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    user.password = await this.authProvider.hashPassword(newPassword);
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  public async updateUserProfile(
    updateProfileDto: UpdateProfileDto,
    profileImage: Express.Multer.File,
    payload: JWTPayloadType,
  ) {
    const { username, phone } = updateProfileDto;

    const user = await this.getCurrentUser(payload.id);
    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    // Check if the username is taken by another user (excluding the current user)
    if (username && username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        throw new NotFoundException(`Username "${username}" is already taken`);
      }
    }

    // Encrypt phone number if provided
    const encryptedPhone = phone
      ? CryptoJS.AES.encrypt(phone, process.env.CRYPTOKEY).toString()
      : user.phone;

    // Preserve the existing profile image if no new image is uploaded
    let profileImageData = user.profileImage;

    if (profileImage) {
      const uploadResult =
        await this.cloudinaryService.uploadProfileImage(profileImage);

      // Delete the existing image from Cloudinary if present
      if (user.profileImage?.public_id) {
        await this.cloudinaryService.destroyImage(user.profileImage.public_id);
      }

      profileImageData = {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Update user profile
    await this.usersRepository.update(user.id, {
      username: username ?? user.username, // Keep the same username if not changed
      phone: encryptedPhone, // Store encrypted phone
      profileImage: profileImageData,
    });

    return {
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: username ?? user.username,
        phone: encryptedPhone, // Return encrypted phone
        profileImage: profileImageData,
      },
    };
  }

  public async getUserListings(payload: JWTPayloadType) {
    const user = await this.getCurrentUser(payload.id);
    const listings = await this.listingRepository.findOne({
      where: { createdBy: user },
    });

    // Check if any listings are found
    if (!listings) {
      throw new NotFoundException('No listings found for this user.');
    }

    return { message: 'listings' };
  }

  public async deleteUserProfile(id: number, payload: JWTPayloadType) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Authorization check: Allow if the user is deleting their own profile or an admin is deleting
    const isAuthorized =
      user.id === payload.id || payload.role === UserType.ADMIN;
    if (!isAuthorized) {
      throw new ForbiddenException(
        'You are not authorized to delete this user',
      );
    }

    // Delete profile image if it exists
    if (user.profileImage?.public_id) {
      await this.cloudinaryService.destroyImage(user.profileImage.public_id);
    }

    // Remove user from the database
    await this.usersRepository.remove(user);

    return { message: `User with ID ${id} deleted successfully` };
  }

  public async getUserFavorites(payload: JWTPayloadType) {
    if (!payload.id) {
      throw new ForbiddenException('You are not authorized to view favorites');
    }
  
    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
      relations: ['favorites'], 
    });
  
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
  
    return { message: 'Done', favorites: user.favorites };
  }

  public async getToken(token: string) {
    const tokenDb = await this.tokenRepository.findOneBy({
      token,
      isValied: true,
    });
    if (!tokenDb) {
      throw new NotFoundException('Expired or invalid token');
    }
  }
}
