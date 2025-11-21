const users = [{ id: 1, username: 'Rebslotkin', password: 'SA2026' }];
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'pace-admin-token-2024';

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, token: AUTH_TOKEN, username: user.username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
