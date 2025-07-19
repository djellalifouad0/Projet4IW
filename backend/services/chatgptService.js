const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const chatgptCheckContacts = async (messageText) => {
  const prompt = `
Tu es un assistant de modération. Réponds uniquement par "oui" ou "non".
Est-ce que ce message contient un échange de coordonnées personnelles (comme un email, numéro de téléphone, identifiant de réseau social, lien externe, etc.) reponds par oui ou non ni plus ni moins?
Message : "${messageText}"
Réponse :
  `.trim();
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1,
      temperature: 0,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  const reply = response.data.choices[0].message.content.trim().toLowerCase();
  return  response.data.choices[0].message.content.includes('O');
};

module.exports = { chatgptCheckContacts };
