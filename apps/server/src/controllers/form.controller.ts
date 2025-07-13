import { AsyncHandler } from '@/middlewares/error.js';
import ErrorHandler from '@/utils/errorHandler.js';
import { prisma } from '@workspace/db';

export const getFormStats = AsyncHandler(async (req, res) => {
	const stats = await prisma.form.aggregate({
		where: {
			userId: req.user,
		},
		_count: {
			visits: true,
			submissions: true,
		},
	});

	const visits = stats._count.visits || 0;
	const submissions = stats._count.submissions || 0;

	let submissionRate = 0;

	if (visits > 0) {
		submissionRate = (submissions / visits) * 100;
	}

	const bounceRate = 100 - submissionRate;

	return res.status(200).json({
		success: true,
		message: 'Form stats fetched successfully',
		data: {
			visits,
			submissions,
			submissionRate: submissionRate.toFixed(2),
			bounceRate: bounceRate.toFixed(2),
		},
	});
});

export const createForm = AsyncHandler(async (req, res, next) => {
	const { name, description } = req.body;
	const form = await prisma.form.create({
		data: {
			name,
			description,
			userId: req.user,
		},
	});

	if (!form) {
		return next(new ErrorHandler(400, 'Something went wrong while creating form'));
	}

	return res.status(201).json({
		success: true,
		message: 'Form created successfully',
		data: {
			formId: form.id,
		},
	});
});

export const getFormByID = AsyncHandler(async (req, res, next) => {
	const { id } = req.params;
	if (!id) {
		return next(new ErrorHandler(400, 'Form ID is required'));
	}

	const form = await prisma.form.findUnique({
		where: {
			id: Number(id),
			userId: req.user,
		},
	});

	if (!form) {
		return next(new ErrorHandler(404, 'Form not found'));
	}
	return res.status(200).json({
		success: true,
		message: 'Form fetched successfully',
		data: form,
	});
});

export const updateForm = AsyncHandler(async (req, res) => {
	const { id, content: jsonContent } = req.body;

	await prisma.form.update({
		where: {
			id: Number(id),
			userId: req.user,
		},
		data: {
			content: jsonContent,
		},
	});

	return res.status(200).json({
		success: true,
		message: 'Form updated successfully',
		data: {
			formId: id,
		},
	});
});

export const publishForm = AsyncHandler(async (req, res, next) => {
	const { id } = req.body;

	if (!id) {
		return next(new ErrorHandler(400, 'Form ID is required'));
	}

	const form = await prisma.form.update({
		where: {
			id: Number(id),
			userId: req.user,
		},
		data: {
			published: true,
		},
	});

	return res.status(200).json({
		success: true,
		message: 'Form published successfully',
		data: {
			formId: form.id,
		},
	});
});

export const getFormSubmissions = AsyncHandler(async (req, res, next) => {
	const { id } = req.params;

	if (!id) {
		return next(new ErrorHandler(400, 'Form ID is required'));
	}

	const submissions = await prisma.form.findUnique({
		where: {
			id: Number(id),
			userId: req.user,
		},
		include: {
			FormSubmission: true,
		},
	});

	if (!submissions) {
		return next(new ErrorHandler(404, 'No submissions found for this form'));
	}

	return res.status(200).json({
		success: true,
		message: 'Form submissions fetched successfully',
		data: submissions,
	});
});

export const getContentByUrl = AsyncHandler(async (req, res, next) => {
	const { formUrl } = req.params;

	if (!formUrl) {
		return next(new ErrorHandler(400, 'Form URL is required'));
	}

	const form = await prisma.form.update({
		select: {
			content: true,
		},
		data: {
			visits: {
				increment: 1,
			},
		},
		where: {
			shareUrl: formUrl,
		},
	});

	if (!form) {
		return next(new ErrorHandler(404, 'Form not found'));
	}

	return res.status(200).json({
		success: true,
		message: 'Form content fetched successfully',
		data: {
			content: form.content,
		},
	});
});

export const submitForm = AsyncHandler(async (req, res, next) => {
	const { formUrl, content } = req.body;

	if (!formUrl || !content) {
		return next(new ErrorHandler(400, 'Form URL and content are required'));
	}

	const form = await prisma.form.update({
		data: {
			submissions: {
				increment: 1,
			},
			FormSubmission: {
				create: {
					content,
				},
			},
		},
		where: {
			shareUrl: formUrl,
			published: true,
		},
	});

	if (!form) {
		return next(new ErrorHandler(404, 'Form not found or not published'));
	}

	return res.status(200).json({
		success: true,
		message: 'Form submitted successfully',
		data: {
			formId: form.id,
		},
	});
});

export const getAllUserForms = AsyncHandler(async (req, res) => {
	const forms = await prisma.form.findMany({
		where: {
			userId: req.user,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
	console.log(forms);
	return res.status(200).json({
		success: true,
		message: 'Forms fetched successfully',
		data: forms,
	});
});
