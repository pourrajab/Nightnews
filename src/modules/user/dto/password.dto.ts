import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  currentPassword: string;

  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(8, 128, { message: ValidationMessage.PasswordTooShort })
  newPassword: string;
}

export class UpdateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  userId: number;

  @ApiProperty({ enum: ["admin", "journalist", "reader"] })
  @IsNotEmpty({ message: ValidationMessage.Required })
  role: string;
}
