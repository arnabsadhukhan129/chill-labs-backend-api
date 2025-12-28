import mongoose, { Schema } from "mongoose";

const ContentActivitySchema = new Schema(
{
userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
role: { type: String, required: true },


schoolId: { type: Schema.Types.ObjectId, ref: "School", default: null },
companyId: { type: Schema.Types.ObjectId, ref: "Company", default: null },


// dynamic reference to Book | Video | Audio
contentId: { type: Schema.Types.ObjectId, required: true, refPath: "contentTypeModel" },
contentType: { type: String, enum: ["book", "video", "audio"], required: true },
contentTypeModel: { type: String, enum: ["Book", "Video", "Audio"], required: true },


action: { type: String, enum: ["read", "watch", "play"], required: true },


platform: { type: String, default: "web" },
ipAddress: { type: String },


meta: { type: Schema.Types.Mixed, default: {} }
},
{ timestamps: true }
);


export default mongoose.model("ContentActivity", ContentActivitySchema);