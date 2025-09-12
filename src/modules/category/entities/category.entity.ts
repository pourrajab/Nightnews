import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { NewsCategoryEntity } from "src/modules/news/entities/news-category.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity(EntityName.Category)
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  priority: number;
  @OneToMany(() => NewsCategoryEntity, (news) => news.category)
  news_categories: NewsCategoryEntity[];
}
