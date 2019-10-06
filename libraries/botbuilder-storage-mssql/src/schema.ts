import { config as msconfig, config } from 'mssql';

/**
 * @module @botbuildercommunity/storage-mssql
 */

export interface MSSQLOptions extends config {
    table: string;
}
