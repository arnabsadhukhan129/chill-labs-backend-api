export interface ReferralMasterAttributes {
  id: number;
  code?: string;
  name: string;
  discount: number;
  linked_accounts_no?: number;
  status: string;
  from_date: Date;
  to_date: Date;
  referral_for: string;
}

export interface ReferralMasterCreationAttributes {
  program_request_id: number;
  name: string;
  discount: number;
  status: string;
  duration: number;
  referral_for: string;
}
