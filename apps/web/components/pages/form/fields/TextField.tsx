'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@workspace/ui/hooks/form';
import { useForm } from '@workspace/ui/hooks/form';
import { MdTextFields } from 'react-icons/md';
import { z } from 'zod';
import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '../builder/form-element';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';
import useDesigner from '@/hooks/use-designer';

const type: ElementsType = 'TextField';

const extraAttributes = {
	label: 'Text field',
	helperText: 'Helper text',
	required: false,
	placeHolder: 'Value here...',
};

export const TextFieldFormElement: FormElement = {
	type,

	construct: (id: string) => ({
		id,
		type,
		extraAttributes,
	}),
	designerBtnElement: {
		icon: MdTextFields,
		label: 'Text Field',
	},
	designerComponent: DesignerComponent,
	propertiesComponent: PropertiesComponent,
	formComponent: FormComponent,

	validate: (formElement: FormElementInstance, currentValue: string): boolean => {
		const element = formElement as CustomInstance;
		if (element.extraAttributes.required) {
			return currentValue.length > 0;
		}

		return true;
	},
};

type CustomInstance = FormElementInstance & {
	extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
	const element = elementInstance as CustomInstance;
	const { label, placeHolder, helperText, required } = element.extraAttributes;
	return (
		<div className="flex flex-col gap-2 w-full">
			<Label className={cn('')}>
				{label}
				{required && '*'}
			</Label>
			<Input readOnly disabled placeholder={placeHolder} />
			{helperText && <p className={cn('text-muted-foreground text-[0.8rem]')}>{helperText}</p>}
		</div>
	);
}

const propertiesSchema = z.object({
	label: z.string().min(2).max(50),
	helperText: z.string().max(200),
	required: z.boolean().default(false),
	placeHolder: z.string().max(50),
});
type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
	const element = elementInstance as CustomInstance;
	const { updateElement } = useDesigner();
	const form = useForm<PropertiesFormSchemaType, any, PropertiesFormSchemaType>({
		resolver: zodResolver(propertiesSchema),
		mode: 'onBlur',
		defaultValues: {
			label: element.extraAttributes.label,
			helperText: element.extraAttributes.helperText,
			required: element.extraAttributes.required,
			placeHolder: element.extraAttributes.placeHolder,
		},
	});

	useEffect(() => {
		form.reset(element.extraAttributes);
	}, [element, form]);

	function applyChanges(values: PropertiesFormSchemaType) {
		const { label, helperText, placeHolder, required } = values;
		updateElement(element.id, {
			...element,
			extraAttributes: {
				label,
				helperText,
				placeHolder,
				required,
			},
		});
	}
	return (
		<Form {...form}>
			<form
				onBlur={form.handleSubmit(applyChanges)}
				onSubmit={(e) => {
					e.preventDefault();
				}}
				className="space-y-3"
			>
				<FormField
					control={form.control}
					name="label"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Label</FormLabel>
							<FormControl>
								<Input
									{...field}
									onKeyDown={(e) => {
										if (e.key === 'Enter') e.currentTarget.blur();
									}}
								/>
							</FormControl>
							<FormDescription>
								The label of the field. <br /> It will be displayed above the field
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="placeHolder"
					render={({ field }) => (
						<FormItem>
							<FormLabel>PlaceHolder</FormLabel>
							<FormControl>
								<Input
									{...field}
									onKeyDown={(e) => {
										if (e.key === 'Enter') e.currentTarget.blur();
									}}
								/>
							</FormControl>
							<FormDescription>The placeholder of the field.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="helperText"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Helper text</FormLabel>
							<FormControl>
								<Input
									{...field}
									onKeyDown={(e) => {
										if (e.key === 'Enter') e.currentTarget.blur();
									}}
								/>
							</FormControl>
							<FormDescription>
								The helper text of the field. <br />
								It will be displayed below the field.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="required"
					render={({ field }) => (
						<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
							<div className="space-y-0.5">
								<FormLabel>Required</FormLabel>
								<FormDescription>
									The helper text of the field. <br />
									It will be displayed below the field.
								</FormDescription>
							</div>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}

function FormComponent({
	elementInstance,
	submitValue,
	isInvalid,
	defaultValue,
}: {
	elementInstance: FormElementInstance;
	submitValue?: SubmitFunction;
	isInvalid?: boolean;
	defaultValue?: string;
}) {
	const element = elementInstance as CustomInstance;

	const [value, setValue] = useState(defaultValue || '');
	const [error, setError] = useState(false);

	useEffect(() => {
		setError(isInvalid === true);
	}, [isInvalid]);

	const { label, required, placeHolder, helperText } = element.extraAttributes;
	return (
		<div className="flex flex-col gap-2 w-full">
			<Label className={cn(error && 'text-red-500')}>
				{label}
				{required && '*'}
			</Label>
			<Input
				className={cn(error && 'border-red-500')}
				placeholder={placeHolder}
				onChange={(e) => setValue(e.target.value)}
				onBlur={(e) => {
					if (!submitValue) return;
					const valid = TextFieldFormElement.validate(element, e.target.value);
					setError(!valid);
					if (!valid) return;
					submitValue(element.id, e.target.value);
				}}
				value={value}
			/>
			{helperText && <p className={cn('text-muted-foreground text-[0.8rem]', error && 'text-red-500')}>{helperText}</p>}
		</div>
	);
}
