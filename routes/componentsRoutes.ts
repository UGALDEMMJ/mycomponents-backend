import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { checkAuth } from "../middleware/authMiddleware.ts";
import { addComponents } from "../controllers/componentsController.ts";


const routerComponents = new Router({prefix: "/api/components"});


//Rutas Publicas
// router


//Rutas privadas
routerComponents
.post('/',checkAuth, addComponents)



export {routerComponents}