import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.email("Format email tidak valid"),
  password_hash: z.string().min(8, "Password minimal 8 karakter"),
});

const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password_hash: z.string().min(8, "Password wajib diisi"),
});
export { registerSchema, loginSchema };
