import { AsyncHandler } from '@/middlewares/error.js';
import ErrorHandler from '@/utils/errorHandler.js';
import { s3Download, s3Upload } from '@/utils/s3.js';
import { prisma } from '@workspace/db';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { PDFPage } from '@/utils/types.js';
import { convertToAscii, embedDocument, prepareDocument } from '@/utils/chatpdf-helper.js';
import { getPineconeClient } from '@/utils/pinecone.js';

export const getChatPdfs = AsyncHandler(async (req, res, next) => {
	const user = req.user;

	const chatPdfs = await prisma.chatPdf.findMany({
		where: {
			userId: user,
		},
	});

	return res.status(200).json({
		status: true,
		message: 'Chat PDFs fetched successfully.',
		data: {
			chatPdfs,
		},
	});
});

export const uploadPdfToS3 = AsyncHandler(async (req, res, next) => {
	const file = req.file as Express.Multer.File;

	let uploadedFile: {
		fileKey: string;
		fileName: string;
		url: string;
	} = await s3Upload(file);

	const file_name = await s3Download(uploadedFile.fileKey);
	console.log('file_name', file_name);

	if (!file_name) {
		return next(new ErrorHandler(500, 'Failed to download file from S3'));
	}

	const loader = new PDFLoader(file_name as string);
	const pages = (await loader.load()) as PDFPage[];

	// 2. split and segment the pdf
	const documents = await Promise.all(pages.map(prepareDocument));

	// 3. vectorise and embed individual documents
	const vectors = await Promise.all(documents.flat().map(embedDocument));

	// 4. upload to pinecone
	const client = await getPineconeClient();
	const pineconeIndex = await client.index('nexi');
	const namespace = pineconeIndex.namespace(convertToAscii(uploadedFile.fileKey));

	// console.log("inserting vectors into pinecone");
	await namespace.upsert(vectors);

	// 5. save to db
	const chatPdfDoc = await prisma.chatPdf.create({
		data: {
			pdfUrl: uploadedFile.url,
			pdfName: uploadedFile.fileName,
			fileKey: uploadedFile.fileKey,
			userId: req.user,
		},
	});


	return res.status(200).json({
		status: true,
		message: 'PDF uploaded successfully.',
		data: {
			chatDoc: chatPdfDoc,
		},
	});
});
