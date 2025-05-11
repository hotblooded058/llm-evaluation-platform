# LLM Evaluation Platform

A web application for evaluating and comparing responses from different Large Language Models (LLMs) against a dataset of questions and answers.

## Features

- Upload and manage datasets in CSV format
- Create and manage prompt templates
- Run evaluations using multiple LLM providers (Gemini and Groq)
- View detailed evaluation results with correctness and faithfulness scores
- Compare responses from different LLM models

## Tech Stack

- Frontend: React with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- LLM Integration: Google Gemini and Groq APIs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Gemini API key
- Groq API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI= MONGODB_URI_KEY
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

4. Create the uploads directory:
```bash
mkdir backend/uploads
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. Upload a dataset in CSV format
2. Create a prompt template
3. Run an evaluation by selecting a dataset and prompt
4. View the evaluation results and compare LLM responses

## License

MIT 