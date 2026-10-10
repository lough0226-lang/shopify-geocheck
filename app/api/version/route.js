export async function GET() {
  return Response.json({ 
    version: 'v31-brevo-email-fix',
    time: new Date().toISOString()
  });
}
