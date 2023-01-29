import { OakContext, z } from "deps";
import { IDbManagerService } from "@services/db-manager.ts";

export interface IDbManagerController {
    createTable: (ctx: OakContext) => void;
    insert: (ctx: OakContext) => void;
}

export default class DbManagerController implements IDbManagerController {
    constructor(
        private readonly dbManagerService: IDbManagerService
    ) {}

    async createTable({ request, response }: OakContext) {
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
            const data = bodySchema.parse(await request.body({ type: "json" }).value);
      
            this.dbManagerService.createTable(data);
      
            response.status = 201;
            response.body = { message: "Created table successfully" };
          } catch (err) {
            console.error(err);
            response.status = 400;
            response.body = { message: "Something went wrong!" };
          }
    }

    async insert({ request, response }: OakContext) {
      const bodySchema = z.object({
        tableName: z.string(),
        data: z.any()
      });

      try {
        const data = bodySchema.parse(await request.body({ type: "json" }).value);

        this.dbManagerService.insert(data.tableName, data.data);

        response.status = 201;
        response.body = { message: "Inserted data successfully" };
      } catch (err) {
        console.error(err);
        response.status = 400;
        response.body = { message: "Something went wrong" };
      }
    }
}
