import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { NewsService } from "../services/news.service";
import { CreateNewsDto, FilterNewsDto, UpdateNewsDto } from "../dto/news.dto";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SkipAuth } from "src/common/decorators/skip-auth.decorator";
import { FilterNews } from "src/common/decorators/filter.decorator";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { RoleGuard } from "../../auth/guards/role.guard";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";

@Controller("news")
@ApiTags("News")
@AuthDecorator()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post("/")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin, Roles.Journalist)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() newsDto: CreateNewsDto) {
    return this.newsService.create(newsDto);
  }

  @Get("/newslist")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  myNews() {
    return this.newsService.myNews();
  }

  @Get("/")
  @SkipAuth()
  @Pagination()
  @FilterNews()
  find(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterNewsDto
  ) {
    return this.newsService.newsList(paginationDto, filterDto);
  }

  @Get("tags/:slug")
  @SkipAuth()
  @Pagination()
  findByTag(
    @Param("slug") slug: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.newsService.newsByTag(slug, paginationDto);
  }

  @Get(":slug")
  @SkipAuth()
  @Pagination()
  findOneBySlug(
    @Param("slug") slug: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.newsService.findOneBySlug(slug, paginationDto);
  }

  @Get("/like/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  likeToggle(@Param("id", ParseIntPipe) id: number) {
    return this.newsService.likeToggle(id);
  }

  @Get("/bookmark/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  bookmarkToggle(@Param("id", ParseIntPipe) id: number) {
    return this.newsService.bookmarkToggle(id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin)
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.newsService.delete(id);
  }

  @Put(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin, Roles.Journalist)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() newsDto: UpdateNewsDto
  ) {
    return this.newsService.update(id, newsDto);
  }

  @Patch(":id/status")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.newsService.toggleStatus(id);
  }
}
