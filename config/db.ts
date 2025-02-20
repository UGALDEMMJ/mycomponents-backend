import { Client } from "https://deno.land/x/postgres/mod.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

let clientGLOBAL:Client;

async function connectDB() {

    const env = await load();

    try {
        const client = new Client ({
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            hostname: env.DB_HOST,
            port: env.DB_PORT,
            database: env.DB_NAME
        });
        //Conectar a la db
        clientGLOBAL = client;
        await client.connect();
        const result = await client.queryObject("SELECT * FROM users");
        console.log(result.rows);
    } catch (error) {
        console.log("Unable to connect to databse: " + error);
        Deno.exit(1);
    }
}

function getClient(){
    if(!clientGLOBAL){
        throw new Error("DataBase not connected")
    }
    return clientGLOBAL;
}

// Función para cerrar la conexión (opcional, pero útil)
async function disconnectDB() {
    if (clientGLOBAL) {
        await clientGLOBAL.end();
        console.log("Conexión a la base de datos cerrada.");
    }
}

export { connectDB, getClient, disconnectDB };