import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import { EntityName } from "src/common/enums/entity.enum";

export class InitSchema1725761000000 implements MigrationInterface {
  name = "InitSchema1725761000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------------- User ----------------
    if (!(await queryRunner.hasTable(EntityName.User))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.User,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            {
              name: "username",
              type: "varchar",
              length: "50",
              isUnique: true,
              isNullable: true,
            },
            {
              name: "phone",
              type: "varchar",
              length: "12",
              isUnique: true,
              isNullable: true,
            },
            {
              name: "email",
              type: "varchar",
              length: "100",
              isUnique: true,
              isNullable: true,
            },
            {
              name: "role",
              type: "varchar",
              length: "20",
              default: `'reader'`,
            },
            { name: "status", type: "varchar", length: "20", isNullable: true },
            {
              name: "profileId",
              type: "int",
              isUnique: true,
              isNullable: true,
            },
            { name: "new_email", type: "varchar", isNullable: true },
            { name: "new_phone", type: "varchar", isNullable: true },
            { name: "verify_phone", type: "boolean", default: false },
            { name: "verify_email", type: "boolean", default: false },
            {
              name: "password",
              type: "varchar",
              length: "128",
              isNullable: true,
            },
            { name: "created_at", type: "timestamp", default: "now()" },
          ],
        }),
        true
      );
    }

    // ---------------- Profile ----------------
    if (!(await queryRunner.hasTable(EntityName.Profile))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.Profile,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "nick_name", type: "varchar", length: "50" },
            { name: "bio", type: "text", isNullable: true },
            {
              name: "image_profile",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            {
              name: "bg_image",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            { name: "gender", type: "varchar", length: "20", isNullable: true },
            { name: "birthday", type: "timestamp", isNullable: true },
            {
              name: "x_profile",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            {
              name: "linkedin_profile",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            { name: "userId", type: "int" },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["userId"],
              referencedTableName: EntityName.User,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true
      );
    }

    // ---------------- OTP ----------------
    if (!(await queryRunner.hasTable(EntityName.Otp))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.Otp,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "code", type: "varchar", length: "10" },
            { name: "expiresIn", type: "timestamp" },
            { name: "userId", type: "int" },
            { name: "method", type: "varchar", length: "20", isNullable: true },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["userId"],
              referencedTableName: EntityName.User,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true
      );
    }

    // ---------------- Category ----------------
    if (!(await queryRunner.hasTable(EntityName.Category))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.Category,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "title", type: "varchar", length: "100" },
            { name: "priority", type: "int", isNullable: true },
          ],
        }),
        true
      );
    }

    // ---------------- Image ----------------
    if (!(await queryRunner.hasTable(EntityName.Image))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.Image,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "name", type: "varchar", length: "100" },
            { name: "location", type: "varchar", length: "255" },
            { name: "alt", type: "varchar", length: "255" },
            { name: "userId", type: "int" },
            { name: "created_at", type: "timestamp", default: "now()" },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["userId"],
              referencedTableName: EntityName.User,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true
      );
    }

    // ---------------- News ----------------
    if (!(await queryRunner.hasTable(EntityName.News))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.News,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "title", type: "varchar", length: "255" },
            { name: "content", type: "text" },
            { name: "image", type: "varchar", length: "255", isNullable: true },
            { name: "slug", type: "varchar", length: "255", isUnique: true },
            {
              name: "status",
              type: "varchar",
              length: "20",
              default: `'draft'`,
            },
            { name: "authorId", type: "int" },
            { name: "created_at", type: "timestamp", default: "now()" },
            { name: "updated_at", type: "timestamp", default: "now()" },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["authorId"],
              referencedTableName: EntityName.User,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true
      );
    }

    // ---------------- NewsCategory ----------------
    if (!(await queryRunner.hasTable(EntityName.NewsCategory))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.NewsCategory,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "newsId", type: "int" },
            { name: "categoryId", type: "int" },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["newsId"],
              referencedTableName: EntityName.News,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
            new TableForeignKey({
              columnNames: ["categoryId"],
              referencedTableName: EntityName.Category,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true
      );
    }

    // ---------------- NewsLikes ----------------
    if (!(await queryRunner.hasTable(EntityName.NewsLikes))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.NewsLikes,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "newsId", type: "int" },
            { name: "userId", type: "int" },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["newsId"],
              referencedTableName: EntityName.News,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
            new TableForeignKey({
              columnNames: ["userId"],
              referencedTableName: EntityName.User,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true
      );
    }

    // ---------------- NewsBookmark ----------------
    if (!(await queryRunner.hasTable(EntityName.NewsBookmark))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.NewsBookmark,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "newsId", type: "int" },
            { name: "userId", type: "int" },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["newsId"],
              referencedTableName: EntityName.News,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
            new TableForeignKey({
              columnNames: ["userId"],
              referencedTableName: EntityName.User,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true
      );
    }

    // ---------------- NewsComments ----------------
    if (!(await queryRunner.hasTable(EntityName.NewsComments))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.NewsComments,
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "text", type: "text" },
            { name: "accepted", type: "boolean", default: false },
            { name: "newsId", type: "int" },
            { name: "userId", type: "int" },
            { name: "parentId", type: "int", isNullable: true },
            { name: "created_at", type: "timestamp", default: "now()" },
          ],
          foreignKeys: [
            {
              columnNames: ["newsId"],
              referencedTableName: EntityName.News,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
            {
              columnNames: ["userId"],
              referencedTableName: EntityName.User,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
            {
              columnNames: ["parentId"],
              referencedTableName: EntityName.NewsComments,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
          ],
        }),
        true
      );
    }

    // ---------------- NewsTag ----------------
    if (!(await queryRunner.hasTable(EntityName.NewsTag))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.NewsTag,
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment",
            },
            { name: "slug", type: "varchar", length: "100", isUnique: true },
            { name: "title", type: "varchar", length: "100" },
          ],
        }),
        true
      );
    }

    // ---------------- NewsTags (join) ----------------
    if (!(await queryRunner.hasTable(EntityName.NewsTags))) {
      await queryRunner.createTable(
        new Table({
          name: EntityName.NewsTags,
          columns: [
            { name: "newsId", type: "int", isPrimary: true },
            { name: "tagId", type: "int", isPrimary: true },
          ],
          foreignKeys: [
            {
              columnNames: ["newsId"],
              referencedTableName: EntityName.News,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
            {
              columnNames: ["tagId"],
              referencedTableName: EntityName.NewsTag,
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
          ],
          uniques: [{ name: "UQ_news_tag", columnNames: ["newsId", "tagId"] }],
        }),
        true
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      EntityName.NewsTags,
      EntityName.NewsTag,
      EntityName.NewsComments,
      EntityName.NewsBookmark,
      EntityName.NewsLikes,
      EntityName.NewsCategory,
      EntityName.News,
      EntityName.Image,
      EntityName.Profile,
      EntityName.Otp,
      EntityName.Category,
      EntityName.User,
    ];

    for (const t of tables) {
      if (await queryRunner.hasTable(t)) {
        await queryRunner.dropTable(t, true);
      }
    }
  }
}
