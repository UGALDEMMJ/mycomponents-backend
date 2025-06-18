import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { getClient } from "../config/db.ts";
import { Category } from "../models/Category.ts";

const addCategories = async (ctx: Context) => {
  const body = await ctx.request.body.json();
  const { name } = body;
  const column: string = "name";

  const categoryExist = await findCategory(name, column);

  if (categoryExist) {
    ctx.response.status = 400;
    ctx.response.body = { message: "A category with this name already exist" };
    return;
  }

  try {
    await attempAddCategory(body);
    ctx.response.status = 201;
    ctx.response.body = { msg: "The category has been successfully added" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { msg: "An error has ocurred adding the post", error };
  }
};

//Consulta post primero necesito el parametro a buscar y luego la row
const findCategory = async (
  param: string,
  column: string,
): Promise<Category | null> => {
  let client;
  try {
    client = await getClient();

    if (!client) {
      throw new Error("Database client is no available.");
    }

    const result = await client.queryObject<Category>(
      `SELECT id, name, created_at FROM categories WHERE ${column} = $1 LIMIT 1`,
      [param],
    );

    if (result.rows.length > 0) {
      const dbCategory = result.rows[0];
      const category: Category = {
        id: dbCategory.id,
        name: dbCategory.name,
        created_at: dbCategory.created_at,
      };
      return category;
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error finding the category", error);
    return null;
  } finally {
    client?.release();
  }
};

const attempAddCategory = async (categoryData: Category) => {
  let client;
  try {
    client = await getClient();
    const newCategoryData = { ...categoryData, created_at: new Date() };
    await client.queryObject(
      `INSERT INTO categories (name, created_at) VALUES ($1,$2)`,
      [
        newCategoryData.name,
        newCategoryData.created_at,
      ],
    );
  } catch (error) {
    console.error("Error inserting the category in the database", error);
    return null;
  } finally {
    console.log("Category has been successfully added");
    client?.release();
  }
};

const updateCategory = async (ctx: Context) => {
  const body = await ctx.request.body.json();
  const { id } = body;
  const column: string = "id";

  const categoryExist = await findCategory(id, column);

  if (!categoryExist) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Category not found" };
    return;
  }

  let client;

  try {
    client = await getClient();
    const updateCategory = {
      name: body.name || categoryExist.name,
      created_at: body.created_at || categoryExist.created_at,
    };
    await client.queryObject(
      `UPDATE categories SET name = $1, created_at = $2 WHERE id = $3`,
      [
        updateCategory.name,
        updateCategory.created_at,
        id,
      ],
    );
    ctx.response.status = 200;
    ctx.response.body = { message: "Category updated successfully" };
  } catch (error) {
    console.error("Error updating the category in the database", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error updating category" };
  } finally {
    client?.release();
  }
};

const deleteCategory = async (ctx: Context) => {
  const body = await ctx.request.body.json();
  const { id } = body;
  const column: string = "id";

  const categoryExist = await findCategory(id, column);

  if (!categoryExist) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Category not found" };
    return;
  }

  let client;

  try {
    client = await getClient();
    await client.queryObject(
      `DELETE FROM categories WHERE id = $1`,
      [
        id,
      ],
    );
    ctx.response.status = 200;
    ctx.response.body = { message: "Category deleted successfully" };
  } catch (error) {
    console.error("Error deleting the category in the database", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error deleting category" };
  } finally {
    client?.release();
  }
};

const getCategory = async (ctx: Context) => {
  let client;
  try {
    client = await getClient();
    const result = await client.queryObject<Category>(
      `SELECT * FROM categories LIMIT 10`,
    );
    const categories = result.rows.map((dbCategory) => ({
      id: dbCategory.id,
      name: dbCategory.name,
      created_at: dbCategory.created_at,
    }));
    ctx.response.status = 200;
    ctx.response.body = categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to fetch categories" };
  } finally {
    client?.release();
  }
};

export { addCategories, deleteCategory, getCategory, updateCategory };
