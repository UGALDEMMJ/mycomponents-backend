import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

let pool: Pool;

async function connectDB() {
    try {
        const poolOptions: {
            user: string;
            password: string;
            hostname: string;
            database: string;
            port: number;
            tls?: { enabled: boolean };
        } = {
            user: Deno.env.get("DB_USER") ?? "",
            password: Deno.env.get("DB_PASSWORD") ?? "",
            hostname: Deno.env.get("DB_HOST") ?? "",
            database: Deno.env.get("DB_NAME") ?? "",
            port: Number(Deno.env.get("DB_PORT") ?? 5432),
        };

        if (
            poolOptions.hostname &&
            !poolOptions.hostname.startsWith("/")
        ) {
            poolOptions.tls = { enabled: true };
        }

        pool = new Pool(poolOptions, 10);
        console.log("Conectado a la db con 10 pools");
    } catch (error) {
        console.log("Unable to connect to databse: " + error);
    }
}

async function getClient(){
    if(!pool){
        throw new Error("The databse is not connected")
    }
    return await pool.connect();
}

// Función para cerrar la conexión (opcional, pero útil)
async function disconnectDB() {
    if(pool){
        await pool.end();
        console.log("Pool of conection closed")
    }
}

export { connectDB, getClient, disconnectDB };