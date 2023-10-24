# Bot Builder PostgreSQL Storage

This is a simple storage adapter for PostgreSQL.

## Installation

```powershell
npm install @botbuildercommunity/storage-pg --save
```

## Usage

```typescript
import { PostgreSQLStorage } from '@botbuildercommunity/storage-pg';

const storage = new PostgreSQLStorage({ 
    user: <DATABASE_USERNAME>,
    password: <DATABASE_PASSWORD>,
    server: <DATABASE_SERVER>,
    database: <DATABASE_NAME>,
    table: <DATABASE_TABLE>
});

const conversationState = new ConversationState(storage);
const userState = new UserState(storage);
```

> This module uses the [node-pg](https://www.npmjs.com/package/pg) package for SQL connectivity. The `PostgreSQLOptions` that is passed to the `PostgreSQLStorage` object extends the `config` object of that package. All options from that `config` option can be passed in.

> This module assumes two columns in your database table: `id` with datatype `VARCHAR(255)` and `data` with `JSONB` respectively.
