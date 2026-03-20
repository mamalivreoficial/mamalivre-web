export default async function handler(req, res) {
  const GITHUB_PAT = process.env.GITHUB_PAT;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MaLivre22$';
  const REPO = 'mamalivreoficial/mamalivre-web';
  const PATH = 'data/products.json';

  // Security checks
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  if (!GITHUB_PAT && req.method === 'POST') {
    return res.status(500).json({ error: 'Configuração incompleta: Falta a chave do GITHUB_PAT.' });
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MamaLivre-Admin-Dashboard' // Required by GitHub API
  };
  
  if (GITHUB_PAT) {
    headers.Authorization = `Bearer ${GITHUB_PAT}`;
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}?ref=main`, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: 'Failed to fetch content from GitHub', details: errorText });
      }
      const data = await response.json();
      const productsJson = Buffer.from(data.content, 'base64').toString('utf8');
      
      return res.status(200).json({ sha: data.sha, content: JSON.parse(productsJson) });
    }

    if (req.method === 'POST') {
      const { password, sha, content } = req.body;
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Senha incorreta!' });
      }

      if (!sha || !content) {
        return res.status(400).json({ error: 'SHA ou conteúdo faltando na requisição.' });
      }

      // Encode content back to base64
      const encodedContent = Buffer.from(JSON.stringify(content, null, 2), 'utf8').toString('base64');
      
      const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'Atualização de Produtos via Painel Admin V2',
          content: encodedContent,
          sha: sha,
          branch: 'main'
        })
      });
      
      if (!response.ok) {
         const err = await response.text();
         return res.status(response.status).json({ error: 'Falha ao salvar no GitHub', details: err });
      }
      
      const data = await response.json();
      return res.status(200).json({ success: true, newSha: data.content.sha });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Erro interno no servidor Vercel', details: error.message });
  }
}
