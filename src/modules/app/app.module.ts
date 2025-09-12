import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { TypeOrmConfig } from "src/config/typeorm.config";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { CategoryModule } from "../category/category.module";
import { NewsModule } from "../news/news.module";
import { ImageModule } from "../image/image.module";
import { CustomHttpModule } from "../http/http.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { DataSource } from "typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 3 }]),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    AuthModule,
    UserModule,
    CategoryModule,
    NewsModule,
    ImageModule,
    CustomHttpModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    const { host, database } = this.dataSource.options as {
      host?: string;
      database?: string;
    };
    if (this.dataSource.isInitialized) {
      console.log("✅ Database connected");
    } else {
      console.log("❌ Database is not initialized");
    }
  }
}
