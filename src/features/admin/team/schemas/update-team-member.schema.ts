import { z } from "zod";

import { createTeamMemberSchema } from "./create-team-member.schema";

export const updateTeamMemberSchema =
  createTeamMemberSchema.extend({
    id: z.string().cuid(),

    password: z
      .string()
      .min(8)
      .max(100)
      .optional()
      .or(z.literal("")),
  });

export type UpdateTeamMemberInput =
  z.infer<typeof updateTeamMemberSchema>;
  