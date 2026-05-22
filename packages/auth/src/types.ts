export type Role = "CUSTOMER" | "ADMIN";

export interface PublicAuthResponse {
  accessToken: string;
  userId: string;
  email: string;
  role: Role;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  shippingAddress: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  userId: string;
  email: string;
  role: Role;
}
