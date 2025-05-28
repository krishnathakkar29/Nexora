import { isServer, QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnMount: false,
				refetchOnWindowFocus: false,
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
	if (isServer) {
		return makeQueryClient();
	} else {
		if (!browserQueryClient) {
			browserQueryClient = makeQueryClient();
		}

		return browserQueryClient;
	}
}
