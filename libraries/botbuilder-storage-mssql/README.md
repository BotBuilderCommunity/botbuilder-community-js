# Bot Builder Microsoft SQL Server Storage

This is a simple storage adapter for Microsoft SQL Server.

## Installation

```powershell
npm install @botbuildercommunity/storage-mssql --save
```

## Usage

```typescript
import { MSSQLStorage } from '@botbuildercommunity/storage-mssql';

const storage = new MSSQLStorage({ 
    user: <DATABASE_USERNAME>,
    password: <DATABASE_PASSWORD>,
    server: <DATABASE_SERVER>,
    database: <DATABASE_NAME>,
    table: <DATABASE_TABLE>
});

const conversationState = new ConversationState(storage);
const userState = new UserState(storage);
```

> This module uses the [node-mssql](https://www.npmjs.com/package/mssql) package for SQL connectivity. The `MSSQLOptions` that is passed to the `MSSQLStorage` object extends the `config` object of that package. All options from that `config` option can be passed in.

> This module assumes two string-based columns in your database table: `id` and `data`.
