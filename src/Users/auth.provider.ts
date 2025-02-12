import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import * as CryptoJS from 'crypto-js';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from 'src/untils/types';
import { Token } from 'src/Token/token.entity';
import { CloudinaryService } from 'src/Cloudinary/cloudinary.service';
import { OtpService } from './otpGenerator.provider';
import { MailService } from 'src/mail/mail.service';
import { StatusType } from 'src/untils/enums';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
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
    const { username, email, password, phone } = registerDto;

    // Check if email already exists
    const isEmailExist = await this.usersRepository.findOne({
      where: { email },
    });
    if (isEmailExist) {
      throw new NotFoundException(
        'Email already exists, please choose another one.',
      );
    }

    const hashedPassword = await this.hashPassword(password);

    // Encrypt Phone
    const encryptedPhone = CryptoJS.AES.encrypt(
      phone,
      process.env.CRYPTOKEY,
    ).toString();

    // Upload image to User Profile
    const uploadResult =
      await this.cloudinaryService.uploadProfileImage(profileImage);

    // Generate random OTP
    const OTP = this.otpService.OTPGeneratorFn();

    // Check if email was sent successfully
    let emailSent = false;
    try {
      await this.mailService.sendOtpEmailTemplate(email, OTP.OTPCode);
      emailSent = true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      emailSent = false;
    }

    // Create new user
    const newUser = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      phone: encryptedPhone,
      profileImage: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
      OTP: { OTPCode: OTP.OTPCode, expireDate: OTP.expireDate }, // Ensure OTP format is correct
    });

    // Save user first before sending OTP
    await this.usersRepository.save(newUser);

    return {
      message: 'User successfully registered',
      newUser,
      emailSent: emailSent ? 'Email sent successfully' : 'Failed to send email',
    };
  }

  /**
   * Log In user
   * @param loginDto The user's login data.
   * @returns JWT (access token)
   */

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });
    if (!user) throw new NotFoundException('Wrong Password Or Email');

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordMatch) throw new NotFoundException('Wrong Password Or Email');

      if (!user.confirmEmail) {
        throw new NotFoundException("Confirm Your Email First");
      }

    const payload: JWTPayloadType = {
      id: user.id,
      username: user.username, 
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };
    const token = await this.generateJWT(payload);
    const AccessToken = this.tokenRepository.create({
      token,
      user: user.id,
    });
    await this.tokenRepository.save(AccessToken);
    
    user.status = StatusType.ONLINE;

    await this.usersRepository.save(user);

    return { message: 'Login Successful', token: `Bearer ${token}` };
  }

  /**
   *  Hashes the password.
   * @param password  The password to hash.
   * @returns  Hashed password.
   */
  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /**
   *  Generates JWT token from payload.
   * @param payload  The user's payload.  This should contain the user's id and user type.  For example: { id: 1, userType: 'admin' }.  The JWT library automatically generates
   * @returns  JWT token.
   */
  public generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '2h', // Set the token expiration time to 2 hours
    });
  }  
}
