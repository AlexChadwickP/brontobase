import { z, OakContext } from "deps";
import { AuthError, IAuthService } from "@services/auth.ts";

interface IAuthController {

}

export class AuthController implements IAuthController {
    constructor(
        private readonly authService: IAuthService
    ) {}

    async signUp({ response, request }: OakContext) {
        const bodySchema = z.object({
            email_address: z.string().email(),
            password: z.string()
          });
      
          try {
            console.log(this.authService);

            const body = bodySchema.parse(await request.body({ type: "json" }).value);
    

            this.authService.signUp({ email_address: body.email_address, password: body.password });
      
            response.status = 201;
            response.body = { message: "User successfully created" };
          } catch (err) {
            console.error(err);
            response.status = 400;
            response.body = { message: "Couldn't create user" };
          }
    }

    async signIn({ response, request, cookies }: OakContext) {
        const bodySchema = z.object({
            email_address: z.string().email(),
            password: z.string()
          });
          
          try {
            const body = bodySchema.parse(await request.body({ type: "json" }).value);
      
            const jwt = await this.authService.signIn(body.email_address, body.password);
      
            response.status = 200;
            cookies.set('brontobase_jwt', jwt);
          } catch (err) {
            console.error(err);
            response.status = 400;
            response.body = err instanceof AuthError ? { message: err.message } : { message: "Couldn't log you in" };
          }
    }
}