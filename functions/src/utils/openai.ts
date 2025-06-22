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
export async function generateAdvisoryComments(
  documentContent: string,
  userContext: string = '',
  documentContext: string = '',
  documentType: string = ''
): Promise<any[]> {
  const client = getOpenAIClient();
  
  // Debug: Log the exact content being analyzed
  console.log('📄 Document content length:', documentContent.length);
  console.log('📄 Document content preview:', JSON.stringify(documentContent.substring(0, 200)));
  console.log('👤 User context:', userContext || 'None provided');
  console.log('📋 Document context:', documentContext || 'None provided');
  console.log('📄 Document type:', documentType || 'None provided');
  
  // Define the advisory categories for concurrent processing
  // PRIORITY 1: Context-aware categories (blue styling) - run first
  const contextAwareCategories = [
    {
      name: "Implementation Feasibility",
      prompt: `You are an expert writing consultant specializing in ${documentType || 'business'} documents.

USER CONTEXT: ${userContext}
DOCUMENT CONTEXT: ${documentContext}

Focus specifically on IMPLEMENTATION FEASIBILITY & CONSTRAINTS. Consider practical considerations for execution given the stated context.

Evaluate whether the proposed approach is realistic given:
- Stated constraints, team composition, or technical environment mentioned in context
- Resource limitations, timeline pressures, or budget constraints
- Technical complexity vs. available expertise
- Dependencies on external systems or teams

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Implementation Feasibility",
  "sentence": "<The complete sentence from the document relevant to feasibility concerns>",
  "explanation": "<Specific feasibility assessment based on stated constraints and context>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on practical execution challenges and realistic timelines
- If no feasibility concerns found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Domain Expertise",
      prompt: `You are an expert writing consultant specializing in ${documentType || 'business'} documents.

USER CONTEXT: ${userContext}
DOCUMENT CONTEXT: ${documentContext}

Focus specifically on DOMAIN EXPERTISE & INDUSTRY STANDARDS. Apply industry-standard frameworks, methodologies, or compliance requirements.

Consider:
- Industry-specific best practices for this document type and domain
- Regulatory requirements or compliance standards relevant to the context
- Professional methodologies or frameworks commonly used in this field
- Domain-specific terminology, processes, or considerations missing

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Domain Expertise",
  "sentence": "<The complete sentence from the document that needs domain expertise>",
  "explanation": "<Industry-specific guidance based on domain knowledge and standards>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on industry standards and professional best practices
- If no domain-specific gaps found, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Risk Assessment",
      prompt: `You are an expert writing consultant specializing in ${documentType || 'business'} documents.

USER CONTEXT: ${userContext}
DOCUMENT CONTEXT: ${documentContext}

Focus specifically on RISK ASSESSMENT & MITIGATION. Identify potential challenges or blockers not adequately addressed.

Consider risks given the stated context:
- Operational risks (team capacity, process failures, dependencies)
- Technical risks (scalability, security, integration challenges)
- Market risks (competitive pressure, timing, user adoption)
- Strategic risks (misalignment with business goals, resource conflicts)

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Risk Assessment",
  "sentence": "<The complete sentence from the document that presents unaddressed risk>",
  "explanation": "<Specific risk identification and mitigation recommendations based on context>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on potential risks and mitigation strategies
- If no significant risks identified, return: []

Document: ${JSON.stringify(documentContent)}`
    },
    {
      name: "Competitive Context",
      prompt: `You are an expert writing consultant specializing in ${documentType || 'business'} documents.

USER CONTEXT: ${userContext}
DOCUMENT CONTEXT: ${documentContext}

Focus specifically on COMPETITIVE & MARKET CONTEXT. Consider external factors affecting the proposal.

Evaluate how the document should address:
- Market conditions and competitive landscape mentioned in context
- Industry trends or disruptions relevant to the stated scope
- Competitive advantages or differentiation opportunities
- External pressures (regulatory changes, market timing, competitive threats)

**Output Format:**
Return ONLY a valid JSON array. Each object must have this exact format:
{
  "reason": "Competitive Context",
  "sentence": "<The complete sentence from the document missing competitive consideration>",
  "explanation": "<Market and competitive insights based on stated business context>"
}

**Important Guidelines:**
- Return the full, complete sentence (not a snippet)
- The sentence must appear exactly as written in the document
- Focus on competitive landscape and market considerations
- If no competitive gaps found, return: []

Document: ${JSON.stringify(documentContent)}`
    }
  ];

  // PRIORITY 2: Standard advisory categories (amber styling)
  const standardCategories = [
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

  // Combine categories - context-aware first, then standard
  const allCategories = [...contextAwareCategories, ...standardCategories];

  try {
    // Make concurrent requests for each advisory category
    console.log('🚀 Starting concurrent advisory requests');
    console.log('🔵 Context-aware categories:', contextAwareCategories.length);
    console.log('🟡 Standard categories:', standardCategories.length);
    console.log('📊 Total categories:', allCategories.length);
    
    const startTime = Date.now();
    
    const requests = allCategories.map(async (category, index) => {
      const categoryStartTime = Date.now();
      console.log(`📤 [${index + 1}/${allCategories.length}] Starting request for: ${category.name}`);
      
      try {
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini", // Faster, more cost-effective model
          messages: [{ role: "user", content: category.prompt }],
          max_tokens: 1024, // Reduced since each request is more focused
          temperature: 0.2,
        });

        const categoryDuration = Date.now() - categoryStartTime;
        console.log(`📥 [${index + 1}/${allCategories.length}] Response received for: ${category.name} (${categoryDuration}ms)`);

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
          console.warn(`⚠️  No content for category: ${category.name}`);
          return [];
        }

        // Clean up the response in case it has markdown formatting
        let cleanContent = content;
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const suggestions = JSON.parse(cleanContent);
        const validSuggestions = Array.isArray(suggestions) ? suggestions : [];
        console.log(`✅ [${index + 1}/${allCategories.length}] ${category.name}: ${validSuggestions.length} suggestions`);
        
        // Log first suggestion for debugging
        if (validSuggestions.length > 0) {
          console.log(`📋 ${category.name} sample:`, JSON.stringify(validSuggestions[0], null, 2));
        }
        
        return validSuggestions;
      } catch (error) {
        const categoryDuration = Date.now() - categoryStartTime;
        console.error(`❌ [${index + 1}/${allCategories.length}] Error processing category ${category.name} (${categoryDuration}ms):`, error);
        return []; // Return empty array for failed requests to avoid breaking the whole process
      }
    });

    // Wait for all concurrent requests to complete
    const results = await Promise.all(requests);
    
    const totalDuration = Date.now() - startTime;
    console.log(`🏁 All requests completed in ${totalDuration}ms`);
    
    // Flatten all results into a single array
    const allSuggestions = results.flat();
    
    // Log summary
    const contextAwareSuggestions = allSuggestions.filter(s => 
      ['Implementation Feasibility', 'Domain Expertise', 'Risk Assessment', 'Competitive Context'].includes(s.reason)
    );
    const standardSuggestions = allSuggestions.filter(s => 
      !['Implementation Feasibility', 'Domain Expertise', 'Risk Assessment', 'Competitive Context'].includes(s.reason)
    );
    
    console.log(`🎯 Advisory Summary:`);
    console.log(`   🔵 Context-aware suggestions: ${contextAwareSuggestions.length}`);
    console.log(`   🟡 Standard suggestions: ${standardSuggestions.length}`);
    console.log(`   📊 Total suggestions: ${allSuggestions.length}`);
    
    return allSuggestions;
    
  } catch (error) {
    console.error("❌ Error generating advisory comments:", error);
    throw new Error("Failed to generate advisory comments from OpenAI.");
  }
} 