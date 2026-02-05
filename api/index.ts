import { handleApiRequest } from '../server/handler';

export default async function handler(req: any, res: any) {
    const { method, url } = req;
    const urlParts = new URL(url || '', `http://${req.headers.host}`);
    const path = urlParts.pathname;
    const query = Object.fromEntries(urlParts.searchParams);
    const body = req.body;

    console.log(`[Vercel Proxy] ${method} ${path}`);

    try {
        const response = await handleApiRequest(path, method || 'GET', query, body);
        res.status(200).json(response);
    } catch (error: any) {
        console.error('[Vercel Error]', error);
        res.status(error?.status || 500).json({
            message: error?.message || 'Internal Server Error',
            success: false
        });
    }
}
