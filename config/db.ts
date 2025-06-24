import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";


let pool: Pool;

async function connectDB() {

    const env = await load();

    try {
        const poolOptions: {
            user: string;
            password: string;
            hostname: string;
            database: string;
            port: number;
            tls?: { enabled: boolean };
        } = {
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            hostname: env.DB_HOST,
            database: env.DB_NAME,
            port: Number(env.DB_PORT),
        };

        // Solo agrega TLS si no es un socket
        if (
            env.DB_HOST &&
            !env.DB_HOST.startsWith("/") // No es un socket
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