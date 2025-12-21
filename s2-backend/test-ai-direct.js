require('dotenv').config();
const axios = require('axios');

async function testAllProviders() {
  console.log('🧪 Testing AI Providers...\n');
  
  // Test Google Gemini
  console.log('1. Testing Google Gemini...');
  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: "Say hello in one word" }]
        }]
      },
      { timeout: 10000 }
    );
    console.log('✅ Gemini:', geminiRes.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.log('❌ Gemini Error:', error.response?.status, error.message);
  }
  
  // Test Hugging Face
  console.log('\n2. Testing Hugging Face...');
  try {
    const hfRes = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2',
      { inputs: "Say hello" },
      {
        headers: { 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        timeout: 10000
      }
    );
    console.log('✅ Hugging Face:', hfRes.data[0].generated_text.substring(0, 50));
  } catch (error) {
    console.log('❌ Hugging Face Error:', error.message);
  }
  
  console.log('\n🎯 Done testing!');
}

testAllProviders();