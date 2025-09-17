import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { NewsEntity } from "./news.entity";

@Entity(EntityName.NewsComments)
export class NewsCommentEntity extends BaseEntity {
  @Column()
  text: string;
  @Column({ default: true })
  accepted: boolean;
  @Column()
  newsId: number;
  @Column()
  userId: number;
  @Column({ nullable: true })
  parentId: number;
  @ManyToOne(() => UserEntity, (user) => user.news_comments, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
  @ManyToOne(() => NewsEntity, (news) => news.comments, { onDelete: "CASCADE" })
  news: NewsEntity;
  @ManyToOne(() => NewsCommentEntity, (parent) => parent.children, {
    onDelete: "CASCADE",
  })
  parent: NewsCommentEntity;
  @OneToMany(() => NewsCommentEntity, (comment) => comment.parent)
  @JoinColumn({ name: "parent" })
  children: NewsCommentEntity[];
  @CreateDateColumn()
  created_at: Date;
}
