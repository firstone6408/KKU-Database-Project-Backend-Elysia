import { t } from "elysia";
import { baseRouter } from "./base.routes";
import { BranchService } from "../services/branch.service";

export const branchRouters = baseRouter.group("/branch", { tags: ["Branchs"] }, (app) => app

    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoint POST "/branch/"
        .post("/", ({ withRequestHandling, set, body }) => 
        {
            return withRequestHandling({ set }, async () =>
            {
                const created = await BranchService.createBranch(body);
                return { payload: { data: created }, message: "สร้างสาขาสำเร็จ" }
            })
        },
            {
                body: t.Object({ name: t.String() })
            }
        )


        // TODO endpoint GET "/branch/"
        .get("/", ({ withRequestHandling, set }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const branches = await BranchService.list();
                return { payload: { data: branches } }
            })
        })


        // TODO endpoint PUT "/branch/:id"
        .put("/:id", ({ withRequestHandling, set, params: { id }, body }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const updated = await BranchService.update(id, body)
                return { payload: { data: updated }, message: "เปลี่ยนชื่อสาขาสำเร็จ" }
            })
        },
            {
                params: t.Object({ id: t.Number() }),
                body: t.Object({ name: t.String() })
            }
        )

    )
);