import useDesigner from '@/hooks/use-designer';
import React from 'react';
import { FormElements } from './form-element';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { AiOutlineClose } from 'react-icons/ai';

function PropertiesFormSidebar() {
	const { selectedElement, setSelectedElement } = useDesigner();

	if (!selectedElement) {
		return null;
	}
	const PropertiesForm = FormElements[selectedElement?.type].propertiesComponent;

	return (
		<div className="flex flex-col p-2">
			<div className="flex justify-between items-center">
				<p className="text-sm text-foreground/70">Element properties</p>
				<Button
					size={'icon'}
					variant={'ghost'}
					onClick={() => {
						setSelectedElement(null);
					}}
				>
					<AiOutlineClose />
				</Button>
			</div>
			<Separator className="mb-4" />
			<PropertiesForm elementInstance={selectedElement} />
		</div>
	);
}

export default PropertiesFormSidebar;
