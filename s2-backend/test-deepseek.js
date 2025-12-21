const axios = require('axios');

async function testDeepSeek() {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant.' },
          { role: 'user', content: 'Hello, are you working?' }
        ],
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': 'Bearer sk-e4900631998d46348b76af09110399ad',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ DeepSeek Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ DeepSeek Error:', error.response?.data || error.message);
  }
}

testDeepSeek();