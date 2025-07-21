import { Lexend } from 'next/font/google';

import '@workspace/ui/globals.css';
// import "@/app/globals.css"
import QueryProviderWrapper from '@/components/wrappers/query-provider';
import { Toaster } from '@workspace/ui/components/sonner';
import { Metadata } from 'next';

const lexend = Lexend({
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Nexora',
	description:
		'Nexora - A platform to outreach and manage efficiently , make dynamic forms and assistant for your queries.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body className={` ${lexend.className} antialiased min-h-dvh`}>
				<QueryProviderWrapper>
					{children}
					<Toaster
						position="bottom-right"
						expand={true}
						richColors
						theme="dark"
						closeButton
						style={{ marginBottom: '20px' }}
					/>
				</QueryProviderWrapper>
			</body>
		</html>
	);
}
