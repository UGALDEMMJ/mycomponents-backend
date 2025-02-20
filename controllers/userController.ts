import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { RouterContext } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { getClient } from "../config/db.ts";
import { user } from "../models/User.ts";
import { hashPassword } from "../helpers/hashearPassword.ts";
import { disconnectDB } from "../config/db.ts";
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { generateJWT } from "../helpers/generatedJWT.ts";

const signupUser = async (ctx: Context) => {
  const body = await ctx.request.body.json();

  const { email } = body;

  const userExist = await findUser(email);

  if (userExist) {
    ctx.response.status = 400;
    ctx.response.body = { message: "User already exists" };
    return;
  }

  try {
    await attempSignup(body);
    ctx.response.status = 201;
    ctx.response.body = { msg: "The user has been successfully added" };
  } catch (error) {
    ctx.response.status = 500;
    console.error("An error has occur sign up the user", error);
  }
};

//This method find a user in the db depending of the param
const findUser = async (param: string): Promise<user | null> => {
  try {
    const client = getClient();

    if (!client) {
      throw new Error("Database client is not available.");
    }

    const result = await client.queryObject(
      `SELECT email, name, token FROM users WHERE email = $1 LIMIT 1`,
      [param],
    );

    if (result.rows.length > 0) {
      const dbUser = result.rows[0] as user;
      const user: user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        password: dbUser.password,
        created_at: dbUser.created_at,
        token: dbUser.token,
        confirmed: dbUser.confirmed,
      };
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error finding the user", error);
    return null;
  }
};

const attempSignup = async (userData: user) => {
  try {
    const client = getClient();
    const newUser = { ...userData };
    newUser.password = await hashPassword(userData.password);
    newUser.created_at = new Date();
    await client.queryObject(
      `INSERT INTO users (NAME, EMAIL, PASSWORD, TOKEN, CREATED_AT) VALUES ($1,$2,$3,$4,$5)`,
      [
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.token,
        newUser.created_at,
      ],
    );
  } catch (error) {
    console.error("Error inserting the user to the database", error);
    return null;
  } finally {
    console.log("User has been successfully added");

    disconnectDB();
  }
};
//Verifica el usuario
const verifyUser = async (ctx: RouterContext<"/verify/:token">) => {
  const client = getClient();
  const token = ctx.params.token || "";
  console.log("Token recibido:", token);
  const verifyUser = findUser(token);
  if (!verifyUser) {
    ctx.response.status = 400;
    ctx.response.body = { msg: "Token no valid" };
    return;
  }

  try {
    await client.queryObject(
      `
        UPDATE users SET token = NULL, confirmed = TRUE WHERE token = $1
        `,
      [token],
    );

    ctx.response.body = { msg: "User confirmed successfully" };
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { msg: "Inside error in the server" };
  }
};
//Autentica y genera el token
const authUser = async (ctx: Context) => {
  try {
    const body = await ctx.request.body.json();

    const { email, password } = body;

    const user: user | null = await findUser(email);

    if (!user) {
      ctx.response.body = { msg: "User does not exist" };
      ctx.response.status = 403;
    } else {
      const correctPassword = await compare(password, user.password);
      if (!correctPassword) {
        ctx.response.status = 403;
        ctx.response.body = { msg: "The password is incorrect" };
      }

      ctx.response.body = {
        id: user.id,
        name: user.name,
        email: user.email,
        token: await generateJWT(user.id),
      };
    }
  } catch (e) {
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = { msg: "Error in auth process" };
  }
};

// const verifyToken = async(ctx)=>{

// }

export { signupUser, verifyUser, authUser };
