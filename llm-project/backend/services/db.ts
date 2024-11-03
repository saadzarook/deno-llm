// backend/services/db.ts

import { MongoClient } from "../deps.ts";
import { load } from "../deps.ts";
import env = Deno.env;

await load({export: true});

const client = new MongoClient();
await client.connect(env.get("MONGO_URI"));

const db = client.database("ai_edtech");

export default db;
