'use client';

import useDesigner from '@/hooks/use-designer';
import { Label } from '@workspace/ui/components/label';
import { useForm, zodResolver } from '@workspace/ui/hooks/form';
import { useEffect } from 'react';
import { z } from 'zod';
import { ElementsType, FormElement, FormElementInstance } from '../builder/form-element';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';
import { Slider } from '@workspace/ui/components/slider';
import { LuSeparatorHorizontal } from 'react-icons/lu';

const type: ElementsType = 'SpacerField';

const extraAttributes = {
	height: 20, // px
};

const propertiesSchema = z.object({
	height: z.number().min(5).max(200),
});

export const SpacerFieldFormElement: FormElement = {
	type,
	construct: (id: string) => ({
		id,
		type,
		extraAttributes,
	}),
	designerBtnElement: {
		icon: LuSeparatorHorizontal,
		label: 'Spacer field',
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
	const { height } = element.extraAttributes;
	return (
		<div className="flex flex-col gap-2 w-full items-center">
			<Label className="text-muted-foreground">Spacer field: {height}px</Label>
			<LuSeparatorHorizontal className="h-8 w-8" />
		</div>
	);
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
	const element = elementInstance as CustomInstance;

	const { height } = element.extraAttributes;
	return <div style={{ height, width: '100%' }}></div>;
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
	const element = elementInstance as CustomInstance;
	const { updateElement } = useDesigner();
	const form = useForm<propertiesFormSchemaType>({
		resolver: zodResolver(propertiesSchema),
		mode: 'onBlur',
		defaultValues: {
			height: element.extraAttributes.height,
		},
	});

	useEffect(() => {
		form.reset(element.extraAttributes);
	}, [element, form]);

	function applyChanges(values: propertiesFormSchemaType) {
		const { height } = values;
		updateElement(element.id, {
			...element,
			extraAttributes: {
				height,
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
					name="height"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Height (px): {form.watch('height')}</FormLabel>
							<FormControl className="pt-2">
								<Slider
									defaultValue={[field.value]}
									min={5}
									max={200}
									step={1}
									onValueChange={(value) => {
										field.onChange(value[0]);
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
