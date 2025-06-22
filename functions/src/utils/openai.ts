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
      model: "gpt-4o-mini", // Updated to faster, more cost-effective model
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
 * Generate advisory comments for document improvement using OpenAI with concurrent requests
 */
export async function generateAdvisoryComments(documentContent: string): Promise<any[]> {
  const client = getOpenAIClient();
  
  // Debug: Log the exact content being analyzed
  console.log('📄 Document content length:', documentContent.length);
  console.log('📄 Document content preview:', JSON.stringify(documentContent.substring(0, 200)));
  
  // Define the advisory categories for concurrent processing
  const advisoryCategories = [
    {
      name: "Strengthen a Claim",
      prompt: `You are an expert writing assistant. Analyze the following document and identify opportunities to strengthen claims with data, statistics, or concrete examples.

Find subjective statements, opinions, or claims made without sufficient proof. For each instance, suggest adding specific data points, statistics, or concrete examples.

**CRITICAL WHITESPACE HANDLING:**
The document text contains important whitespace, line breaks, and formatting. You MUST preserve the exact character positions.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Strengthen a Claim",
  "originalText": "<A unique, substantial snippet (minimum 20 characters) from the document>",
  "explanation": "<Concise advice in second person, e.g., 'Consider adding a data point...'>"
}

If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Define a Key Term/Acronym",
      prompt: `You are an expert writing assistant. Analyze the following document and identify specialized jargon or acronyms that need definition.

Find technical terms, industry jargon, or acronyms that haven't been defined and would benefit from clarification.

**CRITICAL WHITESPACE HANDLING:**
The document text contains important whitespace, line breaks, and formatting. You MUST preserve the exact character positions.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Define a Key Term/Acronym",
  "originalText": "<A unique, substantial snippet (minimum 20 characters) from the document>",
  "explanation": "<Concise advice in second person, e.g., 'Consider defining this term...'>"
}

If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Improve Structural Flow",
      prompt: `You are an expert writing assistant. Analyze the following document and identify structural flow improvements.

Find paragraphs that are overly long, dense, or contain multiple disconnected ideas that should be broken into smaller, focused units.

**CRITICAL WHITESPACE HANDLING:**
The document text contains important whitespace, line breaks, and formatting. You MUST preserve the exact character positions.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Improve Structural Flow",
  "originalText": "<A unique, substantial snippet (minimum 20 characters) from the document>",
  "explanation": "<Concise advice in second person, e.g., 'Consider breaking this into smaller paragraphs...'>"
}

If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Add a Clear Call to Action",
      prompt: `You are an expert writing assistant. Analyze the following document and identify opportunities for clear calls to action.

Find sections that describe problems or situations but don't guide the reader on next steps. Suggest adding concluding sentences or action items.

**CRITICAL WHITESPACE HANDLING:**
The document text contains important whitespace, line breaks, and formatting. You MUST preserve the exact character positions.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Add a Clear Call to Action",
  "originalText": "<A unique, substantial snippet (minimum 20 characters) from the document>",
  "explanation": "<Concise advice in second person, e.g., 'Consider adding a clear next step...'>"
}

If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Acknowledge Alternatives",
      prompt: `You are an expert writing assistant. Analyze the following document and identify opportunities to acknowledge alternatives.

Find specific solutions or proposals that lack context about other options. Suggest mentioning alternatives that were considered.

**CRITICAL WHITESPACE HANDLING:**
The document text contains important whitespace, line breaks, and formatting. You MUST preserve the exact character positions.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Acknowledge Alternatives",
  "originalText": "<A unique, substantial snippet (minimum 20 characters) from the document>",
  "explanation": "<Concise advice in second person, e.g., 'Consider mentioning alternative approaches...'>"
}

If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    }
  ];

  try {
    // Make concurrent requests for each advisory category
    console.log('🚀 Starting concurrent advisory requests for', advisoryCategories.length, 'categories');
    
    const requests = advisoryCategories.map(async (category) => {
      try {
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini", // Faster, more cost-effective model
          messages: [{ role: "user", content: category.prompt }],
          max_tokens: 1024, // Reduced since each request is more focused
          temperature: 0.2,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
          console.warn(`No content for category: ${category.name}`);
          return [];
        }

        // Clean up the response in case it has markdown formatting
        let cleanContent = content;
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const suggestions = JSON.parse(cleanContent);
        const validSuggestions = Array.isArray(suggestions) ? suggestions : [];
        console.log(`✅ ${category.name}: ${validSuggestions.length} suggestions`);
        return validSuggestions;
      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error);
        return []; // Return empty array for failed requests to avoid breaking the whole process
      }
    });

    // Wait for all concurrent requests to complete
    const results = await Promise.all(requests);
    
    // Flatten all results into a single array
    const allSuggestions = results.flat();
    
    console.log(`🎯 Total advisory suggestions: ${allSuggestions.length}`);
    return allSuggestions;
    
  } catch (error) {
    console.error("Error generating advisory comments:", error);
    throw new Error("Failed to generate advisory comments from OpenAI.");
  }
} 