import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export async function hashPassword(normalPassword:string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(normalPassword, salt);
    return hash;
}

export async function verifyPassword(normalPassword:string, hashedPassword:string): Promise<boolean> {
    return await bcrypt.compare(normalPassword, hashedPassword);
}

