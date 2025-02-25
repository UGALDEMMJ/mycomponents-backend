import { Component } from "../models/Component.ts";
import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { getClient } from "../config/db.ts";


const addComponents = async (ctx: Context) => {
  const body = await ctx.request.body.json();
  const { name } = body;

  const postExist = await findPost(name);

  if(postExist){
    ctx.response.status = 400;
    ctx.response.body = { message: "A post with this name already exist" };
    return;
  }

  try {
    await attempAddPost(body,ctx);
    ctx.response.status = 201;
    ctx.response.body = {msg: "The post has been successfully added"}
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {msg: "An error has ocurred adding the post", error}
  }
};

//Consulta post
const findPost = async (name: string): Promise<Component | null> => {
 let client;
  try {
    client = await getClient();

    if (!client) {
      throw new Error("Database client is no available.");
    }

    const result = await client.queryObject<Component>(
      `SELECT id, user_id, category_id, name, description, code, created_at FROM components WHERE name = $1 LIMIT 1`,
      [name],
    );

    if (result.rows.length > 0) {
      const dbComponent = result.rows[0];
      const component: Component = {
        id: dbComponent.id,
        user_id: dbComponent.user_id,
        category_id: dbComponent.category_id,
        name: dbComponent.name,
        description: dbComponent.description,
        code: dbComponent.code,
        created_at: dbComponent.created_at,
      };
      return component;
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error finding the component", error);
    return null;
  }finally{
    client?.release();
  }
};

const attempAddPost = async (postData: Component, ctx:Context)=>{
  let client;  
  try {
        const userInfo = ctx.state.user;
        client = await getClient();
        const newPostData = {...postData,user_id:userInfo.id, created_at:new Date()};
        await client.queryObject(
            `INSERT INTO components (user_id, category_id, name, description, code, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
            [
            newPostData.user_id,
            newPostData.category_id,
            newPostData.name,
            newPostData.description,
            newPostData.code,
            newPostData.created_at
            ],
        );
    } catch (error) {
        console.error("Error inserting the post in the database", error);
        return null;
    }finally{
        console.log("Post has been successfully added")
        client?.release();
    }   
}

export { addComponents };
