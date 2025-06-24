import bcrypt from "https://deno.land/x/bcryptjs@2.4.3/mod.ts";

export async function hashPassword(normalPassword: string): Promise<string> {
    // bcryptjs es síncrono, pero puedes envolverlo en Promise para mantener la API
    return Promise.resolve(bcrypt.hashSync(normalPassword, 10));
}

export async function verifyPassword(normalPassword: string, hashedPassword: string): Promise<boolean> {
    return Promise.resolve(bcrypt.compareSync(normalPassword, hashedPassword));
}

