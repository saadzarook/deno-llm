// backend/models/User.ts

import db from "../services/db.ts";
import { Bson } from "../deps.ts";
import { bcrypt } from "../deps.ts";

export interface UserSchema {
    _id: Bson.ObjectId;
    username: string;
    password: string;
}

const users = db.collection<UserSchema>("users");

export const createUser = async (username: string, password: string): Promise<UserSchema> => {
    const hashedPassword = await bcrypt.hash(password);
    const id = await users.insertOne({ username, password: hashedPassword });
    return { _id: id, username, password: hashedPassword };
};

export const findUserByUsername = async (username: string): Promise<UserSchema | undefined> => {
    return await users.findOne({ username });
};

export const verifyPassword = async (user: UserSchema, password: string): Promise<boolean> => {
    return await bcrypt.compare(password, user.password);
};
