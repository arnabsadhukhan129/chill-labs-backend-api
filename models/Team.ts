import { Schema, model, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  companyId: Types.ObjectId;   
  teamCode: string;
  teamLead?: Types.ObjectId | null; // User id
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;    
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    // companyId: { type: String, unique: true},
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    teamCode: { type: String, required: true, unique: true, uppercase: true },
    teamLead: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: {
    type: Boolean,
    default: false
  },
  },
  { timestamps: true }
);

const Team = model<ITeam>('Team', teamSchema);
export default Team;
