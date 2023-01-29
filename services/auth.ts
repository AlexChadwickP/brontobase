import { IUserRepository, User } from "@data/users.ts";
import { djwt } from "deps";
import { bcrypt } from "deps";

export class AuthError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export interface IAuthService {
  signUp(user: Omit<User, "id">): Promise<string>;
  signIn(email_address: string, password: string): Promise<string>;
}

export default class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async signUp(user: Omit<User, "id">): Promise<string> {
    const hashedPassword = await bcrypt.hash(user.password);
    this.userRepository.create({
      email_address: user.email_address,
      password: hashedPassword,
    });

    return await this.signIn(user.email_address, user.password);
  }

  async signIn(email_address: string, password: string): Promise<string> {
    const user = this.userRepository.findByEmailAddress(email_address);

    if (!await bcrypt.compare(password, user.password)) {
      throw new AuthError("Passwords don't match");
    }

    const sub: Omit<User, "password"> = {
      id: user.id,
      email_address: user.email_address,
    };

    const tokenKey = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );

    const token = await djwt.create(
      { alg: "HS512", typ: "JWT" },
      { ...sub },
      tokenKey,
    );

    return token;
  }
}
