export enum UserRole {
  Manager = "manager",
  Customer = "customer"
}

export type CurrentUser = {
  id: string,
  email: string,
  role: UserRole
}