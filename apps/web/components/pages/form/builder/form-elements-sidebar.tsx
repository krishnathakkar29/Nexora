import React from 'react';
import SidebarBtnElement from './sidebar-btn-element';
import { FormElements } from './form-element';
import { Separator } from '@workspace/ui/components/separator';

function FormElementsSidebar() {
	return (
		<div>
			<p className="test-sm text-foregroun/70">Drag and Drop elements</p>
			<Separator className="my-2" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2 place-items-center">
				<p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">Layout elements</p>
				<SidebarBtnElement formElement={FormElements.TitleField} />
				<SidebarBtnElement formElement={FormElements.SubTitleField} />
				<SidebarBtnElement formElement={FormElements.ParagraphField} />
				<SidebarBtnElement formElement={FormElements.SeparatorField} />
				<SidebarBtnElement formElement={FormElements.SpacerField} />

				<p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">Form elements</p>
				<SidebarBtnElement formElement={FormElements.TextField} />
				<SidebarBtnElement formElement={FormElements.NumberField} />
				<SidebarBtnElement formElement={FormElements.CheckboxField} />
				<SidebarBtnElement formElement={FormElements.SelectField} />
			</div>
		</div>
	);
}

export default FormElementsSidebar;
