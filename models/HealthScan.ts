import mongoose, { Schema, Document } from "mongoose";

export interface IHealthScan extends Document {
  userId: mongoose.Types.ObjectId;

  // ✅ Mandatory (number)
  age: number;
  gender: number;
  weight: number;
  height: number;

  // Optional (number)
  heartRate?: number;
  spo2?: number;
  ibi?: number;
  stress?: number;
  stressScore?: number;
  respiratoryRate?: number;

  hrvSdnn?: number;
  hrvRmssd?: number;

  temperature?: number;

  bloodPressure?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;

  facialSkinAge?: number;
  bloodAlcohol?: number;
  bloodSugar?: number;

  generalWellness?: number;
  bmi?: number;
  absi?: number;

  cardiacWorkload?: number;
  pulseRespiratoryQuotient?: number;
  waistToHeightRatio?: number;

  cardiovascularSystemWellness?: number;
  mentalWellness?: number;
  physicalWellness?: number;
  respiratorySystemWellness?: number;

  generalRisk?: number;
  coronaryHeartDisease?: number;
  congestiveHeartFailure?: number;
  intermittentClaudication?: number;
  stroke?: number;
  covidRisk?: number;
  diabetesRisk?: number;
  hypertensionRisk?: number;

  scanSignalQuality?: number;
  scanSignalDuration?: number;

  createdAt: Date;
}

const HealthScanSchema = new Schema<IHealthScan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // 🔒 Mandatory
    age: { type: Number, required: true },
    gender: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },

    // 🔓 Optional (all numbers)
    heartRate: Number,
    spo2: Number,
    ibi: Number,
    stress: Number,
    stressScore: Number,
    respiratoryRate: Number,

    hrvSdnn: Number,
    hrvRmssd: Number,

    temperature: Number,

    bloodPressure: Number,
    bloodPressureSystolic: Number,
    bloodPressureDiastolic: Number,

    facialSkinAge: Number,
    bloodAlcohol: Number,
    bloodSugar: Number,

    generalWellness: Number,
    bmi: Number,
    absi: Number,

    cardiacWorkload: Number,
    pulseRespiratoryQuotient: Number,
    waistToHeightRatio: Number,

    cardiovascularSystemWellness: Number,
    mentalWellness: Number,
    physicalWellness: Number,
    respiratorySystemWellness: Number,

    generalRisk: Number,
    coronaryHeartDisease: Number,
    congestiveHeartFailure: Number,
    intermittentClaudication: Number,
    stroke: Number,
    covidRisk: Number,
    diabetesRisk: Number,
    hypertensionRisk: Number,

    scanSignalQuality: Number,
    scanSignalDuration: Number
  },
  { timestamps: true }
);

HealthScanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IHealthScan>(
  "HealthScan",
  HealthScanSchema
);
