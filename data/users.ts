import { DB } from "deps";

export interface User {
  id: number;
  email_address: string;
  password: string;
}

export interface IUserRepository {
  create: (user: Omit<User, "id">) => void;
  findByEmailAddress: (email_address: string) => User;
}

export default class UserRepository implements IUserRepository {
  constructor(
    private readonly db: DB,
  ) {}

  create(user: Omit<User, "id">) {
    const q = this.db.prepareQuery(
      "INSERT INTO users (email_address, password) VALUES (:email_address, :password)",
    );

    q.all({ email_address: user.email_address, password: user.password });
  }

  findByEmailAddress(email_address: string) {
    const q = this.db.prepareQuery<[User], never, { email_address: string }>(
      "SELECT * FROM users WHERE email_address = :email_address",
    );

    const res = q.allEntries({ email_address });

    return res[0];
  }
}
