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
  isPrivate: z.boolean(),
  password : z.string().min(8, {error : "Password must be at least of 8 characters"}).optional().nullable()
});

export const JoinRoomSchema = z.object({
  roomId : z.string(),
  roomCode : z.number(),
  password : z.string().min(8, {error : "Password must be at least of 8 characters"}).optional()
})

export const RenameRoomSchema = z.object({
  newName : z.string().min(4, {error : "Room name should be at least of 4 characters"})
})

export const UpdateRoomSettingSchema = z.object({
  isPrivate: z.boolean(),
  password : z.string().min(8, {error : "Password must be at least of 8 characters"}).optional()
})