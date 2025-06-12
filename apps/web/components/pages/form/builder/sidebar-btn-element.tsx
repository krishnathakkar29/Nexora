import React from 'react';
import { FormElement } from './form-element';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useDraggable } from '@dnd-kit/core';

function SidebarBtnElement({ formElement }: { formElement: FormElement }) {
	const { icon: Icon, label } = formElement.designerBtnElement;
	const draggable = useDraggable({
		id: `designer-btn-${formElement.type}`,
		data: {
			type: formElement.type,
			isDesignerBtnElement: true,
		},
	});
	return (
		<Button
			ref={draggable.setNodeRef}
			variant={'outline'}
			className={cn(
				'flex flex-col gap-3 h-[120px] w-[120px] cursor-grab',
				draggable.isDragging && 'ring-2 ring-primary',
			)}
			{...draggable.attributes}
			{...draggable.listeners}
		>
			<Icon className="h-8 w-8 text-primary cursor-grab" />
			<p className="text-xs">{label}</p>
		</Button>
	);
}

export function SidebarBtnElementDragOverlay({ formElement }: { formElement: FormElement }) {
	const { icon: Icon, label } = formElement.designerBtnElement;

	return (
		<Button variant={'outline'} className={cn('flex flex-col gap-3 h-[120px] w-[120px] cursor-grab')}>
			<Icon className="h-8 w-8 text-primary cursor-grab" />
			<p className="text-xs">{label}</p>
		</Button>
	);
}
export default SidebarBtnElement;
