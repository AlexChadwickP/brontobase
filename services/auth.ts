import { IUserRepository, User } from "@data/users.ts";
import { djwt } from "deps";

export class AuthError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, AuthError.prototype);
    }
}

export default class AuthService {
    constructor(
       private readonly userRepository: IUserRepository
    ) {}

    signup(user: Omit<User, 'id'>): string {
        this.userRepository.create(user);

        // TODO: Create JWT token and return it?

        console.log('User created successfully');

        return "";
    }

    async login(email_address: string, password: string): Promise<string> {
        const user = this.userRepository.findByEmailAddress(email_address);
    
        if (password !== user.password) {
            throw new AuthError("Passwords don't match"); 
        } 

        const sub: Omit<User, 'password'> = {
            id: user.id,
            email_address: user.email_address
        }

        const tokenKey = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-512" }, true, ["sign", "verify"]);

        // 3. If they're the same return a JWT token?
        const token = await djwt.create({ alg: "HS512", typ: "JWT" }, { ...sub }, tokenKey);

        return token;
    }
}