// backend/deps.ts

// Oak Framework for Deno
export { Application, Router, Context, Status } from "https://deno.land/x/oak@v17.1.3/mod.ts";

// MongoDB ODM
export { MongoClient } from "https://deno.land/x/mongo@v0.33.0/mod.ts";

// Bson
export { Bson } from "https://deno.land/x/bson/mod.ts";

// JWT for Authentication
export { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

// bcrypt for password hashing
export * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// OpenAI API
export { OpenAI } from "https://deno.land/x/openai@v4.69.0/mod.ts";

// ENV loader
export { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";