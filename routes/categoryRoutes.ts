import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { checkAuth } from "../middleware/authMiddleware.ts";
import { addCategories, updateCategory, deleteCategory, getCategory, getCategoriesPost } from "../controllers/categoryControllers.ts";

const routerCategories = new Router({prefix: "/api/categories"});

//Rutas publicas
routerCategories
.get('/dashboard',getCategory)
.get('/posts/:id',getCategoriesPost)

//Rutas privadas
routerCategories
.post('/',checkAuth, addCategories)
.put('/',checkAuth, updateCategory)
.delete('/',checkAuth, deleteCategory)


export {routerCategories}