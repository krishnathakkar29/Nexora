'use client';

import { Label } from '@workspace/ui/components/label';
import { Separator } from '@workspace/ui/components/separator';
import { RiSeparator } from 'react-icons/ri';
import { ElementsType, FormElement, FormElementInstance } from '../builder/form-element';

const type: ElementsType = 'SeparatorField';

export const SeparatorFieldFormElement: FormElement = {
	type,
	construct: (id: string) => ({
		id,
		type,
	}),
	designerBtnElement: {
		icon: RiSeparator,
		label: 'Separator field',
	},
	designerComponent: DesignerComponent,
	formComponent: FormComponent,
	propertiesComponent: PropertiesComponent,

	validate: () => true,
};

function DesignerComponent({}: { elementInstance: FormElementInstance }) {
	return (
		<div className="flex flex-col gap-2 w-full">
			<Label className="text-muted-foreground">Separator field</Label>
			<Separator />
		</div>
	);
}

function FormComponent({}: { elementInstance: FormElementInstance }) {
	return <Separator />;
}

function PropertiesComponent({}: { elementInstance: FormElementInstance }) {
	return <p>No properties for this element</p>;
}
