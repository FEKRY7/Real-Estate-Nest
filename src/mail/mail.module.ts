import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'node:path'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        return {
          transport: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: {
              user: process.env.SMTP_USERNAME,
              pass: process.env.SMTP_PASSWORD,
            },
          },
          template:{
           dir:join(__dirname,'./templates'),
           adapter: new EjsAdapter({
             inlineCssEnabled:true
           })
          }
        };
      },
    }),
  ], 
  providers: [MailService],
  exports: [MailService] 
})
export class MailModule {}

// import { MailerModule } from '@nestjs-modules/mailer';
// import { Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { MailService } from './mail.service';

// @Module({
//   imports: [
//     MailerModule.forRootAsync({
//         inject:[ConfigService],
//       useFactory: (config:ConfigService) => {
//         return {
//             transport: {
//                 host: config.get<string>('SMTP_HOST'),
//                 port: config.get<number>('SMTP_PORT'),
//                 secure: false, // Use TLS if secure is true
//                 auth: {
//                   user: config.get<string>('SMTP_USERNAME'),
//                   pass: config.get<string>('SMTP_PASSWORD'),
//                 },
//               }, 
//         } 
//       },
//     }),
//   ],
//   providers: [MailService],
//   exports: [MailService] 
// })

// export class MailModule {}
