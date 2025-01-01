type JwtPayload =
    {
        id: string;
        username: string;
        email: string;
        role: string;
        branchId: string | null
    }