import { redirect } from 'next/navigation';

async function page() {
	redirect('/form');
	return null;
}

export default page;
