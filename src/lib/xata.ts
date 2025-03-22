// Generated by Xata Codegen 0.30.1. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "bot",
    checkConstraints: {
      bot_xata_id_length_xata_id: {
        name: "bot_xata_id_length_xata_id",
        columns: ["xata_id"],
        definition: "CHECK ((length(xata_id) < 256))",
      },
    },
    foreignKeys: {},
    primaryKey: [],
    uniqueConstraints: {
      _pgroll_new_bot_xata_id_key: {
        name: "_pgroll_new_bot_xata_id_key",
        columns: ["xata_id"],
      },
    },
    columns: [
      {
        name: "available",
        type: "bool",
        notNull: false,
        unique: false,
        defaultValue: "true",
        comment: "",
      },
      {
        name: "bio",
        type: "text",
        notNull: false,
        unique: false,
        defaultValue: null,
        comment: "",
      },
      {
        name: "blitz",
        type: "int",
        notNull: false,
        unique: false,
        defaultValue: null,
        comment: "",
      },
      {
        name: "xata_createdat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_id",
        type: "text",
        notNull: true,
        unique: true,
        defaultValue: "('rec_'::text || (xata_private.xid())::text)",
        comment: "",
      },
      {
        name: "xata_updatedat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_version",
        type: "int",
        notNull: true,
        unique: false,
        defaultValue: "0",
        comment: "",
      },
    ],
  },
  {
    name: "config",
    checkConstraints: {
      config_xata_id_length_xata_id: {
        name: "config_xata_id_length_xata_id",
        columns: ["xata_id"],
        definition: "CHECK ((length(xata_id) < 256))",
      },
    },
    foreignKeys: {},
    primaryKey: [],
    uniqueConstraints: {
      _pgroll_new_config_xata_id_key: {
        name: "_pgroll_new_config_xata_id_key",
        columns: ["xata_id"],
      },
    },
    columns: [
      {
        name: "config",
        type: "text",
        notNull: false,
        unique: false,
        defaultValue: null,
        comment: "",
      },
      {
        name: "xata_createdat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_id",
        type: "text",
        notNull: true,
        unique: true,
        defaultValue: "('rec_'::text || (xata_private.xid())::text)",
        comment: "",
      },
      {
        name: "xata_updatedat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_version",
        type: "int",
        notNull: true,
        unique: false,
        defaultValue: "0",
        comment: "",
      },
    ],
  },
  {
    name: "game",
    checkConstraints: {
      game_xata_id_length_xata_id: {
        name: "game_xata_id_length_xata_id",
        columns: ["xata_id"],
        definition: "CHECK ((length(xata_id) < 256))",
      },
    },
    foreignKeys: {},
    primaryKey: [],
    uniqueConstraints: {
      _pgroll_new_game_xata_id_key: {
        name: "_pgroll_new_game_xata_id_key",
        columns: ["xata_id"],
      },
    },
    columns: [
      {
        name: "belo",
        type: "text",
        notNull: false,
        unique: false,
        defaultValue: null,
        comment: "",
      },
      {
        name: "owner",
        type: "text",
        notNull: true,
        unique: false,
        defaultValue: null,
        comment: "",
      },
      {
        name: "welo",
        type: "text",
        notNull: false,
        unique: false,
        defaultValue: null,
        comment: "",
      },
      {
        name: "xata_createdat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_id",
        type: "text",
        notNull: true,
        unique: true,
        defaultValue: "('rec_'::text || (xata_private.xid())::text)",
        comment: "",
      },
      {
        name: "xata_updatedat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_version",
        type: "int",
        notNull: true,
        unique: false,
        defaultValue: "0",
        comment: "",
      },
    ],
  },
  {
    name: "model",
    checkConstraints: {
      model_xata_id_length_xata_id: {
        name: "model_xata_id_length_xata_id",
        columns: ["xata_id"],
        definition: "CHECK ((length(xata_id) < 256))",
      },
    },
    foreignKeys: {},
    primaryKey: [],
    uniqueConstraints: {
      _pgroll_new_model_xata_id_key: {
        name: "_pgroll_new_model_xata_id_key",
        columns: ["xata_id"],
      },
    },
    columns: [
      {
        name: "weights",
        type: "file",
        file: { defaultPublicAccess: false },
        notNull: false,
        unique: false,
        defaultValue: null,
        comment: '{"xata.file.dpa":false}',
      },
      {
        name: "xata_createdat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_id",
        type: "text",
        notNull: true,
        unique: true,
        defaultValue: "('rec_'::text || (xata_private.xid())::text)",
        comment: "",
      },
      {
        name: "xata_updatedat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_version",
        type: "int",
        notNull: true,
        unique: false,
        defaultValue: "0",
        comment: "",
      },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Bot = InferredTypes["bot"];
export type BotRecord = Bot & XataRecord;

export type Config = InferredTypes["config"];
export type ConfigRecord = Config & XataRecord;

export type Game = InferredTypes["game"];
export type GameRecord = Game & XataRecord;

export type Model = InferredTypes["model"];
export type ModelRecord = Model & XataRecord;

export type DatabaseSchema = {
  bot: BotRecord;
  config: ConfigRecord;
  game: GameRecord;
  model: ModelRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL: "https://nrxszvo-07je8l.us-west-2.xata.sh/db/mimicBot",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
