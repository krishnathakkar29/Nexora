import DesignerContextProvider from '@/context/designer-context';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="w-full h-full">
			<DesignerContextProvider>{children}</DesignerContextProvider>
		</div>
	);
}
