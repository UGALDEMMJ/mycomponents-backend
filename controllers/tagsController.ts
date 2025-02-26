import { Tags } from "../models/Tags.ts";
import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import {  getClient } from "../config/db.ts";


const addTags = async (ctx: Context) => {
  const body = await ctx.request.body.json();
  const { name } = body;
  const column: string = "name";

  const tagExist = await findTag(name,column);

  if(tagExist){
    ctx.response.status = 400;
    ctx.response.body = { message: "A tag with this name already exist" };
    return;
  }

  try {
    await attempAddTag(body);
    ctx.response.status = 201;
    ctx.response.body = {msg: "The tag has been successfully added"}
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {msg: "An error has ocurred adding the tag", error}
  }
};

//Consulta post
const findTag = async (param:string, column: string): Promise<Tags | null> => {
  let client;
  try {
    client = await getClient();

    if (!client) {
      throw new Error("Database client is no available.");
    }

    const result = await client.queryObject<Tags>(
      `SELECT id, name FROM tags WHERE ${column} = $1 LIMIT 1`,
      [param],
    );

    if (result.rows.length > 0) {
      const dbTag = result.rows[0];
      const tag: Tags = {
        id: dbTag.id,
        name: dbTag.name
      };
      return tag;
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error finding the tag", error);
    return null;
  }finally{
    client?.release();
  }
};

const attempAddTag = async (tagData: Tags)=>{
  let client;  
  try {
        client = await getClient();
        const newTagData = {...tagData};
        await client.queryObject(
            `INSERT INTO tags (name) VALUES ($1)`,
            [
            newTagData.name
            ],
        );
    } catch (error) {
        console.error("Error inserting the tag in the database", error);
        return null;
    }finally{
        console.log("Tag has been successfully added")
        client?.release();
    }   
}

const updateTag = async (ctx:Context) => {
  const body = await ctx.request.body.json();
  const { id } = body;
  const column: string = "id";

  const tagExist = await findTag(id, column);

  if (!tagExist) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Tag not found" };
    return;
  }

  let client;

  try {
    client = await getClient();
    const updateTag ={
      name: body.name || tagExist.name
    } 
    await client.queryObject(
      `UPDATE tags SET name = $1 WHERE id = $2`, 
      [
        updateTag.name,
        id
      ]
    );
    ctx.response.status = 200;
    ctx.response.body = { message: "Tag updated successfully" };
  } catch (error) {
    console.error("Error updating the tag in the database", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error updating tag" };
  }finally{
    client?.release();
  }
};

const deleteTag= async (ctx:Context)=>{

  const body = await ctx.request.body.json();
  const { id } = body;
  const column: string = "id";

  const tagExist = await findTag(id, column);

  if (!tagExist) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Tag not found" };
    return;
  }

  let client;

  try {
    client = await getClient();
    await client.queryObject(
      `DELETE FROM tags WHERE id = $1`, 
      [
        id
      ]
    );
    ctx.response.status = 200;
    ctx.response.body = { message: "Tag deleted successfully" };
  } catch (error) {
    console.error("Error deleting the tag in the database", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error deleting tag" };
  }finally{
    client?.release();
  }
}

const getTags = async (): Promise<Tags[] | null> => {
  let client;
  try {
    client = await getClient();
    const result = await client.queryObject<Tags>(
      `SELECT * FROM tags LIMIT 10`,
    );
    if (result.rows.length > 0) {
      return result.rows.map((dbTag) => ({
        id: dbTag.id,
        name: dbTag.name
      }));
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error finding the tag", error);
    return null;
  } finally {
    client?.release();
  }
};

export { addTags, updateTag, deleteTag, getTags };