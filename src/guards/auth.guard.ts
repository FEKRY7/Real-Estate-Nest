import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CURRENT_USER_KEY } from 'src/untils/constants';
import { JWTPayloadType } from 'src/untils/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (token && type === 'Bearer') {
      try{
        const payload: JWTPayloadType = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
        });
          request[CURRENT_USER_KEY] = payload;
      }catch(error){
       throw new UnauthorizedException('Invalid token');
      }
    } else {
        throw new UnauthorizedException("No token provided or invalid format");
    }

    // check if token is valid and authorized to access the requested resource

    return true; // or return an Observable<boolean>
  }
}