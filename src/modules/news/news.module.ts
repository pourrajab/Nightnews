import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { NewsService } from "./services/news.service";
import { NewsController } from "./controllers/news.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NewsEntity } from "./entities/news.entity";
import { CategoryService } from "../category/category.service";
import { CategoryEntity } from "../category/entities/category.entity";
import { NewsCategoryEntity } from "./entities/news-category.entity";
import { NewsLikesEntity } from "./entities/like.entity";
import { NewsBookmarkEntity } from "./entities/bookmark.entity";
import { TagEntity } from "./entities/tag.entity";
import { NewsCommentService } from "./services/comment.service";
import { NewsCommentEntity } from "./entities/comment.entity";
import { NewsCommentController } from "./controllers/comment.controller";
import { AddUserToReqWOV } from "src/common/middleware/addUserToReqWOV.middleware";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      NewsEntity,
      CategoryEntity,
      NewsCategoryEntity,
      NewsLikesEntity,
      NewsBookmarkEntity,
      NewsCommentEntity,
      TagEntity,
    ]),
  ],
  controllers: [NewsController, NewsCommentController],
  providers: [NewsService, CategoryService, NewsCommentService],
})
export class NewsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AddUserToReqWOV).forRoutes("news/:slug");
  }
}
