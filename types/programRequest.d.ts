export interface ProgramRequest {
  id: number;
  user_id: number;
  program_type: string;
  status: string;
  card_distribution: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramRequestCreationAttributes {
  name: string;
  email: string;
  user_id: number;
  program_type: string;
  father_name: string;
  address: Array<{
    address_type: string;
    details: string;
  }>;
}
