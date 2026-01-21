interface Register {
  email: string;
  name: string;
  password_hash: string;
}
interface JwtPayload {
  sub: string;
  email: string;
}
interface Login {
  email: string;
  password_hash: string;
}
export type { Register, JwtPayload, Login };
