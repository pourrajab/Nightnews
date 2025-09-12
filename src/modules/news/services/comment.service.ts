import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NewsEntity } from "../entities/news.entity";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { NewsCommentEntity } from "../entities/comment.entity";
import { NewsService } from "./news.service";
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
import { CreateCommentDto } from "../dto/comment.dto";

@Injectable({ scope: Scope.REQUEST })
export class NewsCommentService {
  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    @InjectRepository(NewsCommentEntity)
    private newsCommentRepository: Repository<NewsCommentEntity>,
    @Inject(REQUEST) private request: Request,
    @Inject(forwardRef(() => NewsService)) private newsService: NewsService
  ) {}

  async create(commentDto: CreateCommentDto & { newsId: number }) {
    const { parentId, text, newsId } = commentDto;
    const { id: userId } = this.request.user as any;
    const news = await this.newsService.checkExistNewsById(newsId);
    let parent = null;
    if (parentId && !isNaN(parentId as any)) {
      parent = await this.newsCommentRepository.findOneBy({ id: +parentId });
    }
    await this.newsCommentRepository.insert({
      text,
      accepted: false,
      newsId,
      parentId: parent ? (parentId as any) : null,
      userId,
    });
    return {
      message: PublicMessage.CreatedComment,
    };
  }

  async find(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.newsCommentRepository.findAndCount({
      where: { accepted: true },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async findByNewsId(newsId: number, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.newsCommentRepository.findAndCount({
      where: { accepted: true, newsId },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async findCommentsForUser(
    newsId: number,
    userId: number,
    paginationDto: PaginationDto
  ) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.newsCommentRepository.findAndCount({
      where: { newsId, userId },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async accept(id: number) {
    const comment = await this.newsCommentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);

    const user: any = this.request.user;
    if (!user) throw new ForbiddenException();
    const isAdmin = user.role === "admin" || user.role === "Admin";
    let isNewsAuthor = false;
    if (user.role?.toLowerCase?.() === "journalist") {
      const news = await this.newsRepository.findOneBy({ id: comment.newsId });
      isNewsAuthor = !!news && news.authorId === user.id;
    }
    if (!(isAdmin || isNewsAuthor)) {
      throw new ForbiddenException();
    }

    comment.accepted = true;
    await this.newsCommentRepository.save(comment);
    return { message: PublicMessage.CommentAccepted };
  }

  async reject(id: number) {
    const comment = await this.newsCommentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);

    const user: any = this.request.user;
    if (!user) throw new ForbiddenException();
    const isAdmin = user.role === "admin" || user.role === "Admin";
    let isNewsAuthor = false;
    if (user.role?.toLowerCase?.() === "journalist") {
      const news = await this.newsRepository.findOneBy({ id: comment.newsId });
      isNewsAuthor = !!news && news.authorId === user.id;
    }
    if (!(isAdmin || isNewsAuthor)) {
      throw new ForbiddenException();
    }

    comment.accepted = false;
    await this.newsCommentRepository.save(comment);
    return { message: PublicMessage.CommentRejected };
  }

  async delete(id: number) {
    const comment = await this.newsCommentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);
    const user: any = this.request.user;
    if (!user) throw new ForbiddenException();
    const isAdmin = user.role === "admin" || user.role === "Admin";
    const isCommentAuthor = comment.userId === user.id;
    let isNewsAuthor = false;
    if (user.role?.toLowerCase?.() === "journalist") {
      const news = await this.newsRepository.findOneBy({ id: comment.newsId });
      isNewsAuthor = !!news && news.authorId === user.id;
    }
    if (!(isAdmin || isCommentAuthor || isNewsAuthor)) {
      throw new ForbiddenException();
    }
    await this.newsCommentRepository.delete({ id });
    return { message: PublicMessage.Deleted };
  }

  async findCommentsOfNews(newsId: number, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.newsCommentRepository.findAndCount({
      where: { newsId, accepted: true },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }
}
