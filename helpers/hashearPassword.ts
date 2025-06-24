import * as _bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export async function hashPassword(normalPassword: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalPassword);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(normalPassword: string, hashedPassword: string): Promise<boolean> {
    const hash = await hashPassword(normalPassword);
    return hash === hashedPassword;
}

