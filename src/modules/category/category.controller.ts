import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiConsumes, ApiQuery, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { RoleGuard } from "../auth/guards/role.guard";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { AuthDecorator } from "src/common/decorators/auth.decorator";

@Controller("categories")
@ApiTags("Categories")
@AuthDecorator()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAllWithoutPagination();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
