import { User } from "../models/User.ts";
import { Context, Next } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { getKey } from "../helpers/generatedJWT.ts";
import { getClient } from "../config/db.ts";

//Cambiar antes del commit

export const checkAuth = async (ctx: Context, next: Next) => {
  let token;
  let client;
  const authHeader = ctx.request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      //Extraer el token del header
      token = authHeader.split(" ")[1];
      
      const secret = await getKey(Deno.env.get("SECRET")??"thsiisasecretvalue");

      //Verificar el token
      if (!secret) {
        throw new Error("SECRET key is not defined in the environment.");
      }

      const decode = await verify(token, secret);
      //Busca el user en la db
      client = await getClient();
      if (!client) {
        throw new Error("Database client is not available.");
      }

      const result = await client.queryObject<User>(
        `SELECT id, email, name, password, created_at, token, confirmed FROM users WHERE id = $1 LIMIT 1`,
        [decode.id],
      );
      if (result.rows.length > 0) {

        const user = result.rows[0];
        ctx.state.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          created_at: user.created_at,
          token: user.token,
          confirmed: user.confirmed,
        };
        return next();
      } else {
        ctx.response.status = 403;
        ctx.response.body = { msg: "User not found or invalid token" };
        return null;
      }
    } catch (error) {
        console.error("Error verifying the token:", error);
        ctx.response.status = 403;
        ctx.response.body = { msg: "Not valid or inexistent token" };
        return;
    }finally{
      client?.release();
    }
  }
   // Si no hay token en el encabezado
   ctx.response.status = 403;
   ctx.response.body = { msg: "Not valid or inexistent token" };
};
