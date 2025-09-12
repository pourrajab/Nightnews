import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthDto, CheckOtpDto } from "./dto/auth.dto";
import { PasswordLoginDto, PasswordRegisterDto } from "./dto/password.dto";
import { Throttle } from "@nestjs/throttler";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { Request, Response } from "express";
import { AuthGuard } from "./guards/auth.guard";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    console.log("[AuthController] POST /auth/register payload:", authDto);
    return this.authService.userExistence(authDto, res);
  }

  @Post("login")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  userExistenceLogin(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res);
  }

  @Post("check-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    return this.authService.checkOtp(checkOtpDto.code);
  }

  @Post("register-password")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  registerWithPassword(@Body() body: PasswordRegisterDto) {
    console.log("[AuthController] POST /auth/register-password payload:", body);
    return this.authService.registerWithPassword(body);
  }

  @Post("login-password")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  loginWithPassword(@Body() body: PasswordLoginDto, ) {
    return this.authService.loginWithPassword(body);
  }

  @Get("check-login")
  @AuthDecorator()
  checkLogin(@Req() req: Request) {
    return req.user;
  }
}
