import { Component } from "../models/Component.ts";
import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { getClient } from "../config/db.ts";
import { RouterContext } from "https://deno.land/x/oak@v17.1.4/mod.ts";

const addComponents = async (ctx: Context) => {
  const body = await ctx.request.body.json();
  const { name } = body;
  const column: string = "name";

  const postExist = await findPost(name, column);

  if (postExist) {
    ctx.response.status = 400;
    ctx.response.body = { message: "A post with this name already exist" };
    return;
  }

  try {
    await attempAddPost(body, ctx);
    ctx.response.status = 201;
    ctx.response.body = { msg: "The post has been successfully added" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { msg: "An error has ocurred adding the post", error };
  }
};

//Consulta post
const findPost = async (
  param: string,
  column: string,
): Promise<Component | null> => {
  let client;
  try {
    client = await getClient();

    if (!client) {
      throw new Error("Database client is no available.");
    }

    const result = await client.queryObject<Component>(
      `SELECT id, user_id, category_id, name, description, code, created_at FROM components WHERE ${column} = $1 LIMIT 1`,
      [param],
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
  } finally {
    client?.release();
  }
};

const attempAddPost = async (postData: Component, ctx: Context) => {
  let client;
  try {
    const userInfo = ctx.state.user;
    client = await getClient();
    const newPostData = {
      ...postData,
      user_id: userInfo.id,
      created_at: new Date(),
    };
    await client.queryObject(
      `INSERT INTO components (user_id, category_id, name, description, code, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        newPostData.user_id,
        newPostData.category_id,
        newPostData.name,
        newPostData.description,
        newPostData.code,
        newPostData.created_at,
      ],
    );
  } catch (error) {
    console.error("Error inserting the post in the database", error);
    return null;
  } finally {
    console.log("Post has been successfully added");
    client?.release();
  }
};

const updatePost = async (ctx: RouterContext<"/:id">) => {
  const userSessionId = ctx.params.id || "";
  const body = await ctx.request.body.json();
  const { id } = body;
  const column: string = "id";

  const postExist = await findPost(id, column);

  if (!postExist) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Post not found" };
    return;
  }
  console.log(userSessionId);
  console.log(postExist.user_id);
  if (userSessionId === postExist.user_id) {
    let client;

    try {
      client = await getClient();
      const updatePost = {
        name: body.name || postExist.name,
        category_id: body.category_id || postExist.category_id,
        description: body.description || postExist.description,
        code: body.code || postExist.code,
        created_at: body.created_at || postExist.created_at,
      };
      await client.queryObject(
        `UPDATE components SET name = $1, category_id = $2, description = $3, code = $4, created_at = $5  WHERE id = $6`,
        [
          updatePost.name,
          updatePost.category_id,
          updatePost.description,
          updatePost.code,
          updatePost.created_at,
          id,
        ],
      );
      ctx.response.status = 200;
      ctx.response.body = { message: "Post updated successfully" };
    } catch (error) {
      console.error("Error updating the post in the database", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Error updating post" };
    } finally {
      client?.release();
    }
  } else {
    return ctx.response.body = { msg: "Invalid action" };
  }
};

const deletePost = async (ctx: RouterContext<"/:id">) => {
  const userSessionId = ctx.params.id || "";
  const body = await ctx.request.body.json();
  const { id } = body;
  const column: string = "id";

  const postExist = await findPost(id, column);

  if (!postExist) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Post not found" };
    return;
  }
  console.log(userSessionId);
  console.log(postExist.user_id);
  let client;
  if (userSessionId === postExist.user_id) {
    try {
      client = await getClient();
      await client.queryObject(
        `DELETE FROM components WHERE id = $1`,
        [
          id,
        ],
      );
      ctx.response.status = 200;
      ctx.response.body = { message: "Post deleted successfully" };
    } catch (error) {
      console.error("Error deleting the post in the database", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Error deleting post" };
    } finally {
      client?.release();
    }
  }
};

const getComponents = async (): Promise<Component[] | null> => {
  let client;
  try {
    client = await getClient();
    const result = await client.queryObject<Component>(
      `SELECT * FROM components LIMIT 10`,
    );
    if (result.rows.length > 0) {
      return result.rows.map((dbComponent) => ({
        id: dbComponent.id,
        user_id: dbComponent.user_id,
        category_id: dbComponent.category_id,
        name: dbComponent.name,
        description: dbComponent.description,
        code: dbComponent.code,
        created_at: dbComponent.created_at,
      }));
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error finding the post", error);
    return null;
  } finally {
    client?.release();
  }
};

export { addComponents, deletePost, getComponents, updatePost };
