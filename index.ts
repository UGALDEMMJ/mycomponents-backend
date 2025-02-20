import { connectDB } from "./config/db.ts";
import {Application} from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { router } from "./routes/userRoutes.ts";

try {
    connectDB();
    const app = new Application();
    app.use(router.routes());
    app.use(router.allowedMethods());
    console.log(`Server started on port 8000`);
    await app.listen({port: 8000});
} catch (error) {
    console.error("Failed to start server", error);
}
