import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import path from "path";
import { v4 as uuid } from "uuid";

const region = process.env.AWS_REGION!;
const bucket = process.env.AWS_BUCKET!;
const folder = process.env.AWS_S3_FOLDER || "";

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function buildS3Key(filename: string): string {
  const cleaned = filename.replace(/\s+/g, "_"); // remove spaces
  return folder ? `${folder}/${cleaned}` : cleaned;
}


export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: ObjectCannedACL.public_read,
  };

  await s3Client.send(new PutObjectCommand(params));

  // Split folder and filename
  const parts = key.split("/");
  const fileName = encodeURIComponent(parts.pop()!); // encode only the file name
  const folderPath = parts.join("/");

  return folderPath
    ? `https://${bucket}.s3.${region}.amazonaws.com/${folderPath}/${fileName}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
}



