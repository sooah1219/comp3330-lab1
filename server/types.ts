import type { UserType } from "@kinde-oss/kinde-typescript-sdk";

export type AppVariables = {
  user: UserType | null;
};

export type AppEnv = {
  Variables: AppVariables;
};
