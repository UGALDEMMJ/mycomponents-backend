import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { checkAuth } from "../middleware/authMiddleware.ts";
import { addCategories, updateCategory, deleteCategory } from "../controllers/categoryControllers.ts";

const routerCategories = new Router({prefix: "/api/categories"});
//Rutas privadas
routerCategories
.post('/',checkAuth, addCategories)
.put('/',checkAuth, updateCategory)
.delete('/',checkAuth, deleteCategory)


export {routerCategories}