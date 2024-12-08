import { t } from "elysia";
import { baseRouter } from "./base.routes";
import { BranchService } from "../services/branch.service";
import { withRequestHandling } from "../utils/request.utils";

export const branchRouters = baseRouter.group("/branch", { tags: ["Branchs"] }, (app) => app

    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoint POST "/branch/"
        .post("/", ({ body }) => withRequestHandling(async () =>
        {
            const created = await BranchService.createBranch(body);
            return { payload: { data: created }, message: "สร้างสาขาสำเร็จ" }
        }),
            {
                body: t.Object({ name: t.String() })
            }
        )


        // TODO endpoint GET "/branch/"
        .get("/", () => withRequestHandling(async () =>
        {
            const branches = await BranchService.list();
            return { payload: { data: branches } }
        }))


        // TODO endpoint PUT "/branch/:id"
        .put("/:id", ({ params: { id }, body }) => withRequestHandling(async () =>
        {
            const updated = await BranchService.update(id, body)
            return { payload: { data: updated }, message: "เปลี่ยนชื่อสาขาสำเร็จ" }
        }),
            {
                params: t.Object({ id: t.Number() }),
                body: t.Object({ name: t.String() })
            }
        )

    )
);