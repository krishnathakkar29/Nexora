import Loader from '@/components/loader';
import React from 'react';

function loading() {
	return (
		<div className="h-full w-full flex items-center justify-center">
			<Loader />
		</div>
	);
}

export default loading;
