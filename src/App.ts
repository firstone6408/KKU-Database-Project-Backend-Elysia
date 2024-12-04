import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { database as db } from "./database/connect.db";
import { verifyAuth } from "./middlewares/auth.middleware";
import { userController } from "./controllers/users.controller";
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

      // create table
      await db.createTableIfNotExist();

      // migrations
      await db.migrations();

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
      .onAfterResponse(({ set, path }) => {
        console.info(
          ` - Status: [${set.headers["access-control-allow-methods"]}] "${path}" | ${set.status}`
        );
      })
      .error({ HttpError })
      .onError(({ code, error, set }) => {
        switch (code) {
          case "HttpError":
            return globalErrorHandler(error, set);
        }
      });
  }

  private initSwagger() {
    this.app.use(
      swagger({
        documentation: {
          tags: [
            { name: "Tests", description: "Test related endpoints" },
            { name: "Users", description: "User related endpoints" },
          ],
        },
      })
    );
  }

  private initRouters() {
    this.app
      .group("/api", (app) =>
        //
        // Tests
        //
        app.group(
          "/tests",
          { tags: ["Test"], beforeHandle: verifyAuth },
          (app) =>
            app
              .get("/auth", () => {
                throw new HttpError(404, "test123", "error");
                return { message: "Hello Authentication" };
              })
              .get("", () => {
                return { message: "Hello Test 123" };
              })
        )
      )
      .group("/users", { tags: ["Users"] }, (app) =>
        app.post("", userController.create).get("", userController.list)
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
