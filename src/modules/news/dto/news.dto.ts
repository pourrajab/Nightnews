import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEnum,
} from "class-validator";
import { Transform } from "class-transformer";
import { NewsStatus } from "../enum/status.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateNewsDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(10, 150, { message: ValidationMessage.LengthOutOfRangeNewsTitle })
  title: string;

  @ApiPropertyOptional()
  slug: string;

  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(10, undefined, { message: ValidationMessage.LengthOutOfRangeNewsConetnt })
  content: string;

  @ApiPropertyOptional()
  image: string;

  @ApiProperty({ type: String, isArray: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim());
    }
    return value;
  })
  @IsArray({ message: "دسته‌بندی‌ها باید به صورت آرایه ارسال شوند" })
  categories: string[];

  @ApiPropertyOptional({ type: String, isArray: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim());
    }
    return value;
  })
  @IsOptional()
  @IsArray({ message: "تگ‌ها باید به صورت آرایه ارسال شوند" })
  tags?: string[];
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}

export class FilterNewsDto {
  @ApiPropertyOptional()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: NewsStatus })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional()
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional({ description: "from date ISO (created_at >= from)" })
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: "to date ISO (created_at <= to)" })
  @IsOptional()
  to?: string;
}
