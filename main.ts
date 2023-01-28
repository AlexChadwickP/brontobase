
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { z, OakApplication, OakRouter } from "./deps.ts"; 

import UserRepository, { User } from "./data/users.ts";
import AuthService, { AuthError } from "@services/auth.ts";
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

console.log(authService);

// Initialise controllers
const authController = new AuthController(authService);

router
  .post("/signup", (ctx) => authController.signUp(ctx))
  .post("/signin", (ctx) => authController.signIn(ctx));

app.use(router.routes());
app.use(router.allowedMethods());

console.info(`${new Date().toLocaleTimeString()} - Listening on http://localhost:${8000}`);

await app.listen({ port: 8000 });
