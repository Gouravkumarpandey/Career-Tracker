const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

async function test() {
  console.log("Using API Key:", process.env.GROK_API_KEY ? "Present (Starts with " + process.env.GROK_API_KEY.slice(0, 8) + ")" : "MISSING");
  try {
    const completion = await openai.chat.completions.create({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'Say hello.' },
        { role: 'user', content: 'Hi.' }
      ]
    });
    console.log("Success! Response:", completion.choices[0].message.content);
  } catch (error) {
    console.error("Error from Grok API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    } else {
      console.error(error);
    }
  }
}

test();
