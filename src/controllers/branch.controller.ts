import Elysia, { t } from "elysia";
import { withRequestHandling } from "../utils/request.utils";
import { authPlugin } from "../plugins/auth.plugins";
import { BranchService } from "../services/branch.service";

export const branchController = new Elysia({ prefix: "/branches", tags: ["Branches"] })
    .use(authPlugin)

    //
    // verify auth, role: "ADMIN"
    //
    .guard({ isVerifyAuth: true, isVerifyRole: ["ADMIN"] }, (app) => app
        .post("/", ({ body, set }) => withRequestHandling(async () => 
        {
            await BranchService.createBranch(body);
            set.status = "Created"
            return { payload: { data: null }, message: "สร้างสาขาสำเร็จ" }
        }),
            {
                body: t.Object(
                    {
                        branchCode: t.String({ minLength: 1 }),
                        name: t.String({ minLength: 1 }),
                        phoneNumber: t.String({ minLength: 1 }),
                        address: t.String({ minLength: 1 })
                    }
                )
            }
        )

        .get("/", () => withRequestHandling(async () =>
        {
            const branches = await BranchService.listBranches();
            return { payload: { data: branches } }
        }))

    )


    //
    // verify auth, role: "ADMIN", "MANAGER"
    //
    .guard({ isVerifyAuth: true, isVerifyRole: ["ADMIN", "MANAGER"] }, (app) => app
        .put("/:id", ({ params, body }) => withRequestHandling(async () =>
        {
            await BranchService.updateBranch(params.id, body);
            return { payload: { data: null } }
        }),
            {
                params: t.Object({ id: t.Number() }),
                body: t.Object(
                    {
                        name: t.String(),
                        phoneNumber: t.String(),
                        address: t.String()
                    }
                )
            })
    )