import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
  IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";
import { ValidationMessage } from "src/common/enums/message.enum";
import { Gender } from "../enum/gender.enum";

export class ProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" && value.trim() === "" ? undefined : value
  )
  @Length(3, 100, { message: "نام نمایشی باید حداقل 3 کاراکتر باشد" })
  nick_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" && value.trim() === "" ? undefined : value
  )
  @Length(10, 200, { message: "بیوگرافی باید حداقل 10 کاراکتر باشد" })
  bio: string;

  @ApiPropertyOptional({ nullable: true, format: "binary" })
  image_profile: string;

  @ApiPropertyOptional({ nullable: true, format: "binary" })
  bg_image: string;

  @ApiPropertyOptional({ nullable: true, enum: Gender })
  @IsOptional()
  @IsEnum(Gender, { message: ValidationMessage.InvalidEnum })
  gender: string;

  @ApiPropertyOptional({ nullable: true })
  birthday: Date;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: ValidationMessage.InvalidURL })
  x_profile: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: ValidationMessage.InvalidURL })
  linkedin_profile: string;
}
export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: ValidationMessage.InvalidEmailFormat })
  email: string;
}
export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone("fa-IR", {}, { message: ValidationMessage.InvalidPhoneFormat })
  phone: string;
}
export class ChangeUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(3, 100, { message: "نام کاربری باید حداقل 3 کاراکتر باشد" })
  username: string;
}
