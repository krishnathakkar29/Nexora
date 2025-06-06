export type BulkMailArr = {
	name: string;
	email: string;
	companyname: string;
	platform?: string;
	body: string;
	subject: string;
};

export type PDFPage = {
	pageContent: string;
	metadata: {
		loc: {
			pageNumber: number;
		};
	};
};
