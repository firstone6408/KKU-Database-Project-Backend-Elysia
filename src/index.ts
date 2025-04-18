/** @format */

import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import Elysia from "elysia";
import {
  HttpError,
  globalErrorHandler,
} from "./middlewares/error.middleware";
import swagger from "@elysiajs/swagger";
import { authController } from "./controllers/auth.controller";
import { branchController } from "./controllers/branch.controller";
import { userController } from "./controllers/user.controller";
import { kkuDB } from "./database/prisma/kku.prisma";
import { categoryController } from "./controllers/category.controller";
import { customerGroupCotroller } from "./controllers/customer-group.controller";
import { customerController } from "./controllers/customer.controller";
import { productController } from "./controllers/product.controller";
import { stockController } from "./controllers/stock.controller";
import { productSaleBranchController } from "./controllers/product-sale-branch.controller";
import { paymentMethodController } from "./controllers/payment-method.controller";
import { orderController } from "./controllers/order.controller";
import { stockHistoryController } from "./controllers/stock-history.controller";
import { deliveryController } from "./controllers/delivery.controller";

const app = new Elysia({
  serve: {
    idleTimeout: 30,
  },
})
  //
  // Middleware
  //
  .use(
    cors({
      origin: ["http://localhost:3000"],
    })
  )
  .use(staticPlugin())
  .onAfterResponse(({ set, headers, path }) => {
    // console.log("set:", set);
    // console.log("headers:", headers);
    //console.log(path);
    console.log(
      ` - Request: [${set.headers["access-control-allow-methods"]}] "http://${headers["host"]}${path}" From "${headers["referer"]}" | Status: ${set.status} | Platform: ${headers["sec-ch-ua-platform"]}`
    );
  })

  //
  // Global error handler
  //
  .error({ HttpError, Error })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "HttpError":
        return globalErrorHandler(error, set);
      default:
        return globalErrorHandler(error, set);
    }
  })

  //
  // Swagger
  //
  .use(
    swagger({
      documentation: {
        info: {
          title: "Database backend document",
          version: "1.0.0",
        },
        tags: [
          { name: "Tests" },
          {
            name: "Users",
            description:
              "จุดเชื่อมต่อเกี่ยวกับการจัดการผู้ใช้ เช่น การสมัครสมาชิก, การอัปเดตข้อมูลผู้ใช้",
          },
          {
            name: "Authen",
            description:
              "จุดเชื่อมต่อที่เกี่ยวข้องกับการยืนยันตัวตน เช่น การล็อกอิน, การลงทะเบียน, การรีเซ็ตรหัสผ่าน",
          },
          {
            name: "Branches",
            description:
              "จุดเชื่อมต่อที่เกี่ยวกับการจัดการสาขา เช่น การเพิ่ม, แก้ไข หรือ ลบสาขา",
          },
          {
            name: "Categories",
            description:
              "จุดเชื่อมต่อที่เกี่ยวข้องกับการจัดการหมวดหมู่สินค้า เช่น การเพิ่ม, แก้ไข หรือ ลบหมวดหมู่",
          },
          {
            name: "Products",
            description:
              "จุดเชื่อมต่อที่เกี่ยวกับการจัดการสินค้า เช่น การเพิ่ม, แก้ไข, หรือ ลบสินค้า",
          },
          { name: "ProductSaleBranches", description: "" },
          {
            name: "Stocks",
            description:
              "จุดเชื่อมต่อที่เกี่ยวข้องกับการจัดการสินค้าคงคลัง เช่น การเพิ่ม, ลด หรือ ปรับปรุงจำนวนสินค้าในคลัง",
          },
          {
            name: "Stock Histories",
            description:
              "จุดเชื่อมต่อที่เกี่ยวกับประวัติการเปลี่ยนแปลงสินค้าคงคลัง เช่น การเพิ่มหรือการลดสินค้า",
          },
          { name: "PaymentMethods", description: "" },
          {
            name: "Orders",
            description:
              "จุดเชื่อมต่อที่เกี่ยวกับการจัดการคำสั่งซื้อ เช่น การสร้าง, อัปเดต หรือ ยกเลิกคำสั่งซื้อ",
          },
          {
            name: "Deliveries",
            description: "การขนส่ง",
          },
          { name: "CustomerGroups", description: "กลุ่มลูกค้า" },
          { name: "Customers", description: "ลูกค้า" },
        ],
      },
    })
  )

  //
  // Init Routers from Controllers
  //
  .group("/api", (app) =>
    app
      .get("/", () => {
        return { message: "Hello Nextjs from Elysia!" };
      })
      .use(userController)
      .use(authController)
      .use(branchController)
      .use(categoryController)
      .use(customerGroupCotroller)
      .use(customerController)
      .use(productController)
      .use(stockController)
      .use(productSaleBranchController)
      .use(paymentMethodController)
      .use(orderController)
      .use(stockHistoryController)
      .use(deliveryController)
  )

  // Start on port
  .listen(5000);

//
// Test Connect Database
//
const db = kkuDB;

try {
  await db.testConnection();

  console.log(
    `[Server: ${app.server?.hostname}] Database connected successfully`
  );
} catch (error) {
  console.error(
    `[Server: ${
      app.server?.hostname
    }] Database connection failed: ${String(error)}`
  );
  process.exit(1);
}

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

process.on("SIGINT", async () => {
  await db.disconnect();
  console.log(`[Server: ${app.server?.hostname}] Database disconnected`);
  process.exit(0);
});
