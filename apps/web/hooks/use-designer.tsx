'use client';
import { DesignerContext } from '@/context/designer-context';
import { useContext } from 'react';

function useDesigner() {
	const context = useContext(DesignerContext);

	if (!context) {
		throw new Error('useDesigner must be used within a DesignerContextProvider');
	}
	return context;
}

export default useDesigner;
