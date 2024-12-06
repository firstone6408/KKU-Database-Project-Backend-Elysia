import { JWTPayloadSpec } from "@elysiajs/jwt";

export interface Jwt {
    readonly sign: (morePayload: Record<string, string | number> & JWTPayloadSpec) => Promise<string>;
    readonly verify: (jwt?: string) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
}