import type { Config } from '@netlify/functions';

export default async (req: Request) => {
  const { action, zoneId } = await req.json();

  const mainValveState = action === 'close' || action === 'open' || action === 'auto_locked' ? action : 'open';

  return Response.json({
    success: true,
    mainValveState,
    zoneId: zoneId || 'all',
    timestamp: new Date().toISOString(),
  });
};

export const config: Config = {
  path: '/api/valve/toggle',
  method: 'POST',
};
