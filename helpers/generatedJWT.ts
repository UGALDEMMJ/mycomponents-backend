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

    if (!Deno.env.get("SECRET")) {
        throw new Error("SECRET key is not defined in the environment.");
    }
    const secretKey = await getKey(Deno.env.get("SECRET")??"");

    return await create(
        {alg: "HS512", typ:"JWT"},
        {id, exp:getNumericDate(60*60*24)},
        secretKey
    )
} 


export { generateJWT, getKey}