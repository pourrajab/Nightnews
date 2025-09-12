import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";
import { NewsStatus } from "../enum/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { NewsLikesEntity } from "./like.entity";
import { NewsBookmarkEntity } from "./bookmark.entity";
import { NewsCommentEntity } from "./comment.entity";
import { NewsCategoryEntity } from "./news-category.entity";
import { TagEntity } from "../entities/tag.entity";

@Entity(EntityName.News)
export class NewsEntity extends BaseEntity {
  @Column()
  title: string;
  @Column()
  content: string;
  @Column({ nullable: true })
  image: string;
  @Column({ unique: true })
  slug: string;
  @Column({ default: NewsStatus.Draft })
  status: string;
  @Column()
  authorId: number;
  @ManyToOne(() => UserEntity, (user) => user.news, { onDelete: "CASCADE" })
  author: UserEntity;
  @OneToMany(() => NewsLikesEntity, (like) => like.news)
  likes: NewsLikesEntity[];
  @OneToMany(() => NewsCategoryEntity, (category) => category.news)
  categories: NewsCategoryEntity[];
  @OneToMany(() => NewsBookmarkEntity, (bookmark) => bookmark.news)
  bookmarks: NewsBookmarkEntity[];
  @OneToMany(() => NewsCommentEntity, (comment) => comment.news)
  comments: NewsCommentEntity[];
  @ManyToMany(() => TagEntity, (tag) => tag.news, { cascade: true })
  @JoinTable({
    name: "news_tags",
    joinColumn: { name: "newsId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tagId", referencedColumnName: "id" },
  })
  tags: TagEntity[];
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
