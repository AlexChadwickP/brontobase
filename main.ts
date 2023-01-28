import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { z } from "./deps.ts"; 

import UserRepository, { User } from "./data/users.ts";
import AuthService, { AuthError } from "@services/auth.ts";


const db = new DB("bronto.db");
const app = new Application();
const router = new Router();

// Initialise database
db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

const authService = new AuthService(new UserRepository(db));

router
  .get("/", (ctx) => {
    ctx.response.body = "Welcome to brontobase";
  })
  .post("/signup", async (ctx) => {
    const bodySchema = z.object({
      email_address: z.string().email(),
      password: z.string()
    });

    try {
      const body = bodySchema.parse(await ctx.request.body({ type: "json" }).value);

      authService.signup({ email_address: body.email_address, password: body.password });

      ctx.response.status = 201;
      ctx.response.body = { message: "User successfully created" };
      return;
    } catch (err) {
      console.error(err);
      ctx.response.status = 400;
      ctx.response.body = { message: "Couldn't create user" };
      return;
    }
  })
  .post("/signin", async (ctx) => {
    const bodySchema = z.object({
      email_address: z.string().email(),
      password: z.string()
    });
    
    try {
      const body = bodySchema.parse(await ctx.request.body({ type: "json" }).value);

      const jwt = await authService.login(body.email_address, body.password);

      ctx.response.status = 200;
      ctx.cookies.set('brontobase_jwt', jwt);
    } catch (err) {
      console.error(err);
      ctx.response.status = 400;
      ctx.response.body = err instanceof AuthError ? { message: err.message } : { message: "Couldn't log you in" };
    }
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.info(`${new Date().toLocaleTimeString()} - Listening on http://localhost:${8000}`);

await app.listen({ port: 8000 });
