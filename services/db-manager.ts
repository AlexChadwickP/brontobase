import { DB } from 'deps';

interface Column {
    name: string;
    dataType: "null" | "integer" | "real" | "text" | "blob";
    notNull?: boolean;
    unique?: boolean;
    autoIncrement?: boolean;
    default?: any;
}

interface NewTableParams {
    name: string;
    columns: Column[];
}

export interface IDbManagerService {
    createTable: (newTableParams: NewTableParams) => void;
}

export class DbManagerError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export default class DbManagerService implements IDbManagerService {
    constructor(
        private readonly db: DB
    ) {}

    createTable(newTableParams: NewTableParams) {
        let tableQuery = `CREATE TABLE IF NOT EXISTS ${newTableParams.name} (\n\tid INTEGER PRIMARY KEY AUTOINCREMENT,`;

        for (const [i, column] of newTableParams.columns.entries()) {
            tableQuery += `\n\t${column.name} ${column.dataType.toUpperCase()}${column.notNull ? " NOT NULL" : ""}${column.unique ? " UNIQUE" : ""}${(column.dataType === "integer" && column.autoIncrement) ? " AUTOINCREMENT" : ""}${i === newTableParams.columns.length - 1 ? "" : ","}`
        }

        tableQuery = `${tableQuery}\n);`

        console.log(tableQuery);

        this.db.query(tableQuery);
    }
}