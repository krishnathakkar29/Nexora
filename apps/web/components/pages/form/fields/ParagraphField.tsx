'use client';

import { Label } from '@workspace/ui/components/label';
import { z } from 'zod';
import { ElementsType, FormElement, FormElementInstance } from '../builder/form-element';

import useDesigner from '@/hooks/use-designer';
import { useForm, zodResolver } from '@workspace/ui/hooks/form';
import { useEffect } from 'react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';
import { Textarea } from '@workspace/ui/components/textarea';
import { BsTextParagraph } from 'react-icons/bs';

const type: ElementsType = 'ParagraphField';

const extraAttributes = {
	text: 'Text here',
};

const propertiesSchema = z.object({
	text: z.string().min(2).max(500),
});

export const ParagprahFieldFormElement: FormElement = {
	type,
	construct: (id: string) => ({
		id,
		type,
		extraAttributes,
	}),
	designerBtnElement: {
		icon: BsTextParagraph,
		label: 'Paragraph field',
	},
	designerComponent: DesignerComponent,
	formComponent: FormComponent,
	propertiesComponent: PropertiesComponent,

	validate: () => true,
};

type CustomInstance = FormElementInstance & {
	extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
	const element = elementInstance as CustomInstance;
	const { text } = element.extraAttributes;
	return (
		<div className="flex flex-col gap-2 w-full">
			<Label className="text-muted-foreground">Paragraph field</Label>
			<p className="truncate">{text}</p>
		</div>
	);
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
	const element = elementInstance as CustomInstance;

	const { text } = element.extraAttributes;
	return <p className="text-muted-foreground">{text}</p>;
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
	const element = elementInstance as CustomInstance;
	const { updateElement } = useDesigner();
	const form = useForm<propertiesFormSchemaType>({
		resolver: zodResolver(propertiesSchema),
		mode: 'onBlur',
		defaultValues: {
			text: element.extraAttributes.text,
		},
	});

	useEffect(() => {
		form.reset(element.extraAttributes);
	}, [element, form]);

	function applyChanges(values: propertiesFormSchemaType) {
		const { text } = values;
		updateElement(element.id, {
			...element,
			extraAttributes: {
				text,
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
					name="text"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Text</FormLabel>
							<FormControl>
								<Textarea
									rows={5}
									{...field}
									onKeyDown={(e) => {
										if (e.key === 'Enter') e.currentTarget.blur();
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
