
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      {children}
    </div>
  );
}
