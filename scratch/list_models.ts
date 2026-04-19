import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Fix path to .env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.error("No API Key found in .env. Current dir:", __dirname);
    return;
  }
  
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // List models is not directly in the SDK easily, so we test them one by one
  const testModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro', 'gemini-pro-vision'];
  
  for (const m of testModels) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      // Vision models need parts, text models don't
      const result = await model.generateContent("test");
      console.log(`✅ Model ${m} is WORKING`);
    } catch (e: any) {
      console.log(`❌ Model ${m} FAILED: ${e.message}`);
    }
  }
}

listModels();
