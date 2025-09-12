import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { NewsEntity } from "./news.entity";

@Entity(EntityName.NewsLikes)
export class NewsLikesEntity extends BaseEntity {
  @Column()
  newsId: number;
  @Column()
  userId: number;
  @ManyToOne(() => UserEntity, (user) => user.news_likes, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
  @ManyToOne(() => NewsEntity, (news) => news.likes, { onDelete: "CASCADE" })
  news: NewsEntity;
}
