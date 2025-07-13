import { S3 } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

export const s3Upload = async (file: Express.Multer.File) => {
	const s3 = new S3({
		region: process.env.S3_REGION!,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID!,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
		},
	});

	if (!file) {
		throw new Error('No file provided');
	}

	const fileKey = `nexora/${Date.now()}-${file.originalname.replace(/ /g, '-')}`;

	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: fileKey,
		Body: file.buffer,
		ContentType: file.mimetype,
	};

	await s3.putObject(params);

	const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;
	return {
		fileKey,
		fileName: file.originalname,
		url: publicUrl,
	};
};

export const s3Download = async (fileKey: string) => {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve, reject) => {
		try {
			const s3 = new S3({
				region: process.env.S3_REGION!,
				credentials: {
					accessKeyId: process.env.S3_ACCESS_KEY_ID!,
					secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
				},
			});

			const { Body } = await s3.getObject({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileKey,
			});

			const downloadPath = path.join(
				'C:',
				'Users',
				'Krishna Thakkar',
				'Downloads',
				`krishna${Date.now().toString()}.pdf`,
			);

			if (Body instanceof Readable) {
				// Pipe the S3 stream into a file
				const writeStream = fs.createWriteStream(downloadPath);
				writeStream.on('error', (err) => {
					return reject(err);
				});
				writeStream.on('finish', () => {
					// Only here do we resolve the outer promise
					return resolve(downloadPath);
				});
				Body.pipe(writeStream);
			} else {
				return reject(new Error('S3 response body is not a Readable stream'));
			}
		} catch (error) {
			console.error(error);
			reject(error);
			return null;
		}
	});
};

export function getS3Url(file_key: string) {
	const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${file_key}`;
	return url;
}
