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
  Inject,
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { RoleGuard } from "../../auth/guards/role.guard";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { NewsCommentService } from "../services/comment.service";
import { CreateCommentDto } from "../dto/comment.dto";

@Controller("news/:newsId/comments")
@ApiTags("News Comments")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class NewsCommentController {
  constructor(
    private readonly newsCommentService: NewsCommentService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(
    @Param("newsId", ParseIntPipe) newsId: number,
    @Body() commentDto: CreateCommentDto
  ) {
    return this.newsCommentService.create({ ...commentDto, newsId });
  }

  @Get("/")
  @Pagination()
  find(
    @Param("newsId", ParseIntPipe) newsId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.newsCommentService.findByNewsId(newsId, paginationDto);
  }

  @Get("/my")
  @Pagination()
  findMyComments(
    @Param("newsId", ParseIntPipe) newsId: number,
    @Query() paginationDto: PaginationDto
  ) {
    const userId = (this.request as any).user.id;
    return this.newsCommentService.findCommentsForUser(
      newsId,
      userId,
      paginationDto
    );
  }

  @Put("/accept/:id")
  accept(@Param("id", ParseIntPipe) id: number) {
    return this.newsCommentService.accept(id);
  }

  @Put("/reject/:id")
  reject(@Param("id", ParseIntPipe) id: number) {
    return this.newsCommentService.reject(id);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.newsCommentService.delete(id);
  }
}
