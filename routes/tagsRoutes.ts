import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { checkAuth } from "../middleware/authMiddleware.ts";
import { addTags, updateTag, deleteTag, getTags } from "../controllers/tagsController.ts"; 

const routerTags = new Router({prefix: "/api/tags"});

//Rutas publicas
routerTags
.get('/dashboard', getTags)

//Rutas privadas
routerTags
.post('/',checkAuth, addTags)
.put('/',checkAuth,updateTag)
.delete('/',checkAuth,deleteTag)


export {routerTags}