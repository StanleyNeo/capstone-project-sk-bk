// test-openai-key.js
const axios = require('axios');

async function testOpenAIKey() {
  const apiKey = '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';
  
  console.log('🔑 Testing OpenAI API Key...');
  console.log('Key preview:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is 2+2? Answer in one word.' }
        ],
        max_tokens: 10,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ OpenAI Key WORKS!');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('Token usage:', response.data.usage);
    
    return true;
  } catch (error) {
    console.error('❌ OpenAI Key FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 401) {
      console.error('\n🔑 Your OpenAI API key is INVALID!');
      console.error('This key looks like a PROJECT-level key, not a standard API key.');
      console.error('Get a STANDARD API key from: https://platform.openai.com/api-keys');
    }
    
    return false;
  }
}

testOpenAIKey();