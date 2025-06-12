'use client';
import useDesigner from '@/hooks/use-designer';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Form } from '@workspace/db';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import PreviewDialogBtn from './action-buttons/preview-dialog-btn';
import PublishFormBtn from './action-buttons/publish-form-btn';
import SaveFormBtn from './action-buttons/save-form-btn';
import DragOverlayWrapper from './drag-overlay-wrapper';
import { toast } from 'sonner';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import Link from 'next/link';
import Designer from './designer';

function FormBuider({ form }: { form: Form }) {
	const { setElements, setSelectedElement } = useDesigner();
	const [isReady, setIsReady] = useState(false);

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10, // 10px
		},
	});

	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: {
			delay: 300,
			tolerance: 5,
		},
	});

	const sensors = useSensors(mouseSensor, touchSensor);

	useEffect(() => {
		if (isReady) {
			return;
		}
		const elements = JSON.parse(form.content);
		setElements(elements);
		setSelectedElement(null);
		const readyTimeout = setTimeout(() => setIsReady(true), 500);
		return () => clearTimeout(readyTimeout);
	}, [form, setElements, isReady, setSelectedElement]);

	if (!isReady) {
		return (
			<div className="flex flex-col items-center justify-center w-full h-full">
				<Loader2 className="animate-spin h-12 w-12" />
			</div>
		);
	}

	const shareUrl = `${window.location.origin}/submit/${form.shareUrl}`;

	if (form.published) {
		return (
			<>
				<div className="flex flex-col items-center justify-center min-h-screen max-h-screen w-full">
					<div className="max-w-md">
						<h1 className="text-center text-4xl font-bold text-primary border-b pb-2 mb-10">
							🎊🎊 Form Published 🎊🎊
						</h1>
						<h2 className="text-2xl">Share this form</h2>
						<h3 className="text-xl text-muted-foreground border-b pb-10">
							Anyone with the link can view and submit the form
						</h3>
						<div className="my-4 flex flex-col gap-2 items-center w-full border-b pb-4">
							<Input className="w-full" readOnly value={shareUrl} />
							<Button
								className="mt-2 w-full"
								onClick={() => {
									navigator.clipboard.writeText(shareUrl);
									toast.success('Link copied to clipboard');
								}}
							>
								Copy link
							</Button>
						</div>
						<div className="flex justify-between">
							<Button variant={'link'} asChild>
								<Link href={'/'} className="gap-2">
									<BsArrowLeft />
									Go back home
								</Link>
							</Button>
							<Button variant={'link'} asChild>
								<Link href={`/forms/${form.id}`} className="gap-2">
									Form details
									<BsArrowRight />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</>
		);
	}
	return (
		<DndContext sensors={sensors}>
			<main className="flex flex-col w-full min-h-screen max-h-screen">
				<nav className="flex justify-between border-b-2 p-4 gap-3 items-center">
					<h2 className="truncate font-medium">
						<span className="text-muted-foreground mr-2">Form:</span>
						{form.name}
					</h2>
					<div className="flex items-center gap-2">
						<PreviewDialogBtn />
						{!form.published && (
							<>
								<SaveFormBtn id={form.id} />
								<PublishFormBtn id={form.id} />
							</>
						)}
					</div>
				</nav>
				<div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[200px] bg-accent bg-[url(/paper.svg)] dark:bg-[url(/dark-paper.svg)]">
					<Designer />
				</div>
			</main>
			<DragOverlayWrapper />
		</DndContext>
	);
}

export default FormBuider;
