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

export const updateForm = AsyncHandler(async (req, res, next) => {
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
