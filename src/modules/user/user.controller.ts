import { Body, Controller, Get, Patch, Post, Put, Query, Res, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { ChangeEmailDto, ChangePhoneDto, ChangeUsernameDto, ProfileDto } from "./dto/profile.dto";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/common/utils/multer.util";
import { ProfileImages } from "./types/files";
import { UploadedOptionalFiles } from "src/common/decorators/upload-file.decorator";
import { Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { CookiesOptionsToken } from "src/common/utils/cookie.util";
import { PublicMessage } from "src/common/enums/message.enum";
import { CheckOtpDto, UserBlockDto } from "../auth/dto/auth.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { ChangePasswordDto, UpdateUserRoleDto } from "./dto/password.dto";

@Controller("user")
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put("/profile")
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image_profile", maxCount: 1 },
        { name: "bg_image", maxCount: 1 },
      ],
      {
        storage: multerStorage("user-profile"),
      }
    )
  )
  changeProfile(@UploadedOptionalFiles() files: ProfileImages, @Body() profileDto: ProfileDto) {
    return this.userService.changeProfile(files, profileDto);
  }
  @Get("/profile")
  profile() {
    return this.userService.profile();
  }
  @Get("/list")
  @Pagination()
  find(@Query() paginationDto: PaginationDto) {
    return this.userService.find(paginationDto);
  }

  @Patch("/change-email")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(emailDto.email);
    if (message) return res.json({ message });
    res.cookie(CookieKeys.EmailOTP, token, CookiesOptionsToken());
    res.json({
      code,
      message: PublicMessage.SentOtp,
    });
  }
  @Post("/verify-email-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyEmail(otpDto.code);
  }
  @Patch("/change-phone")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changePhone(phoneDto.phone);
    if (message) return res.json({ message });
    res.cookie(CookieKeys.PhoneOTP, token, CookiesOptionsToken());
    res.json({
      code,
      message: PublicMessage.SentOtp,
    });
  }
  @Post("/verify-phone-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyPhone(otpDto.code);
  }
  @Post("/block")
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async block(@Body() blockDto: UserBlockDto) {
    return this.userService.blockToggle(blockDto);
  }
  @Patch("/change-username")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }

  @Patch("/change-password")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.userService.changePassword(body);
  }

  @Patch("/role")
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateRole(@Body() body: UpdateUserRoleDto) {
    return this.userService.updateUserRole(body);
  }
}
