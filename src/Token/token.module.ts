import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { Token } from "./token.entity";
import { UsersModule } from "src/Users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Token]),
        JwtModule,
        forwardRef(() => UsersModule),
    ],
})
export class TokenModule {}