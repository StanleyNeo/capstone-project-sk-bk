const { OpenAI } = require('openai');

async function testOpenAI() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-key-here'
  });
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful AI tutor.' },
        { role: 'user', content: 'What is React?' }
      ],
      temperature: 0.7,
      max_tokens: 200
    });
    
    console.log('✅ OpenAI Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI Error:', error.message);
  }
}

testOpenAI();