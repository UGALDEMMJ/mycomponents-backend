import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import {create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

async function getKey(secret:string):Promise<CryptoKey> {
    const encoder = new TextEncoder();
    return await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {name: "HMAC", hash: "SHA-512"},
        false,
        ["sign", "verify"]
    );
}



const  generateJWT = async (id:string) => {

    const env = await load();
    if (!env.SECRET) {
        throw new Error("SECRET key is not defined in the environment.");
    }
    const secretKey = await getKey(env.SECRET);

    return await create(
        {alg: "HS512", typ:"JWT"},
        {id, exp:getNumericDate(60*60*24)},
        secretKey
    )
} 


export { generateJWT, getKey}