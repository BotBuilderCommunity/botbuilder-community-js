import { PoolConfig } from "pg";

/**
 * @module @botbuilder-community/storage-pg
 */

export interface PostgreSQLOptions extends PoolConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  table: string;
  port: number;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
};