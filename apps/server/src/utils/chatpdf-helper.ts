import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFPage } from './types.js';
import { Document } from 'langchain/document';
import md5 from 'md5';
import { PineconeRecord } from '@pinecone-database/pinecone';
import { getEmbeddings } from './embeddings.js';
import { getPineconeClient } from './pinecone.js';

export const truncateStringByBytes = (str: string, bytes: number) => {
	const enc = new TextEncoder();
	return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

export async function prepareDocument(page: PDFPage) {
	const { pageContent, metadata } = page;
	const cleanedPageContent = pageContent.replace(/\n/g, '');
	// splitting the docs
	const splitter = new RecursiveCharacterTextSplitter();
	const docs = await splitter.splitDocuments([
		new Document({
			pageContent: cleanedPageContent,
			metadata: {
				pageNumber: metadata.loc.pageNumber,
				text: truncateStringByBytes(cleanedPageContent, 36000),
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
	console.log('converting to ascii', inputString);
	const asciiString = inputString.replace(/[^\x00-\x7F]/g, ''); // eslint-disable-line no-control-regex
	return asciiString;
}

export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
	try {
		const client = getPineconeClient();
		const pineconeIndex = await client.index('nexi');
		console.log(fileKey, 'fileKey');
		const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
		const queryResult = await namespace.query({
			topK: 5,
			vector: embeddings,
			includeMetadata: true,
		});
		return queryResult.matches || [];
	} catch (error) {
		console.log('error querying embeddings', error);
		throw error;
	}
}

export async function getContext(query: string, fileKey: string) {
	const queryEmbeddings = await getEmbeddings(query);
	console.log('fileKey', fileKey);
	const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

	// Note: qualifyingDocs filtering removed as it was unused
	// const qualifyingDocs = matches.filter((match) => match.score && match.score > 0.1);

	type Metadata = {
		text: string;
		pageNumber: number;
	};

	const docs = matches.map((match) => (match.metadata as Metadata).text);
	// 5 vectors
	return docs.join('\n').substring(0, 3000);
}
