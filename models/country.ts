import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
  iso: string;
  name: string;
  nicename: string;
  iso3?: string;
  numcode?: number;
  phonecode: number;
}

const CountrySchema = new Schema<ICountry>({
  iso: {
    type: String,
    required: true,
    maxlength: 2,
  },
  name: {
    type: String,
    required: true,
    maxlength: 80,
  },
  nicename: {
    type: String,
    required: true,
    maxlength: 80,
  },
  iso3: {
    type: String,
    maxlength: 3,
  },
  numcode: {
    type: Number,
  },
  phonecode: {
    type: Number,
    required: true,
  },
}, {
  collection: 'country',
  timestamps: false,
});

const Country = mongoose.model<ICountry>("Country", CountrySchema);

export default Country;
