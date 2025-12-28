import mongoose, { Schema, Document,Types } from 'mongoose';

export interface ISubCategoryContent extends Document {
  name: string;
  url: string;
  time: number;
  isFeatured: boolean;
  isDeleted: boolean;
  tags: string[];
  sortOrder: number;
  image?: string;
  author?: string;
  chapter?: number;
  id?: mongoose.Types.ObjectId;
  audiance?: string[];
}

export interface ISubCategory extends Document {
  name: string;
  image: string;
  isDeleted: boolean;
  categoryId: mongoose.Types.ObjectId;
  content_type: 'video' | 'audio' | 'book';
  discription: string;
  content: Types.DocumentArray<ISubCategoryContent>;

  content_length: number;
  content_time: number;
}

const SubCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true, },
    isDeleted: { type: Boolean, default: false },
    content_type: { type: String, enum: ['video', 'audio', 'book'],},
    description: { type: String, },
    content: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      time: { type: Number, default: 0 },
      isFeatured: { type: Boolean, default: false },
      isDeleted: { type: Boolean, default: false },
      tags: { type: [String], default: [] },
       sortOrder: { type: Number, default: 0 },
       image:{ type: String  },
       author:{ type: String  },
       audiance:{ type: [String], default: [] },
         // 👇 NEW FIELD
    chapter: {
          type: Number,
          min: 1, 
          validate: {
            validator: function (this: any, value: number) {
              const parent = this.ownerDocument?.();
              if (parent?.content_type === 'book') {
                return value !== undefined && value !== null;
              }
              return true;
            },
            message: 'Chapter is required when content_type is book'
          }
        }
      }
    ],
    content_length: { type: Number, default: 0 },
    content_time: { type: Number, default: 0 },
    categoryId: { type: mongoose.Types.ObjectId, ref: 'Category', required: true }

  },
  { timestamps: true }
);

export default mongoose.model<ISubCategory>('Sub-Category', SubCategorySchema);
