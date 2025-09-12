import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToOne } from "typeorm";
import { NewsEntity } from "./news.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";

@Entity(EntityName.NewsCategory)
export class NewsCategoryEntity extends BaseEntity {
  @Column()
  newsId: number;
  @Column()
  categoryId: number;
  @ManyToOne(() => NewsEntity, (news) => news.categories, {
    onDelete: "CASCADE",
  })
  news: NewsEntity;
  @ManyToOne(() => CategoryEntity, (category) => category.news_categories, {
    onDelete: "CASCADE",
  })
  category: CategoryEntity;
}
