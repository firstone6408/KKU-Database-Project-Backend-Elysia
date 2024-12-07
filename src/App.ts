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
import { productRouters } from "./routes/product.routes";
import { stockRouters } from "./routes/stock.routes";
import { stockHistoryRouters } from "./routes/stock-history.routes";
import { orderRouters } from "./routes/order.routes";

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
      .use(cors(
        {
          origin: ["http://localhost:3001"],
        }
      ))
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
        // console.log(error instanceof HttpError)
        // console.log(error)
        switch (code)
        {
          case "HttpError":
            return globalErrorHandler(error, set);
          default:
            return globalErrorHandler(error, set);
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
                { name: "Users", description: "จุดเชื่อมต่อเกี่ยวกับการจัดการผู้ใช้ เช่น การสมัครสมาชิก, การอัปเดตข้อมูลผู้ใช้" },
                { name: "Authen", description: "จุดเชื่อมต่อที่เกี่ยวข้องกับการยืนยันตัวตน เช่น การล็อกอิน, การลงทะเบียน, การรีเซ็ตรหัสผ่าน" },
                { name: "Branchs", description: "จุดเชื่อมต่อที่เกี่ยวกับการจัดการสาขา เช่น การเพิ่ม, แก้ไข หรือ ลบสาขา" },
                { name: "Categories", description: "จุดเชื่อมต่อที่เกี่ยวข้องกับการจัดการหมวดหมู่สินค้า เช่น การเพิ่ม, แก้ไข หรือ ลบหมวดหมู่" },
                { name: "Products", description: "จุดเชื่อมต่อที่เกี่ยวกับการจัดการสินค้า เช่น การเพิ่ม, แก้ไข, หรือ ลบสินค้า" },
                { name: "Stocks", description: "จุดเชื่อมต่อที่เกี่ยวข้องกับการจัดการสินค้าคงคลัง เช่น การเพิ่ม, ลด หรือ ปรับปรุงจำนวนสินค้าในคลัง" },
                { name: "Stock Histories", description: "จุดเชื่อมต่อที่เกี่ยวกับประวัติการเปลี่ยนแปลงสินค้าคงคลัง เช่น การเพิ่มหรือการลดสินค้า" },
                { name: "Orders", description: "จุดเชื่อมต่อที่เกี่ยวกับการจัดการคำสั่งซื้อ เช่น การสร้าง, อัปเดต หรือ ยกเลิกคำสั่งซื้อ" }
              ],
          },
        })
    );
  }

  private initRouters()
  {
    this.app.group("/api", (app) => app
      .get("/", () =>
      {
        return { message: "Hello Nextjs from Elysia!" }
      })
      .use(userRouters)
      .use(authRouters)
      .use(branchRouters)
      .use(cateroryRouters)
      .use(productRouters)
      .use(stockRouters)
      .use(stockHistoryRouters)
      .use(orderRouters)
    )
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
