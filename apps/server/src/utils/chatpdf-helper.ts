import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFPage } from './types.js';
import { Document } from 'langchain/document';
import md5 from 'md5';
import { PineconeRecord } from '@pinecone-database/pinecone';
import { getEmbeddings } from './embeddings.js';

export const truncateStringByBytes = (str: string, bytes: number) => {
	const enc = new TextEncoder();
	return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

export async function prepareDocument(page: PDFPage) {
	let { pageContent, metadata } = page;
	pageContent = pageContent.replace(/\n/g, '');
	// splitting the docs
	const splitter = new RecursiveCharacterTextSplitter();
	const docs = await splitter.splitDocuments([
		new Document({
			pageContent,
			metadata: {
				pageNumber: metadata.loc.pageNumber,
				text: truncateStringByBytes(pageContent, 36000),
			},
		}),
	]);

	return docs;
}

export async function embedDocument(doc: Document) {
	try {
		const embeddings = await getEmbeddings(doc.pageContent);
		const hash = md5(doc.pageContent);
		return {
			id: hash,
			values: embeddings,
			metadata: {
				text: doc.metadata.text,
				pageNumber: doc.metadata.pageNumber,
			},
		} as PineconeRecord;
	} catch (error) {
		console.log('error embedding document', error);
		throw error;
	}
}

export function convertToAscii(inputString: string) {
	// remove non ascii characters
	const asciiString = inputString.replace(/[^\x00-\x7F]+/g, '');
	return asciiString;
}
