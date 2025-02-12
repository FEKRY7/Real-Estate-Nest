import { Injectable } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as schedule from 'node-schedule';

@Injectable()
export class OtpService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  OTPGeneratorFn(): { OTPCode: string; expireDate: Date } {
    // Get OTP length from environment variables (default to 6 if not set)
    const otpLength = parseInt(
      this.configService.get<string>('OTPNUMBERS') || '6',
      10,
    );

    // Generate OTP
    const OTP = {
      OTPCode: otpGenerator.generate(otpLength, {
        upperCaseAlphabets: false,
        specialChars: false,
      }),
      expireDate: moment().add(2, 'minutes').toDate(), // Convert moment to Date object
    };

    return OTP;
  }

  generateOtp(): { OTPCode: string } {
    const otpLength = parseInt(
      this.configService.get<string>('OTPNUMBERS') || '6',
      10,
    );
    return {
      OTPCode: otpGenerator.generate(otpLength, {
        upperCaseAlphabets: false,
        specialChars: false,
      }),
    };
  }

  generateOtpWithExpireDate(): { OTPCode: string; expireDate: Date } {
    const otpLength = parseInt(
      this.configService.get<string>('OTPNUMBERS') || '6',
      10,
    );
    return {
      OTPCode: otpGenerator.generate(otpLength, {
        upperCaseAlphabets: false,
        specialChars: false,
      }),
      expireDate: moment().add(2, 'minutes').toDate(),
    };
  }

  scheduleNotConfirmedEmailsReminder(): void {
    schedule.scheduleJob('0 0 21 * * *', async () => {
      const notConfirmedUsers = await this.usersRepository.find({
        where: { confirmEmail: false },
      });

      for (const user of notConfirmedUsers) {
        console.log(`Reminder Sent to ${user.email}`);
        await this.mailService.SendReminderEmail(user.email);
      }
    });
  }
}
