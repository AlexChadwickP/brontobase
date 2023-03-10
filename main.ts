import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { OakApplication, OakRouter } from "deps";
import UserRepository from "@data/users.ts";
import AuthService from "@services/auth.ts";
import DbManagerService from "@services/db-manager.ts";
import { AuthController } from "./controllers/auth.ts";
import DbManagerController from "./controllers/db-manager.ts";

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

db.execute(`
           CREATE TABLE IF NOT EXISTS bronto_table_data (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            table_name TEXT NOT NULL,
            rule TEXT NOT NULL,
            operation TEXT NOT NULL
           )
`);

// Initialise repositories
const userRepository = new UserRepository(db);

// Initialise services
const authService = new AuthService(userRepository);
const dbManagerService = new DbManagerService(db);

// Initialise controllers
const authController = new AuthController(authService);
const dbManagerController = new DbManagerController(dbManagerService);

router
  // Auth
  .post("/api/auth/signup", (ctx) => authController.signUp(ctx))
  .post("/api/auth/signin", (ctx) => authController.signIn(ctx))
  // DB Manager
  .post("/db/create-table", (ctx) => dbManagerController.createTable(ctx))
  .post("/db/insert", (ctx) => dbManagerController.insert(ctx))
  .post("/db/rules", (ctx) => dbManagerController.createRule(ctx));

app.use(router.routes());
app.use(router.allowedMethods());

app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = { message: "Not Found" };
});

console.info(
  `${new Date().toLocaleTimeString()} - Listening on http://localhost:${8000}`,
);

await app.listen({ port: 8000 });
