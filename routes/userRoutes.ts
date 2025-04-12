import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { signupUser, verifyUser, authUser, getProfile } from "../controllers/userController.ts";
import { checkAuth} from "../middleware/authMiddleware.ts" 
const routerUsers = new Router({prefix: "/api/user"});

//Rutas publicas
routerUsers
.post('/signup',signupUser)
.get('/verify/:token',verifyUser)
.post('/login',authUser)


//Rutas privadas
routerUsers
.get('/profile',checkAuth,getProfile)

export{routerUsers}