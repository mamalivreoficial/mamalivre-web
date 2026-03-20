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

    const script = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autenticando...</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #111; color: #fff; margin: 0; }
        </style>
      </head>
      <body>
        <div><h2>Autenticado! Redirecionando...</h2><p>Pode fechar esta janela se não sumir sozinha.</p></div>
        <script>
          (function() {
            function sendToken() {
              if (window.opener) {
                // Send the success message to the parent window
                window.opener.postMessage(
                  'authorization:github:success:{"token":"${token}","provider":"github"}',
                  "*"
                );
              }
            }
            
            // Try immediately
            sendToken();
            
            // Also try when receiving a ping from the CMS
            window.addEventListener("message", function(e) {
              if (e.data === "authorizing:github" || e.data && e.data.match(/authorizing/)) {
                sendToken();
              }
            }, false);
          })();
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(script);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Authentication failed.');
  }
}
