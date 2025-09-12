import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { NewsEntity } from "../../news/entities/news.entity";
import { EntityName } from "src/common/enums/entity.enum";

@Entity(EntityName.NewsTag)
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @ManyToMany(() => NewsEntity, (news) => news.tags)
  news: NewsEntity[];
}
