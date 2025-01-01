import Elysia, { t } from "elysia";
import { withRequestHandling } from "../utils/request.utils";
import { authPlugin } from "../plugins/auth.plugins";
import { BranchService } from "../services/branch.service";

export const branchController = new Elysia({ prefix: "/branches", tags: ["Branches"] })
    .use(authPlugin)


    .guard(
        {
            isVerifyAuth: true,
            isVerifyRole: ["ADMIN"],
            detail: { description: "คำอธิบาย: ใช้สำหรับ ADMIN เท่านั้น" }
        }, (app) => app
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


    )



    .guard(
        {
            isVerifyAuth: true,
            isVerifyRole: ["ADMIN", "MANAGER"],
            detail: { description: "คำอธิบาย: ใช้สำหรับ ADMIN, MANAGER เท่านั้น" }
        }, (app) => app
            .put("/:id", ({ params, body }) => withRequestHandling(async () =>
            {
                await BranchService.updateBranch(params.id, body);
                return { payload: { data: null } }
            }),
                {
                    params: t.Object({ id: t.String() }),
                    body: t.Object(
                        {
                            name: t.String(),
                            phoneNumber: t.String(),
                            address: t.String()
                        }
                    )
                }
            )
    )

    .guard(
        {
            isVerifyAuth: true,
        }, (app) => app

            .get("/", ({ store: { userJwt } }) => withRequestHandling(async () =>
            {
                const branches = await BranchService.listBranches(userJwt);
                return { payload: { data: branches } }
            }))


            .get("/:id", ({ params }) => withRequestHandling(async () =>
            {
                const branch = await BranchService.getBranchById(params.id);
                return { payload: { data: branch } }
            }), { params: t.Object({ id: t.String() }) })
    )