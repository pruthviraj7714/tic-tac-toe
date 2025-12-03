import { z } from "zod";

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(6, { error: "Username Should be at least of 6 characters" }),
  password: z
    .string()
    .min(8, { error: "Password Should be at least of 8 characters" }),
  email: z.email({ error: "Email should be valid" }),
});

export const SignInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(4, { error: "Room Name Should be at least of 4 characters" }),
  maxSpectators: z.number({ error: "It should be valid number" }),
  isPrivate: z.boolean(),
});
