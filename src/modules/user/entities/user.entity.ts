import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from "typeorm";
import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
import { NewsEntity } from "src/modules/news/entities/news.entity";
import { NewsLikesEntity } from "src/modules/news/entities/like.entity";
import { NewsBookmarkEntity } from "src/modules/news/entities/bookmark.entity";
import { NewsCommentEntity } from "src/modules/news/entities/comment.entity";
import { ImageEntity } from "src/modules/image/entities/image.entity";
import { Roles } from "src/common/enums/role.enum";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({ default: Roles.Reader })
  role: string;
  @Column({ nullable: true })
  status: string;
  @Column({ nullable: true })
  new_email: string;
  @Column({ nullable: true })
  new_phone: string;
  @Column({ nullable: true, default: false })
  verify_email: boolean;
  @Column({ nullable: true, default: false })
  verify_phone: boolean;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true })
  otpId: number;
  @Column({ nullable: true })
  profileId: number;
  @OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
  @JoinColumn()
  otp: OtpEntity;
  @OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
  @JoinColumn()
  profile: ProfileEntity;
  @OneToMany(() => NewsEntity, (news) => news.author)
  news: NewsEntity[];
  @OneToMany(() => NewsLikesEntity, (like) => like.user)
  news_likes: NewsLikesEntity[];
  @OneToMany(() => NewsBookmarkEntity, (bookmark) => bookmark.user)
  news_bookmarks: NewsBookmarkEntity[];
  @OneToMany(() => NewsCommentEntity, (comment) => comment.user)
  news_comments: NewsCommentEntity[];
  @OneToMany(() => ImageEntity, (image) => image.user)
  images: ImageEntity[];
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
