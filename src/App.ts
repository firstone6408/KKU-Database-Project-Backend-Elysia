import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { kkuDB as db } from "./database/prisma/kku.prisma";
import { verifyAuth } from "./middlewares/auth.middleware";
import { userController } from "./controllers/user.controller";
import {
  globalErrorHandler,
  HttpError,
} from "./middlewares/error.middleware";

export class ElysiaServer {
  private readonly app: Elysia;

  constructor() {
    this.app = new Elysia();

    this.init();
  }

  private async init() {
    await this.connectDatabase();

    this.initConfig();
    this.initMiddlewares();
    this.initSwagger();
    this.initRouters();
  }

  private async connectDatabase() {
    try {
      await db.testConnection();

      console.log(
        `[Server: ${this.app.server?.hostname}] Database connected successfully`
      );
    } catch (error) {
      console.error(
        `[Server: ${
          this.app.server?.hostname
        }] Database connection failed: ${String(error)}`
      );
      process.exit(1);
    }
  }

  private initConfig() {}

  private initMiddlewares() {
    this.app
      .use(cors())
      .use(staticPlugin())
      .onAfterResponse(({ set, path, headers }) => {
        console.log(
          ` - Request: [${set.headers["access-control-allow-methods"]}] "${headers["referer"]}" | ${set.status} | Platform: ${headers["sec-ch-ua-platform"]}`
        );
      })
      .error({ HttpError, Error })
      .onError(({ code, error, set }) => {
        switch (code) {
          case "HttpError":
            return globalErrorHandler(error, set);
          case "Error":
            return globalErrorHandler(error, set);
          default:
            return globalErrorHandler(error.name, set);
        }
      })
      .state({
        user: {},
      })
      .post("/", async ({ store }) => {
        store.user;
      });
  }

  private initSwagger() {
    this.app.use(
      swagger({
        documentation: {
          tags: [
            { name: "Tests", description: "Test related endpoints" },
            { name: "Users", description: "User related endpoints" },
            {
              name: "Authen",
              description: "Authenication related endpoints",
            },
          ],
        },
      })
    );
  }

  private initRouters() {
    this.app.group("/api", (app) =>
      app
        //
        // Tests
        //
        .group(
          "/tests",
          { tags: ["Test"], beforeHandle: verifyAuth },
          (app) =>
            app
              .get("/auth", () => {
                return { message: "Hello Authentication" };
              })
              .get("", () => {
                return { message: "Hello Test 123" };
              })
        )
        .group("/auth", { tags: ["Authen"] }, (app) =>
          app.post("/login", () => {
            return "Authenication";
          })
        )
        //
        // Users
        //
        .group("/users", { tags: ["Users"] }, (app) =>
          app
            .get("", userController.list)
            .get("/:id", userController.getById)
            .post("", userController.create)
            .put("/:id", userController.update)
            .delete("/:id", userController.remove)
        )
    );
  }

  public start(port: number) {
    this.app.listen(port);
    console.log(
      `🦊 Elysia is running at ${this.app.server?.hostname}:${this.app.server?.port}`
    );

    process.on("SIGINT", async () => {
      await db.disconnect();
      console.log(
        `[Server: ${this.app.server?.hostname}] Database disconnected`
      );
      process.exit(0);
    });
  }
}
