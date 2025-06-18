import { connectDB } from "./config/db.ts";
import {Application} from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { routerUsers } from "./routes/userRoutes.ts";
import { routerComponents } from "./routes/componentsRoutes.ts"
import { routerCategories } from "./routes/categoryRoutes.ts";
import { routerTags } from "./routes/tagsRoutes.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts"

try {
    connectDB();
    const app = new Application();
    app.use(oakCors({ origin: "http://localhost:5173"}));
    app.use(routerUsers.routes());
    app.use(routerUsers.allowedMethods());
    app.use(routerComponents.routes());
    app.use(routerComponents.allowedMethods());
    app.use(routerCategories.routes());
    app.use(routerCategories.allowedMethods());
    app.use(routerTags.routes());
    app.use(routerTags.allowedMethods());
    console.log(`Server started on port 8000`);
    await app.listen({port: 8000});
} catch (error) {
    console.error("Failed to start server", error);
}
