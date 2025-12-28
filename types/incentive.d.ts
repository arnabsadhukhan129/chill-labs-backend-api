import { String } from "aws-sdk/clients/apigateway";

export interface IncentiveAttributes {
  id: number;
  user_id: number;
  incentive_type: string;
  incentive_amount: number;

  createdAt: Date;
  updatedAt: Date;
}
