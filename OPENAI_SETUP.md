# Setting up OpenAI API Key

## For Local Development:
1. Create a file `functions/.env` (this file is gitignored)
2. Add your API key: `OPENAI_API_KEY=your_actual_api_key_here`
3. The function will automatically use it when running locally

## For Production:
Use Firebase's secrets manager when deploying (requires Firebase CLI v11+)

## Security Notes:
- Never commit your actual API key to git
- The `.env` file is automatically gitignored
- Use environment variables or Firebase secrets for production 