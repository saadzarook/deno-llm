// backend/controllers/analyticsController.ts

import { Context, Status } from "../deps.ts";
import { getUserInteractions } from "../models/Interaction.ts";
import { analyzeInteractions } from "../services/analyticsService.ts";
import { Bson } from "../deps.ts";

/**
 * Retrieves a performance report for a specific user.
 * @param ctx - The Oak context.
 */
export const getStudentReport = async (ctx: Context) => {
    try {
        const userId = ctx.state.userId;
        if (!userId || !Bson.ObjectId.isValid(userId)) {
            ctx.response.status = Status.BadRequest;
            ctx.response.body = { message: "Invalid user ID." };
            return;
        }

        const interactions = await getUserInteractions(new Bson.ObjectId(userId));
        const analysis = analyzeInteractions(interactions);

        ctx.response.status = Status.OK;
        ctx.response.body = { analysis };
    } catch (error) {
        console.error('Error generating report:', error);
        ctx.response.status = Status.InternalServerError;
        ctx.response.body = { message: "Error generating report." };
    }
};
