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
    const result = await client.queryObject<{ id: string }>(
      `INSERT INTO components (user_id, category_id, name, description, code, created_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [
        newPostData.user_id,
        newPostData.category_id,
        newPostData.name,
        newPostData.description,
        newPostData.code,
        newPostData.created_at,
      ],
    );

    if (result.rows.length > 0) {
      const newComponentId = result.rows[0].id;
      if (Array.isArray(postData.tags)) {
        for (const tagId of postData.tags) {
          await client.queryObject(
            `INSERT INTO component_tags (component_id, tag_id) VALUES ($1, $2)`,
            [newComponentId, tagId],
          );
        }
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error inserting the post in the database", error);
    return null;
  } finally {
    console.log("Post has been successfully added");
    client?.release();
  }
};

const updatePost = async (ctx: RouterContext<"/:id">) => {
  let client;
  try {
    const body = await ctx.request.body.json();
    client = await getClient();
    // 1. Actualiza el componente (NO lo elimines)
    await client.queryObject(
      `UPDATE components SET category_id = $1, name = $2, description = $3, code = $4 WHERE id = $5`,
      [
        body.category_id,
        body.name,
        body.description,
        body.code,
        body.id,
      ],
    );

    // 2. Elimina relaciones viejas de tags
    await client.queryObject(
      `DELETE FROM component_tags WHERE component_id = $1`,
      [body.id],
    );

    // 3. Inserta nuevas relaciones de tags
    if (Array.isArray(body.tags)) {
      for (const tagId of body.tags) {
        await client.queryObject(
          `INSERT INTO component_tags (component_id, tag_id) VALUES ($1, $2)`,
          [body.id, tagId],
        );
      }
    }

    ctx.response.status = 200;
    ctx.response.body = { msg: "Component updated successfully" };
  } catch (error) {
    console.error("Error updating the component", error);
    ctx.response.status = 500;
    ctx.response.body = { msg: "Error updating component" };
  } finally {
    client?.release();
  }
};

const deletePost = async (ctx: RouterContext<"/:id">) => {
  let client;
  try {
    const body = await ctx.request.body.json();
    console.log(body)
    const { idPost } = body;
    client = await getClient();

    // Elimina el componente
    await client.queryObject(
      `DELETE FROM components WHERE id = $1`,
      [idPost]
    );

    ctx.response.status = 200;
    ctx.response.body = { msg: "Component deleted successfully" };
  } catch (error) {
    console.error("Error deleting the component", error);
    ctx.response.status = 500;
    ctx.response.body = { msg: "Error deleting component" };
  } finally {
    client?.release();
  }
};

const getComponents = async (ctx: Context) => {
  let client;
  try {
    client = await getClient();

    const result = await client.queryObject<{
      id: number;
      user_id: number;
      category_id: number;
      name: string;
      description: string;
      code: string;
      created_at: string;
      tags: { id: number; name: string }[];
    }>(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) AS tags
      FROM components c
      LEFT JOIN component_tags ct ON c.id = ct.component_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    ctx.response.status = 200;
    ctx.response.body = result.rows;
  } catch (error) {
    console.error("Error fetching components:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to fetch components" };
  } finally {
    client?.release();
  }
};

const incrementComponentClicks = async (ctx: RouterContext<"/clicks/:id">) => {
  const componentId = ctx.params.id;
  let client;

  if (!componentId) {
    ctx.response.status = 400;
    ctx.response.body = { msg: "Component ID is required" };
    return;
  }

  try {
    client = await getClient();

    await client.queryObject(
      `UPDATE components SET clicks = COALESCE(clicks, 0) + 1 WHERE id = $1`,
      [componentId],
    );

    ctx.response.status = 200;
    ctx.response.body = { msg: "Click fetched succesfully" };
  } catch (error) {
    console.error("Error fetching clicks", error);
    ctx.response.status = 500;
    ctx.response.body = { msg: "Error fetching clicks" };
  } finally {
    client?.release();
  }
};

export { addComponents, deletePost, getComponents, updatePost, incrementComponentClicks };
