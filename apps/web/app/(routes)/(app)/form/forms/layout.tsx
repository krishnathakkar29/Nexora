import React, { ReactNode } from 'react';

function layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col w-full h-full">
			<div className="">{children}</div>
		</div>
	);
}

export default layout;
