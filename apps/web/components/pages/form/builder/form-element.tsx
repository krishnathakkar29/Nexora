import { NumberFieldFormElement } from '@/components/pages/form/fields/NumberField';
import { ParagprahFieldFormElement } from '@/components/pages/form/fields/ParagraphField';
import { SeparatorFieldFormElement } from '@/components/pages/form/fields/SeparatorField';
import { SpacerFieldFormElement } from '@/components/pages/form/fields/SpacerField';
import { SubTitleFieldFormElement } from '@/components/pages/form/fields/SubTitleField';
import { TextAreaFormElement } from '@/components/pages/form/fields/TextAreaField';
import { TextFieldFormElement } from '@/components/pages/form/fields/TextField';
import { TitleFieldFormElement } from '@/components/pages/form/fields/TitleField';
import React from 'react';
import { CheckboxFieldFormElement } from '../fields/CheckBoxField';
import { SelectFieldFormElement } from '../fields/SelectField';

export type ElementsType =
	| 'TextField'
	| 'TitleField'
	| 'SubTitleField'
	| 'ParagraphField'
	| 'SeparatorField'
	| 'SpacerField'
	| 'NumberField'
	| 'TextAreaField'
	| 'CheckboxField'
	| 'SelectField';

export type FormElementInstance = {
	id: string;
	type: ElementsType;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	extraAttributes?: Record<string, any>;
};

export type SubmitFunction = (key: string, value: string) => void;

export type FormElement = {
	construct: (id: string) => FormElementInstance;

	designerBtnElement: {
		icon: React.ElementType;
		label: string;
	};

	type: ElementsType;
	designerComponent: React.FC<{
		elementInstance: FormElementInstance;
	}>;
	formComponent: React.FC<{
		elementInstance: FormElementInstance;
		submitValue?: SubmitFunction;
		isInvalid?: boolean;
		defaultValue?: string;
	}>;
	propertiesComponent: React.FC<{
		elementInstance: FormElementInstance;
	}>;
	validate: (formElement: FormElementInstance, currentValue: string) => boolean;
};

type FormElementsType = {
	[key in ElementsType]: FormElement;
};

export const FormElements: FormElementsType = {
	TextField: TextFieldFormElement,
	TitleField: TitleFieldFormElement,
	SubTitleField: SubTitleFieldFormElement,
	ParagraphField: ParagprahFieldFormElement,
	SeparatorField: SeparatorFieldFormElement,
	SpacerField: SpacerFieldFormElement,
	NumberField: NumberFieldFormElement,
	TextAreaField: TextAreaFormElement,
	CheckboxField: CheckboxFieldFormElement,
	SelectField: SelectFieldFormElement,
};
