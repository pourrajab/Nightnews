import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NewsEntity } from "../entities/news.entity";
import { DataSource, In, Repository } from "typeorm";
import { CreateNewsDto, FilterNewsDto, UpdateNewsDto } from "../dto/news.dto";
import { createSlug, randomId } from "src/common/utils/functions.util";
import { NewsStatus } from "../enum/status.enum";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import {
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { CategoryService } from "../../category/category.service";
import { NewsCategoryEntity } from "../entities/news-category.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { NewsLikesEntity } from "../entities/like.entity";
import { NewsBookmarkEntity } from "../entities/bookmark.entity";
import { NewsCommentService } from "./comment.service";
import { TagEntity } from "../entities/tag.entity";

@Injectable({ scope: Scope.REQUEST })
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    @InjectRepository(NewsCategoryEntity)
    private newsCategoryRepository: Repository<NewsCategoryEntity>,
    @InjectRepository(NewsLikesEntity)
    private newsLikeRepository: Repository<NewsLikesEntity>,
    @InjectRepository(NewsBookmarkEntity)
    private newsBookmarkRepository: Repository<NewsBookmarkEntity>,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService,
    private newsCommentService: NewsCommentService,
    private dataSource: DataSource
  ) {}

  async create(newsDto: CreateNewsDto) {
    const user = this.request.user;
    let { title, slug, content, image, categories, tags = [] } = newsDto as any;
    let categoriesArray: string[] = Array.isArray(categories)
      ? categories
      : [categories];
    slug = createSlug(slug ?? title);

    const isExist = await this.checkNewsBySlug(slug);
    if (isExist) slug += `-${randomId()}`;

    let news = this.newsRepository.create({
      title,
      slug,
      content,
      image,
      status: NewsStatus.Draft,
      authorId: user.id,
    });
    news = await this.newsRepository.save(news);

    for (const categoryTitle of categoriesArray) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.insertByTitle(categoryTitle);
      }
      await this.newsCategoryRepository.insert({
        newsId: news.id,
        categoryId: category.id,
      });
    }
    await this.updateNewsTags(news, tags);
    return {
      message: PublicMessage.Created,
    };
  }

  async checkNewsBySlug(slug: string) {
    const news = await this.newsRepository.findOneBy({ slug });
    return news;
  }

  async myNews() {
    const { id } = this.request.user;
    return this.newsRepository.find({
      where: {
        authorId: id,
      },
      order: {
        id: "DESC",
      },
    });
  }

  async newsList(paginationDto: PaginationDto, filterDto: FilterNewsDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    let { category, search, status, authorId, from, to } = filterDto as any;
    let where = "";
    let params = {} as any;

    if (category) {
      category = (category as string).toLowerCase();
      if (where.length > 0) where += " AND ";
      where += "category.title = LOWER(:category)";
      params["category"] = category;
    }

    if (search) {
      if (where.length > 0) where += " AND ";
      search = `%${search}%` as string;
      where += "CONCAT(news.title, news.content) ILIKE :search";
      params["search"] = search;
    }

    if (status) {
      if (where.length > 0) where += " AND ";
      where += "news.status = :status";
      params["status"] = status;
    }
    if (authorId) {
      if (where.length > 0) where += " AND ";
      where += "news.authorId = :authorId";
      params["authorId"] = +authorId;
    }
    if (from) {
      if (where.length > 0) where += " AND ";
      where += "news.created_at >= :from";
      params["from"] = new Date(from);
    }
    if (to) {
      if (where.length > 0) where += " AND ";
      where += "news.created_at <= :to";
      params["to"] = new Date(to);
    }
    const [items, count] = await this.newsRepository
      .createQueryBuilder(EntityName.News)
      .leftJoin("news.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("news.author", "author")
      .leftJoin("author.profile", "profile")
      .addSelect([
        "categories.id",
        "category.title",
        "author.username",
        "author.id",
        "profile.nick_name",
      ])
      .where(where, params)
      .loadRelationCountAndMap("news.likes", "news.likes")
      .loadRelationCountAndMap("news.bookmarks", "news.bookmarks")
      .loadRelationCountAndMap(
        "news.comments",
        "news.comments",
        "comments",
        (qb) => qb.where("comments.accepted = :accepted", { accepted: true })
      )
      .orderBy("news.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pagination: paginationGenerator(count, page, limit),
      news: items,
    };
  }

  async checkExistNewsById(id: number) {
    const news = await this.newsRepository.findOneBy({ id });
    if (!news) throw new NotFoundException(NotFoundMessage.NotFoundPost);
    return news;
  }

  async delete(id: number) {
    await this.checkExistNewsById(id);
    await this.newsRepository.delete({ id });
    return {
      message: PublicMessage.Deleted,
    };
  }

  async update(id: number, newsDto: UpdateNewsDto) {
    const user = this.request.user;
    let { title, slug, content, image, categories, tags } = newsDto as any;
    const news = await this.checkExistNewsById(id);
    let categoriesArray: string[] = [];
    if (categories) {
      categoriesArray = Array.isArray(categories) ? categories : [categories];
    }
    let slugData = null as string | null;
    if (title) {
      slugData = title;
      news.title = title;
    }
    if (slug) slugData = slug;
    if (slugData) {
      slug = createSlug(slugData);
      const isExist = await this.checkNewsBySlug(slug);
      if (isExist && isExist.id !== id) {
        slug += `-${randomId()}`;
      }
      news.slug = slug;
    }
    if (content) news.content = content;
    if (image) news.image = image;
    await this.newsRepository.save(news);
    if (categoriesArray.length > 0) {
      await this.newsCategoryRepository.delete({ newsId: news.id });
    }
    for (const categoryTitle of categoriesArray) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.insertByTitle(categoryTitle);
      }
      await this.newsCategoryRepository.insert({
        newsId: news.id,
        categoryId: category.id,
      });
    }

    if (tags) {
      await this.updateNewsTags(news, tags);
    }
    return {
      message: PublicMessage.Updated,
    };
  }

  protected async updateNewsTags(news: NewsEntity, tags: string[]) {
    if (!Array.isArray(tags)) return;

    const uniqueTitles = Array.from(
      new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
    );

    const existingTags = await this.tagRepository.find({
      where: { slug: In(uniqueTitles.map((t) => createSlug(t))) },
    });

    const newTags: TagEntity[] = [];

    for (const title of uniqueTitles) {
      const slug = createSlug(title);
      let tag = existingTags.find((t) => t.slug === slug);
      if (!tag) {
        tag = this.tagRepository.create({ title, slug });
        tag = await this.tagRepository.save(tag);
      }
      newTags.push(tag);
    }

    news.tags = newTags;
    await this.newsRepository.save(news);
  }

  async listTags() {
    return this.tagRepository.find({ order: { title: "ASC" } });
  }

  async likeToggle(newsId: number) {
    const { id: userId } = this.request.user;
    await this.checkExistNewsById(newsId);
    const isLiked = await this.newsLikeRepository.findOneBy({ userId, newsId });
    let message = PublicMessage.Like;
    if (isLiked) {
      await this.newsLikeRepository.delete({ id: isLiked.id });
      message = PublicMessage.DisLike;
    } else {
      await this.newsLikeRepository.insert({
        newsId,
        userId,
      });
    }
    return { message };
  }

  async bookmarkToggle(newsId: number) {
    const { id: userId } = this.request.user;
    const item = await this.checkExistNewsById(newsId);
    const isBookmarked = await this.newsBookmarkRepository.findOneBy({
      userId,
      newsId,
    });
    let message = PublicMessage.Bookmark;
    if (isBookmarked) {
      await this.newsBookmarkRepository.delete({ id: isBookmarked.id });
      message = PublicMessage.UnBookmark;
    } else {
      await this.newsBookmarkRepository.insert({
        newsId,
        userId,
      });
    }
    return { message };
  }

  async toggleStatus(id: number) {
    const newsItem = await this.checkExistNewsById(id);
    const newStatus =
      newsItem.status === NewsStatus.Published
        ? NewsStatus.Draft
        : NewsStatus.Published;
    newsItem.status = newStatus;
    await this.newsRepository.save(newsItem);
    return {
      message: `News status changed to ${newStatus}`,
      status: newStatus,
    };
  }

  // async findOneBySlug(slug: string, paginationDto: PaginationDto) {
  //   const userId = this.request?.user?.id;
  //   const newsItem = await this.newsRepository
  //     .createQueryBuilder(EntityName.News)
  //     .leftJoin("news.categories", "categories")
  //     .leftJoin("categories.category", "category")
  //     .leftJoin("news.author", "author")
  //     .leftJoin("author.profile", "profile")
  //     .addSelect([
  //       "categories.id",
  //       "category.title",
  //       "author.username",
  //       "author.id",
  //       "profile.nick_name",
  //     ])
  //     .where({ slug })
  //     .loadRelationCountAndMap("news.likes", "news.likes")
  //     .loadRelationCountAndMap("news.bookmarks", "news.bookmarks")
  //     .getOne();
  //   if (!newsItem) throw new NotFoundException(NotFoundMessage.NotFoundPost);
  //   // fetch tags of this news (current approach: lightweight second query)
  //   const tagRows = await this.tagRepository
  //     .createQueryBuilder("tag")
  //     .innerJoin(NewsTagEntity, "nt", "nt.tagId = tag.id")
  //     .where("nt.newsId = :id", { id: newsItem.id })
  //     .select(["tag.title AS title", "tag.slug AS slug"])
  //     .getRawMany();
  //   const tags = tagRows.map((r) => ({ title: r.title, slug: r.slug }));

  //   const commentsData = await this.newsCommentService.findCommentsOfNews(
  //     newsItem.id,
  //     paginationDto
  //   );
  //   let isLiked = false;
  //   let isBookmarked = false;
  //   if (userId && !isNaN(userId) && userId > 0) {
  //     isLiked = !!(await this.newsLikeRepository.findOneBy({
  //       userId,
  //       newsId: newsItem.id,
  //     }));
  //     isBookmarked = !!(await this.newsBookmarkRepository.findOneBy({
  //       userId,
  //       newsId: newsItem.id,
  //     }));
  //   }
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   const suggestNews = await queryRunner.query(`
  //           WITH suggested_news AS (
  //               SELECT
  //                   news.id,
  //                   news.slug,
  //                   news.title,
  //                   news.content,
  //                   news.image,
  //                   json_build_object(
  //                       'username', u.username,
  //                       'author_name', p.nick_name,
  //                       'image', p.image_profile
  //                   ) AS author,
  //                   array_agg(DISTINCT cat.title) AS categories,
  //                   array_agg(DISTINCT tag.slug) AS tags,
  //                   (
  //                       SELECT COUNT(*) FROM news_likes
  //                       WHERE news_likes."newsId" = news.id
  //                   ) AS likes,
  //                   (
  //                       SELECT COUNT(*) FROM news_bookmarks
  //                       WHERE news_bookmarks."newsId" = news.id
  //                   ) AS bookmarks,
  //                   (
  //                       SELECT COUNT(*) FROM news_comments
  //                       WHERE news_comments."newsId" = news.id
  //                   ) AS comments
  //               FROM news
  //               LEFT JOIN public.user u ON news."authorId" = u.id
  //               LEFT JOIN profile p ON p."userId" = u.id
  //               LEFT JOIN news_category bc ON news.id = bc."newsId"
  //               LEFT JOIN category cat ON bc."categoryId" = cat.id
  //               LEFT JOIN news_tags nt ON nt."newsId" = news.id
  //               LEFT JOIN tags tag ON tag.id = nt."tagId"
  //               GROUP BY news.id, u.username, p.nick_name, p.image_profile
  //               ORDER BY RANDOM()
  //               LIMIT 3

  //           )
  //           SELECT * FROM suggested_news
  //       `);
  //   return {
  //     news: newsItem,
  //     isLiked,
  //     isBookmarked,
  //     commentsData,
  //     tags,
  //     suggestNews,
  //   };
  // }

  // async findOneBySlug(slug: string, paginationDto: PaginationDto) {
  //   const userId = this.request?.user?.id;

  //   const newsItem = await this.newsRepository
  //     .createQueryBuilder(EntityName.News)
  //     .leftJoin("news.categories", "categories")
  //     .leftJoin("categories.category", "category")
  //     .leftJoin("news.author", "author")
  //     .leftJoin("author.profile", "profile")
  //     .leftJoinAndSelect("news.tags", "newsTags")
  //     .leftJoinAndSelect("newsTags.tag", "tag")
  //     .addSelect([
  //       "categories.id",
  //       "category.title",
  //       "author.username",
  //       "author.id",
  //       "profile.nick_name",
  //       "tag.id",
  //       "tag.title",
  //       "tag.slug",
  //     ])
  //     .where("news.slug = :slug", { slug })
  //     .loadRelationCountAndMap("news.likes", "news.likes")
  //     .loadRelationCountAndMap("news.bookmarks", "news.bookmarks")
  //     .getOne();

  //   if (!newsItem) throw new NotFoundException(NotFoundMessage.NotFoundPost);

  //   const commentsData = await this.newsCommentService.findCommentsOfNews(
  //     newsItem.id,
  //     paginationDto
  //   );

  //   let isLiked = false;
  //   let isBookmarked = false;
  //   if (userId && !isNaN(userId) && userId > 0) {
  //     isLiked = !!(await this.newsLikeRepository.findOneBy({
  //       userId,
  //       newsId: newsItem.id,
  //     }));
  //     isBookmarked = !!(await this.newsBookmarkRepository.findOneBy({
  //       userId,
  //       newsId: newsItem.id,
  //     }));
  //   }

  //   return {
  //     news: newsItem,
  //     isLiked,
  //     isBookmarked,
  //     commentsData,
  //     tags: newsItem.tags,
  //   };
  // }

  async findOneBySlug(slug: string, paginationDto: PaginationDto) {
    const userId = this.request?.user?.id;

    const newsItem = await this.newsRepository
      .createQueryBuilder(EntityName.News)
      .leftJoin("news.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("news.author", "author")
      .leftJoin("author.profile", "profile")
      .leftJoinAndSelect("news.tags", "newsTags")
      .leftJoinAndSelect("newsTags.tag", "tag")
      .addSelect([
        "categories.id",
        "category.title",
        "author.username",
        "author.id",
        "profile.nick_name",
        "tag.id",
        "tag.title",
        "tag.slug",
      ])
      .where("news.slug = :slug", { slug })
      .loadRelationCountAndMap("news.likes", "news.likes")
      .loadRelationCountAndMap("news.bookmarks", "news.bookmarks")
      .getOne();

    if (!newsItem) throw new NotFoundException(NotFoundMessage.NotFoundPost);

    const commentsData = await this.newsCommentService.findCommentsOfNews(
      newsItem.id,
      paginationDto
    );

    let isLiked = false;
    let isBookmarked = false;
    if (userId && !isNaN(userId) && userId > 0) {
      isLiked = !!(await this.newsLikeRepository.findOneBy({
        userId,
        newsId: newsItem.id,
      }));
      isBookmarked = !!(await this.newsBookmarkRepository.findOneBy({
        userId,
        newsId: newsItem.id,
      }));
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const suggestNews = await queryRunner.query(`
      WITH suggested_news AS (
          SELECT
              news.id,
              news.slug,
              news.title,
              news.content,
              news.image,
              json_build_object(
                  'username', u.username,
                  'author_name', p.nick_name,
                  'image', p.image_profile
              ) AS author,
              array_agg(DISTINCT cat.title) AS categories,
              array_agg(DISTINCT tag.slug) AS tags,
              (
                  SELECT COUNT(*) FROM news_likes
                  WHERE news_likes."newsId" = news.id
              ) AS likes,
              (
                  SELECT COUNT(*) FROM news_bookmarks
                  WHERE news_bookmarks."newsId" = news.id
              ) AS bookmarks,
              (
                  SELECT COUNT(*) FROM news_comments
                  WHERE news_comments."newsId" = news.id
              ) AS comments
          FROM news
          LEFT JOIN public.user u ON news."authorId" = u.id
          LEFT JOIN profile p ON p."userId" = u.id
          LEFT JOIN news_category bc ON news.id = bc."newsId"
          LEFT JOIN category cat ON bc."categoryId" = cat.id
          LEFT JOIN news_tags nt ON nt."newsId" = news.id
          LEFT JOIN tags tag ON tag.id = nt."tagId"
          GROUP BY news.id, u.username, p.nick_name, p.image_profile
          ORDER BY RANDOM()
          LIMIT 3
      )
      SELECT * FROM suggested_news
    `);

    await queryRunner.release();

    return {
      news: newsItem,
      isLiked,
      isBookmarked,
      commentsData,
      tags: newsItem.tags,
      suggestNews,
    };
  }

  async newsByTag(slug: string, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    const [items, count] = await this.newsRepository
      .createQueryBuilder("news")
      .innerJoin("news.tags", "nt")
      .innerJoin("nt.tag", "tag")
      .leftJoin("news.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("news.author", "author")
      .leftJoin("author.profile", "profile")
      .addSelect([
        "categories.id",
        "category.title",
        "author.username",
        "author.id",
        "profile.nick_name",
        "tag.id",
        "tag.title",
        "tag.slug",
      ])
      .where("tag.slug = :slug", { slug })
      .loadRelationCountAndMap("news.likes", "news.likes")
      .loadRelationCountAndMap("news.bookmarks", "news.bookmarks")
      .orderBy("news.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pagination: paginationGenerator(count, page, limit),
      news: items,
    };
  }
}
