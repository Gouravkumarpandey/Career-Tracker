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
    const list = await openai.models.list();
    console.log("Success! Models:", list.data.map(m => m.id));
  } catch (error) {
    console.error("Error fetching models:", error.message);
  }
}

test();

