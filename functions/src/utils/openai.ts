import OpenAI from 'openai';

// Initialize OpenAI client (will be created when needed)
let openai: OpenAI | null = null;
const apiKey = process.env.OPENAI_API_KEY;

export function getOpenAIClient(): OpenAI {
  // Lazily create a singleton client instance
  if (openai) return openai;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  openai = new OpenAI({ apiKey });
  return openai;
}

export async function getOpenAICompletion(
  prompt: string,
  maxTokens = 2048
): Promise<string> {
  const client = getOpenAIClient();
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.2, // Lower temperature for more deterministic, factual responses
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    return content;
  } catch (error) {
    console.error("Error getting completion from OpenAI:", error);
    throw new Error("Failed to get completion from OpenAI.");
  }
}

/**
 * Generate advisory comments for document improvement using OpenAI
 */
export async function generateAdvisoryComments(documentContent: string): Promise<any[]> {
  const client = getOpenAIClient();
  
  const prompt = `You are an expert writing assistant and editor, specializing in providing high-level, structural, and argumentative feedback on business and technical documents. Your goal is to help users strengthen their writing by focusing on substance, not just style.

You will be given a document as a single block of text. Your task is to analyze this text and identify opportunities for improvement based *only* on the following advisory categories:

1.  **Strengthen a Claim**: Identify a subjective statement, an opinion, or a claim made without sufficient proof. Suggest that the user add a specific data point, a statistic, or a concrete example.
2.  **Define a Key Term/Acronym**: Find specialized jargon or an acronym that has not been defined. Suggest that the user add a brief definition for clarity.
3.  **Improve Structural Flow**: Detect paragraphs that are overly long, dense, or contain multiple disconnected ideas. Suggest breaking the paragraph into smaller, more focused units.
4.  **Add a Clear Call to Action**: Find sections that describe a problem or situation but do not guide the reader on the next steps. Suggest adding a concluding sentence that summarizes the main point or states the desired action.
5.  **Acknowledge Alternatives**: When a specific solution or proposal is presented, identify the absence of context about other options. Suggest that the user briefly mention alternatives that were considered to strengthen their case.

**Output Format:**
You MUST return your response as a valid JSON array of objects. Each object represents a single piece of advice. Your entire response must be ONLY the JSON array, with no other text, explanations, or markdown formatting.

The format for each object in the array MUST be as follows:
{
  "originalText": "<The exact, verbatim text from the document that your advice pertains to.>",
  "explanation": "<Your concise advice, written in the second person (e.g., 'Consider adding a data point...')>",
  "startIndex": "<The starting character index of originalText within the full document as a number>",
  "endIndex": "<The ending character index of originalText within the full document as a number>"
}

**Constraints:**
-   **DO NOT** provide grammatical corrections, stylistic rewrites, or spelling suggestions. Focus exclusively on the five advisory categories listed above.
-   The originalText field in your JSON output must be an *exact* substring of the input document.
-   The startIndex and endIndex values must correspond precisely to the location of originalText. endIndex should be startIndex + originalText.length.
-   If you find no instances that fit these categories, you MUST return an empty array: [].

Document to analyze:
"${documentContent}"`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Clean up the response in case it has markdown formatting
    let cleanContent = content;
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const suggestions = JSON.parse(cleanContent);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error("Error generating advisory comments:", error);
    throw new Error("Failed to generate advisory comments from OpenAI.");
  }
} 