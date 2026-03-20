// This file handles the initial redirect to GitHub
export default function handler(req, res) {
  const { host } = req.headers;
  // Fallback to mamalivre.com.br if host is unavailable in the serverless environment
  const currentHost = host || 'mamalivre.com.br';
  
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send('OAUTH_CLIENT_ID is not configured in Vercel.');
  }

  const redirectUri = `https://${currentHost}/api/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user&redirect_uri=${redirectUri}`;
  
  res.redirect(githubAuthUrl);
}
