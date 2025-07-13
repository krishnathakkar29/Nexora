'use client';
import { fetchAPI } from '@/lib/fetch-api';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { useCallback, useRef, useState, useTransition } from 'react';
import { HiCursorClick } from 'react-icons/hi';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { FormElementInstance, FormElements } from './builder/form-element';

function FormSubmitComponent({ formUrl, content }: { content: FormElementInstance[]; formUrl: string }) {
	const [renderKey, setRenderKey] = useState(new Date().getTime());
	const formValues = useRef<{ [key: string]: string }>({});
	const formErrors = useRef<{ [key: string]: boolean }>({});

	const [submitted, setSubmitted] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [pending, startTransition] = useTransition();

	const validateForm: () => boolean = useCallback(() => {
		for (const field of content) {
			const actualValue = formValues.current[field.id] || '';
			const valid = FormElements[field.type].validate(field, actualValue);

			if (!valid) {
				formErrors.current[field.id] = true;
			}
		}

		if (Object.keys(formErrors.current).length > 0) {
			return false;
		}

		return true;
	}, [content]);

	const submitValue = useCallback((key: string, value: string) => {
		formValues.current[key] = value;
	}, []);

	const { mutate: mutateSubmitForm, isPending } = useMutation({
		mutationKey: ['submit-form'],
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		mutationFn: async (data: any) => {
			const response = await fetchAPI({
				url: '/form/submit',
				body: data,
				method: 'POST',
				requireAuth: true,
			});
			if (!response.success) {
				throw new Error(response.message || 'Failed to create form');
			}

			return response.data;
		},
	});

	const submitForm = async () => {
		formErrors.current = {};
		const validForm = validateForm();
		if (!validForm) {
			setRenderKey(new Date().getTime());
			toast.error('Please check form for errors and try again');
			return;
		}

		try {
			const jsonContent = JSON.stringify(formValues.current);
			const data = {
				formUrl,
				content: jsonContent,
			};
			await mutateSubmitForm(data, {
				onSuccess: () => {
					toast.success('Form submitted successfully');
					setSubmitted(true);
				},
			});
			setSubmitted(true);
		} catch (error) {
			console.error(error);
			toast.error('Something went wrong');
		}
	};

	if (submitted) {
		return (
			<div className="flex justify-center w-full h-full items-center p-8">
				<div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded">
					<h1 className="text-2xl font-bold">Form submitted</h1>
					<p className="text-muted-foreground">Thank you for submitting the form, you can close this page now.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex justify-center w-full h-full items-center p-8">
			<div
				key={renderKey}
				className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded"
			>
				{content.map((element) => {
					const FormElement = FormElements[element.type].formComponent;
					return (
						<FormElement
							key={element.id}
							elementInstance={element}
							submitValue={submitValue}
							isInvalid={formErrors.current[element.id]}
							defaultValue={formValues.current[element.id]}
						/>
					);
				})}
				<Button
					className="mt-8"
					onClick={() => {
						startTransition(submitForm);
					}}
					disabled={isPending}
				>
					{!isPending && (
						<>
							<HiCursorClick className="mr-2" />
							Submit
						</>
					)}
					{isPending && <ImSpinner2 className="animate-spin" />}
				</Button>
			</div>
		</div>
	);
}

export default FormSubmitComponent;
