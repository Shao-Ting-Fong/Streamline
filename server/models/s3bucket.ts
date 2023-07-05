// eslint-disable-next-line import/no-extraneous-dependencies
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AxiosResponse } from "axios";
import { PassThrough } from "stream";

const { BUCKET_NAME, BUCKET_REGION, BUCKET_ACCESS_KEY, BUCKET_SECRET_ACCESS_KEY } = process.env;

const s3 = new S3Client({
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY ?? "",
    secretAccessKey: BUCKET_SECRET_ACCESS_KEY ?? "",
  },
  region: BUCKET_REGION,
});

export const uploadImageToS3 = async (response: AxiosResponse, filename: string) => {
  const passThrough = new PassThrough();

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: passThrough,
    ContentType: response.headers["content-type"],
    ContentLength: response.headers["content-length"],
    ACL: "public-read",
  };

  response.data.pipe(passThrough);

  const command = new PutObjectCommand(params);
  await s3.send(command);
  return filename;
};
