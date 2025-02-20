import { load } from "https://deno.land/std/dotenv/mod.ts";
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
    const secretKey = await getKey(env.SECRET);

    return await create(
        {alg: "HS512", typ:"JWT"},
        {id, exp:getNumericDate(60*60*24)},
        secretKey
    )
} 


export { generateJWT}