import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { kkuDB as db } from "./database/prisma/kku.prisma";
import
{
  globalErrorHandler,
  HttpError,
} from "./middlewares/error.middleware";
import { userRouters } from "./routes/user.routes";
import { authRouters } from "./routes/auth.routes";
import { branchRouters } from "./routes/branch.routes";
import { cateroryRouters } from "./routes/category.routes";

export class ElysiaServer
{
  private readonly app: Elysia;

  constructor()
  {
    this.app = new Elysia();

    this.init();
  }

  private async init()
  {
    await this.connectDatabase();

    this.initConfig();
    this.initMiddlewares();
    this.initSwagger();
    this.initRouters();
  }

  private async connectDatabase()
  {
    try
    {
      await db.testConnection();

      console.log(
        `[Server: ${this.app.server?.hostname}] Database connected successfully`
      );
    } catch (error)
    {
      console.error(
        `[Server: ${this.app.server?.hostname
        }] Database connection failed: ${String(error)}`
      );
      process.exit(1);
    }
  }

  private initConfig() { }

  private initMiddlewares()
  {
    this.app
      .use(cors())
      .use(staticPlugin())
      .onAfterResponse(({ set, headers }) =>
      {
        console.log(
          ` - Request: [${set.headers["access-control-allow-methods"]}] "${headers["referer"]}" | ${set.status} | Platform: ${headers["sec-ch-ua-platform"]}`
        );
      })
      .error({ HttpError, Error })
      .onError(({ code, error, set }) =>
      {
        switch (code)
        {
          case "HttpError":
            return globalErrorHandler(error, set);
          case "Error":
            return globalErrorHandler(error, set);
          default:
            return globalErrorHandler(error.name, set);
        }
      })
  }

  private initSwagger()
  {
    this.app.use(
      swagger(
        {
          documentation:
          {
            info:
            {
              title: "Database backend document",
              version: "1.0.0"
            },
            tags:
              [
                { name: "Tests", description: "ทดสอบ" },
                { name: "Users", description: "User related endpoints" },
                { name: "Authen", description: "Authenication related endpoints", },
                { name: "Branchs", description: "Branch related endpoints" },
                { name: "Categories", description: "Category related endpoints" },
              ],
          },
        })
    );
  }

  private initRouters()
  {
    this.app
      .use(userRouters)
      .use(authRouters)
      .use(branchRouters)
      .use(cateroryRouters)
  }

  public start(port: number)
  {
    this.app.listen(port);
    console.log(
      `🦊 Elysia is running at ${this.app.server?.hostname}:${this.app.server?.port}`
    );

    process.on("SIGINT", async () =>
    {
      await db.disconnect();
      console.log(`[Server: ${this.app.server?.hostname}] Database disconnected`);
      process.exit(0);
    });
  }
}
