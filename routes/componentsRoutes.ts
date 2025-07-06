import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { checkAuth } from "../middleware/authMiddleware.ts";
import { addComponents, updatePost, deletePost, getComponents, incrementComponentClicks } from "../controllers/componentsController.ts";


const routerComponents = new Router({prefix: "/api/components"});


//Rutas Publicas
routerComponents
.get('/dashboard', getComponents)

//Rutas privadas
routerComponents
.post('/',checkAuth, addComponents)
.put('/:id',checkAuth, updatePost)
.put('/clicks/:id',incrementComponentClicks)
.delete('/:id',checkAuth, deletePost)



export {routerComponents}