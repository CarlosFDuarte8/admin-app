export type CapsuleType = {
  id?: number;
  customerCode: string;
  deviceId: number;
  fragranceId: number;
  dueDate: string;
  serialNumber: string;
  remainingShots: number;
  performedShots: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};