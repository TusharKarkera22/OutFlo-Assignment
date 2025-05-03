export interface Campaign {
  _id?: string;
  name: string;
  status: 'active' | 'inactive';
  leads: string[];
  accountIds: string[];
  createdAt?: string;
  updatedAt?: string;
} 