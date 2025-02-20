import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { signupUser, verifyUser, authUser } from "../controllers/userController.ts";
const router = new Router({prefix: "/api"});

interface userParams {
    userToken: string;
}

//Rutas publicas
router
.post('/signup',(ctx)=>signupUser(ctx))
.get('/verify/:token',(ctx)=>verifyUser(ctx))
.post('/login',(ctx)=>authUser(ctx))


//Rutas privadas
router
// .get('/perfil',(ctx)=>{

// })
// .get('/perfil/:id',(ctx)=>{
    
// })
// .get('/update-password/:id',(ctx)=>{
    
// })

export{router}