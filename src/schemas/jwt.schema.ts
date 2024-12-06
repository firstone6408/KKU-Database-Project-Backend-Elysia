type JwtPayload = {
    id: number;
    username: string;
    email: string;
    role: string;
    branchId: number | null
}