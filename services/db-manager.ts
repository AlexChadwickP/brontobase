import { DB } from "deps";

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

type Operation = "insert" | "update" | "delete" | "select";

export interface IDbManagerService {
  createTable: (newTableParams: NewTableParams) => void;
  insert: (tableName: string, data: any) => void;
  createRule: (name: string, tableName: string, rule: string, operation: Operation) => void;
}

export class DbManagerError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default class DbManagerService implements IDbManagerService {
  constructor(
    private readonly db: DB,
  ) {}

  createTable(newTableParams: NewTableParams) {
    let tableQuery =
      `CREATE TABLE IF NOT EXISTS ${newTableParams.name} (\n\tid INTEGER PRIMARY KEY AUTOINCREMENT,`;

    for (const [i, column] of newTableParams.columns.entries()) {
      tableQuery += `\n\t${column.name} ${column.dataType.toUpperCase()}${
        column.notNull ? " NOT NULL" : ""
      }${column.unique ? " UNIQUE" : ""}${
        (column.dataType === "integer" && column.autoIncrement)
          ? " AUTOINCREMENT"
          : ""
      }${i === newTableParams.columns.length - 1 ? "" : ","}`;
    }

    tableQuery = `${tableQuery}\n);`;

    console.log(tableQuery);

    this.db.query(tableQuery);
  }

  insert(tableName: string, data: any) {
    let insertQuery = `INSERT INTO ${tableName}`;

    let keysStr = "(";
    let valuesStr = "VALUES (";

    const dataArr = Object.entries(data);

    for (const [i, column] of dataArr.entries()) {
      const key = column[0];
      const value = column[1];
      keysStr += key;
      valuesStr += typeof value === "string" ? `'${value}'` : value;

      if (i !== dataArr.length - 1) {
        // Not last element
        keysStr += ",";
        valuesStr += ",";
      }
    }

    keysStr += ")";
    valuesStr += ")";

    insertQuery = `${insertQuery} ${keysStr} ${valuesStr};`;

    this.db.query(insertQuery);
  }

  createRule(name: string, tableName: string, rule: string, operation: Operation) {
    // Parse rule to make sure it's valid?
    const insertRuleQuery = `INSERT INTO bronto_table_data (name, table_name, rule, operation) VALUES ('${name}', '${tableName}', '${rule}', '${operation}')`;

    this.db.query(insertRuleQuery);
  }
}
