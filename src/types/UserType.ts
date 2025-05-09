import { AddressType } from "./AddressType";
import { ProfileType } from "./ProfileType";

export type UserLoggedType = {
  // Informações básicas do usuário
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  cpf?: string;
  document?: string;
  birthday?: string;
  genre?: string;
  mobilePhone?: string;
  location?: string;
  ativo?: boolean;
  loginFacebook?: string;
  loginGoogle?: string;
  appleId?: string;
  activationCode?: string;
  limitForActivation?: string;
  settingsPassword: string;
  profile: ProfileType | string;
  address?: AddressType;
  grouper: boolean;
  grouperId: number;
  usersLicense: number;
  devicesLicense: number;
  consumptionControl: string;
  nextPaymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  userType:
    | "test_development"
    | "demonstration"
    | "official"
    | "research"
    | "developer"
    | "partner"
    | "admin"
    | "internal"
    | "client"
    | "manager"
    | "consultant";
};
