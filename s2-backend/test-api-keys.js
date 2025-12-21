const axios = require('axios');

const keys = {
  gemini: 'AIzaSyAMk6OHyZ5jchHHj-iF2L97J8ONlYTPLLc',
  deepseek: 'sk-e4900631998d46348b76af09110399ad',
  openai: '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'
};

async function testGemini() {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys.gemini}`,
      {
        contents: [{ role: 'user', parts: [{ text: 'Say Hello if working' }] }],
        generationConfig: { maxOutputTokens: 10 }
      },
      { timeout: 5000 }
    );
    console.log('✅ Gemini: Working');
    return true;
  } catch (error) {
    console.log(`❌ Gemini: ${error.response?.status || error.code}`);
    return false;
  }
}

async function testDeepSeek() {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Say Hello' }],
        max_tokens: 10
      },
      {
        headers: { 'Authorization': `Bearer ${keys.deepseek}` },
        timeout: 5000
      }
    );
    console.log('✅ DeepSeek: Working');
    return true;
  } catch (error) {
    console.log(`❌ DeepSeek: ${error.response?.status || error.code}`);
    return false;
  }
}

async function testOpenAI() {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say Hello' }],
        max_tokens: 10
      },
      {
        headers: { 'Authorization': `Bearer ${keys.openai}` },
        timeout: 5000
      }
    );
    console.log('✅ OpenAI: Working');
    return true;
  } catch (error) {
    console.log(`❌ OpenAI: ${error.response?.data?.error?.code || error.code}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing API Keys...\n');
  
  const geminiOk = await testGemini();
  const deepseekOk = await testDeepSeek();
  const openaiOk = await testOpenAI();
  
  console.log('\n📊 Summary:');
  console.log(`Gemini: ${geminiOk ? '✅' : '❌'}`);
  console.log(`DeepSeek: ${deepseekOk ? '✅' : '❌'}`);
  console.log(`OpenAI: ${openaiOk ? '✅' : '❌'}`);
  
  // Recommendation
  console.log('\n💡 Recommendation:');
  if (deepseekOk && geminiOk) {
    console.log('Use DeepSeek as primary, Gemini as fallback');
  } else if (deepseekOk) {
    console.log('Use DeepSeek only');
  } else if (geminiOk) {
    console.log('Use Gemini only');
  } else {
    console.log('Both keys failed. Need new API keys.');
  }
}

runTests();