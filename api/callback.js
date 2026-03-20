export default async function handler(req, res) {
  const { code } = req.query;

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return res.status(500).send('Missing code or OAuth credentials in Vercel environment.');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();
    const token = data.access_token;

    if (!token) {
      return res.status(500).send('Authentication failed: No token received.');
    }

    // Decap CMS requires a specific popup postMessage to consume the token
    const script = `
      <script>
        const receiveMessage = (message) => {
          if (!message.origin.includes('mamalivre.com.br') && !message.origin.includes('localhost')) {
            return;
          }
          window.opener.postMessage(
            'authorization:github:success:{"token":"${token}","provider":"github"}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(script);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Authentication failed.');
  }
}
