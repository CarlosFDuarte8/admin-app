export interface User {
  nome: string;
  email: string;
  ativo: boolean;
  profile: 'USER' | 'ADMIN';
  senha: string;
  genre: '' | 'F' | 'M';
  nextPaymentDate: string | null;
  settingsPassword: string;
  grouper: boolean;
  grouperId: number;
  usersLicense: number;
  devicesLicense: number;
  consumptionControl: 'byTest' | 'perCapsule' | 'ilimited';
  userType: 'demonstration' | 'official' | 'research' | 'developer';
}