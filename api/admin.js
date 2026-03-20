export default async function handler(req, res) {
  const GITHUB_PAT = process.env.GITHUB_PAT;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const REPO = 'mamalivreoficial/mamalivre-web';
  
  // Route determination based on query param
  const type = req.query.type || 'products';
  const PATH = type === 'site' ? 'data/site.json' : 'data/products.json';

  // Security checks
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  if (!GITHUB_PAT && req.method === 'POST') {
    return res.status(500).json({ error: 'Configuração incompleta: Falta a variável GITHUB_PAT no Vercel.' });
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MamaLivre-Admin-Dashboard'
  };
  
  if (GITHUB_PAT) {
    headers.Authorization = `Bearer ${GITHUB_PAT}`;
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}?ref=main`, { headers });
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      
      const fileData = await response.json();
      const contentBase64 = fileData.content;
      // Decode content
      const contentString = Buffer.from(contentBase64, 'base64').toString('utf8');
      const content = JSON.parse(contentString);

      return res.status(200).json({
        sha: fileData.sha,
        content: content
      });

    } else if (req.method === 'POST') {
      const { password, content, sha } = req.body;

      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Senha incorreta!' });
      }

      if (!content || !sha) {
        return res.status(400).json({ error: 'Conteúdo ou SHA inválido ou ausente.' });
      }

      const contentString = JSON.stringify(content, null, 2);
      const contentBase64 = Buffer.from(contentString, 'utf8').toString('base64');

      const body = {
        message: `Update ${type} via Native Admin Dashboard`,
        content: contentBase64,
        sha: sha,
        branch: 'main'
      };

      const putResponse = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });

      if (!putResponse.ok) {
        const errorData = await putResponse.json();
        throw new Error(errorData.message || 'Erro ao salvar no GitHub');
      }

      const putData = await putResponse.json();

      return res.status(200).json({
        success: true,
        newSha: putData.content.sha
      });
    }

  } catch (error) {
    console.error('API /admin error:', error);
    return res.status(500).json({ error: error.message });
  }
}
