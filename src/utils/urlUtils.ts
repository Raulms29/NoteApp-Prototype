// Utility function to validate URLs
export const isAllowedUri = (url: string): boolean => {
    const allowedProtocols = ['http', 'https', 'mailto'];
    return allowedProtocols.some((protocol) => url.startsWith(`${protocol}:`));
};
