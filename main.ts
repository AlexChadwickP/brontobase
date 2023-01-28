
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { z, OakApplication, OakRouter } from "./deps.ts"; 

import UserRepository, { User } from "./data/users.ts";
import AuthService, { AuthError } from "@services/auth.ts";
import DbManagerService from "@services/db-manager.ts";
import { AuthController } from "./controllers/auth.ts";


const db = new DB("bronto.db");
const app = new OakApplication();
const router = new OakRouter();

// Initialise database
db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

// Initialise repositories
const userRepository = new UserRepository(db)

// Initialise services
const authService = new AuthService(userRepository);
const dbManagerService = new DbManagerService(db);

// Initialise controllers
const authController = new AuthController(authService);

router
  .post("/signup", (ctx) => authController.signUp(ctx))
  .post("/signin", (ctx) => authController.signIn(ctx))
  .post("/db/create-table", async (ctx) => {
    const columnSchema = z.object({
      name: z.string(),
      dataType: z.union([
        z.literal("null"),
        z.literal("integer"),
        z.literal("real"),
        z.literal("text"),
        z.literal("blob")
      ]),
      notNull: z.boolean().optional(),
      unique: z.boolean().optional(),
      autoIncrement: z.boolean().optional(),
      default: z.any().optional()
    });

    const bodySchema = z.object({
      name: z.string(),
      columns: z.array(columnSchema).min(1)
    });

    try {
      const data = bodySchema.parse(await ctx.request.body({ type: "json" }).value);

      dbManagerService.createTable(data);

      ctx.response.status = 201;
      ctx.response.body = { message: "Created table successfully" };
    } catch (err) {
      console.error(err);
      ctx.response.status = 400;
      ctx.response.body = { message: "Something went wrong!" };
    }
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.info(`${new Date().toLocaleTimeString()} - Listening on http://localhost:${8000}`);

await app.listen({ port: 8000 });
