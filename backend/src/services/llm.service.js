const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Groq } = require('groq-sdk');
require('dotenv').config();


// Initialize LLM clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let groq = null;
let groq2 = null;

// Initialize Groq only if API key is available
if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  groq2 = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

// Rate limiting helper
const rateLimiter = {
  lastRequestTime: 0,
  minDelay: 2000, // 2 seconds between requests
  async wait() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }
};

// Get response from Gemini
async function getGeminiResponse(prompt) {
  try {
    await rateLimiter.wait();
    console.log('Getting response from Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim() === '') {
      console.error('Empty response from Gemini');
      throw new Error('Empty response from Gemini');
    }
    
    console.log('Gemini response received successfully');
    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to get response from Gemini: ${error.message}`);
  }
}

// Get response from Groq
async function getGroqResponse(prompt) {
  if (!groq) {
    console.log('Groq API not configured');
    throw new Error('Groq API key not configured');
  }

  try {
    await rateLimiter.wait();
    console.log('Getting response from Groq...');
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    const response = completion.choices[0].message.content;
    if (!response || response.trim() === '') {
      console.error('Empty response from Groq');
      throw new Error('Empty response from Groq');
    }
    
    console.log('Groq response received successfully');
    return response;
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(`Failed to get response from Groq: ${error.message}`);
  }
}


async function getGroqResponse2(prompt) {
  if (!groq) {
    console.log('Groq API not configured');
    throw new Error('Groq API key not configured');
  }

  try {
    await rateLimiter.wait();
    console.log('Getting response from Groq...');
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    const response = completion.choices[0].message.content;
    if (!response || response.trim() === '') {
      console.error('Empty response from Groq');
      throw new Error('Empty response from Groq');
    }
    
    console.log('Groq response received successfully');
    return response;
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(`Failed to get response from Groq: ${error.message}`);
  }
}
// Get responses from all LLMs in parallel
async function getAllResponses(prompt) {
  try {
    console.log('Getting responses from all LLMs...');
    const responses = {
      gemini: null,
      groq: null,
      groq2: null
    };

    // Get Gemini response
    try {
      console.log('Attempting to get Gemini response...');
      responses.gemini = await getGeminiResponse(prompt);
    } catch (error) {
      console.warn('Failed to get Gemini response:', error.message);
      responses.gemini = `Failed to get response: ${error.message}`;
    }

    // Only try to get Groq response if it's configured
    if (groq) {
      try {
        console.log('Attempting to get Groq response...');
        responses.groq = await getGroqResponse(prompt);
      } catch (error) {
        console.warn('Failed to get Groq response:', error.message);
        responses.groq = `Failed to get response: ${error.message}`;
      }
    } else {
      console.log('Groq API not configured, skipping Groq response');
      responses.groq = 'Groq API not configured';
    }

    if (groq2) {
      try {
        console.log('Attempting to get Groq2 response...');
        responses.groq2 = await getGroqResponse2(prompt);
      } catch (error) {
        console.warn('Failed to get Groq response:', error.message);
        responses.groq2 = `Failed to get response: ${error.message}`;
      }
    } else {
      console.log('Groq API not configured, skipping Groq response');
      responses.groq2 = 'Groq API not configured';
    }



    console.log('All LLM responses received');
    return responses;
  } catch (error) {
    console.error('Error getting responses:', error);
    throw error;
  }
}


// Evaluate response using Gemini as the judge
async function evaluateResponse(response, prompt, context) {
  try {
    await rateLimiter.wait();
    console.log('Starting response evaluation...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const evaluationPrompt = `
      You are an expert evaluator of LLM responses. Evaluate the following response based on the prompt and context:
      
      Prompt: ${prompt}
      Context: ${JSON.stringify(context)}
      Response: ${response}
      
      Rate the response on a scale of 1-10 for:
      1. Correctness: How accurately does it answer the prompt? Consider:
         - Completeness of the answer
         - Accuracy of information
         - Logical coherence
         - Relevance to the prompt
      
      2. Faithfulness: How well does it align with the provided context? Consider:
         - Adherence to context information
         - Consistency with provided data
         - No hallucination or fabrication
         - Proper use of context details
      
      IMPORTANT: Return ONLY the raw JSON object without any markdown formatting or code blocks.
      Example format: {"correctness": 8, "faithfulness": 7}
      Where both scores are integers between 1 and 10.
    `;

    console.log('Sending evaluation request to Gemini...');
    const result = await model.generateContent(evaluationPrompt);
    const evaluation = await result.response;
    const text = evaluation.text().trim();
    
    if (!text || text.trim() === '') {
      console.error('Empty evaluation response from Gemini');
      throw new Error('Empty evaluation response from Gemini');
    }
    
    // Remove any markdown formatting if present
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    console.log('Raw evaluation response:', cleanText);
    
    const scores = JSON.parse(cleanText);
    console.log('Parsed evaluation scores:', scores);
    
    // Validate scores
    if (!scores.correctness || !scores.faithfulness ||
        scores.correctness < 1 || scores.correctness > 10 ||
        scores.faithfulness < 1 || scores.faithfulness > 10) {
      console.error('Invalid scores returned from evaluation:', scores);
      throw new Error('Invalid scores returned from evaluation');
    }
    
    console.log('Evaluation completed successfully');
    return scores;
  } catch (error) {
    console.error('Evaluation error:', error);
    throw new Error(`Failed to evaluate response: ${error.message}`);
  }
}

// Evaluate response using Groq
async function evaluateResponseGroq(response, prompt, context) {
  if (!groq) {
    console.log('Groq API not configured');
    throw new Error('Groq API key not configured');
  }

  try {
    await rateLimiter.wait();
    console.log('Evaluating response with Groq...');
    
    const evaluationPrompt = `
      Evaluate the following response to the prompt:
      
      Prompt: ${prompt}
      Context: ${JSON.stringify(context)}
      Response: ${response}
      
      Rate the response on a scale of 1-10 for:
      1. Correctness: How accurately does it answer the prompt?
      2. Faithfulness: How well does it align with the provided context?
      
      Return ONLY a JSON object in this format: {"correctness": X, "faithfulness": Y}
      Where X and Y are integers between 1 and 10.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: evaluationPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Lower temperature for more consistent evaluations
      max_tokens: 1024,
    });
    
    const evaluationResponse = completion.choices[0].message.content;
    if (!evaluationResponse || evaluationResponse.trim() === '') {
      console.error('Empty evaluation response from Groq');
      throw new Error('Empty evaluation response from Groq');
    }
    
    // Parse the JSON response, handling any markdown formatting
    const scores = JSON.parse(evaluationResponse.replace(/```json\n?|\n?```/g, '').trim());
    
    // Validate scores
    if (typeof scores.correctness !== 'number' || typeof scores.faithfulness !== 'number' ||
        scores.correctness < 1 || scores.correctness > 10 ||
        scores.faithfulness < 1 || scores.faithfulness > 10) {
      throw new Error('Invalid scores returned from evaluation');
    }
    
    console.log('Evaluation completed successfully');
    return scores;
  } catch (error) {
    console.error('Error evaluating response:', error);
    throw new Error(`Failed to evaluate response: ${error.message}`);
  }
}

module.exports = {
  getGeminiResponse,
  getGroqResponse,
  evaluateResponse,
  evaluateResponseGroq,
  getAllResponses,
  getGroqResponse2
}; 