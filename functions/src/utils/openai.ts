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

Find subjective statements, opinions, or claims made without sufficient proof. For each instance, provide the complete sentence containing the claim.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Strengthen a Claim",
  "sentence": "<The complete sentence from the document that contains the claim>",
  "explanation": "<Concise advice in second person, e.g., 'Consider adding a data point to support this claim...'>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on claims that would benefit from supporting evidence
- If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Define a Key Term/Acronym",
      prompt: `You are an expert writing assistant. Analyze the following document and identify specialized jargon or acronyms that need definition.

Find technical terms, industry jargon, or acronyms that haven't been defined and would benefit from clarification.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Define a Key Term/Acronym",
  "sentence": "<The complete sentence from the document that contains the undefined term>",
  "explanation": "<Concise advice in second person, e.g., 'Consider defining this term for clarity...'>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on terms that would confuse readers unfamiliar with the domain
- If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Improve Structural Flow",
      prompt: `You are an expert writing assistant. Analyze the following document and identify structural flow improvements.

Find paragraphs that are overly long, dense, or contain multiple disconnected ideas that should be broken into smaller, focused units.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Improve Structural Flow",
  "sentence": "<The complete sentence from the document that represents the flow issue>",
  "explanation": "<Concise advice in second person, e.g., 'Consider breaking this into smaller paragraphs...'>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on sentences that could be split or reorganized for better flow
- If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Add a Clear Call to Action",
      prompt: `You are an expert writing assistant. Analyze the following document and identify opportunities for clear calls to action.

Find sections that describe problems or situations but don't guide the reader on next steps. Suggest adding concluding sentences or action items.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Add a Clear Call to Action",
  "sentence": "<The complete sentence from the document that would benefit from a call to action>",
  "explanation": "<Concise advice in second person, e.g., 'Consider adding a clear next step after this statement...'>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on sentences that present problems without solutions
- If no instances found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Acknowledge Alternatives",
      prompt: `You are an expert writing assistant. Analyze the following document and identify opportunities to acknowledge alternatives.

Find specific solutions or proposals that lack context about other options. Suggest mentioning alternatives that were considered.

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Acknowledge Alternatives",
  "sentence": "<The complete sentence from the document that presents a solution without alternatives>",
  "explanation": "<Concise advice in second person, e.g., 'Consider mentioning alternative approaches that were considered...'>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on sentences that present singular solutions
- If no instances found, return: []

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