const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const CLIENT_ID = process.env.GITHUB_CLIENT_ID; 
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET; 
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://github-devinsights.vercel.app/callback'; 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user,repo`;
  res.redirect(githubAuthUrl);
});

// Callback route to exchange code for token
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    if (data.error) {
      return res.status(400).send(`Error: ${data.error_description}`);
    }

    const accessToken = data.access_token;
    res.redirect(`/#access_token=${accessToken}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error during authentication');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
