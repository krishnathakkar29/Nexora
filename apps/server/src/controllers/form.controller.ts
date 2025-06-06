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
