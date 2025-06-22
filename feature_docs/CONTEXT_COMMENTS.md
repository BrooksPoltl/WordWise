# Feature: Context-Aware Advisory Comments

## 1. Feature Context & Vision

This feature enhances the existing advisory comments system by adding **context-driven recommendations** that provide substantive, personalized feedback based on both user context (role, persona) and document context (audience, scope, purpose). Unlike generic structural advice, these recommendations offer expert-level insights specific to the document type and contextual requirements.

**Core Value Proposition:**
- **Personalized Expertise**: Leverage user's role and persona to provide relevant, role-specific advice
- **Document-Specific Intelligence**: Use document context to understand audience, scope, and constraints  
- **Substantive Feedback**: Go beyond structure to provide meaningful content and approach recommendations
- **Contextual Depth**: Consider technical depth, business implications, and domain-specific best practices

**User Story:**
> As a Product Manager writing a PRD for an "enterprise mobile app targeting small businesses," I want context-aware recommendations that suggest specific considerations like "offline functionality for unreliable connectivity" or "simplified onboarding for time-constrained users" based on my role expertise and the document's target audience.

## 2. Technical Architecture

### Current State Analysis
- **Concurrent Processing**: Existing advisory system uses concurrent OpenAI requests for 5 categories
- **JSON Response Format**: Structured output with `reason`, `sentence`, `explanation` fields
- **Frontend Integration**: Advisory store manages comments, modal displays with color-coded categories
- **Context Availability**: Document context in `document.context`, user context in `user.persona`

### Enhancement Strategy
- **Seamless Integration**: Add as 6th concurrent category "Context driven Recommendation"
- **Blue Visual Identity**: Distinguish context-aware suggestions with blue styling throughout UI
- **Prompt Engineering**: Comprehensive prompt leveraging both user persona and document context
- **No Breaking Changes**: Maintain existing advisory flow and data structures

## 3. Implementation Plan

| Priority | Task | Implementation Details | Code Location | Dependencies |
|----------|------|----------------------|---------------|--------------|
| 1 | Add context-aware category to concurrent processing | Add new "Context driven Recommendation" object to `advisoryCategories` array, following same JSON structure as existing 5 categories | `functions/src/utils/openai.ts` lines 56-185 | - |
| 1 | Update generateAdvisoryComments function signature | Modify function to accept `userContext: string` and `documentContext: string` parameters alongside existing `documentContent` | `functions/src/utils/openai.ts` line 48 | - |
| 1 | Create comprehensive context-aware prompt | Design prompt that explicitly uses user.persona and document.context to provide substantive, document-type-specific feedback with technical depth and business considerations | `functions/src/utils/openai.ts` new category in advisoryCategories array | Updated function signature |
| 2 | Update backend comments handler | Modify `getDocumentComments` to extract user.persona and document.context, pass to `generateAdvisoryComments`, and handle the new comment type | `functions/src/handlers/comments.ts` lines 107-145 | Backend function changes |
| 2 | Update advisory store action | Modify `refreshComments` to pass user persona and document context when calling backend `getDocumentComments` function | `src/store/advisory/advisory.actions.ts` | Backend changes |
| 3 | Pass contexts from DocumentEditor | Update DocumentEditor component to extract and pass `currentDocument.context` and `user.persona` to advisory refresh function | `src/components/DocumentEditor.tsx` around line 296 | Store action changes |
| 3 | Add blue styling for context recommendations | Update AdvisoryCard component to render blue border, icon, and accents when `comment.reason === "Context driven Recommendation"` | `src/components/editor/AdvisoryCard.tsx` | - |
| 3 | Update advisory modal blue styling | Apply blue theme to modal header and elements when displaying context-driven recommendations | `src/components/editor/AdvisoryModal.tsx` | - |
| 4 | Type safety updates | Add userContext and documentContext parameters to function call interfaces and ensure TypeScript compatibility | `src/types/index.ts` and relevant interface files | - |

## 4. Technical Implementation Details

### Backend Prompt Structure
Instead of a single "Context driven Recommendation" category, the system will include **4 separate context-aware categories** that run **first** in the concurrent processing pipeline:

```typescript
// Context-aware categories (run first, all blue styling)
{
  name: "Implementation Feasibility",
  prompt: `You are an expert writing consultant specializing in ${documentType} documents.

USER CONTEXT: ${userContext}  // user.persona field
DOCUMENT CONTEXT: ${documentContext}  // document.context field

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

Document: ${JSON.stringify(documentContent)}`
},
{
  name: "Domain Expertise",
  prompt: `You are an expert writing consultant specializing in ${documentType} documents.

USER CONTEXT: ${userContext}  // user.persona field
DOCUMENT CONTEXT: ${documentContext}  // document.context field

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

Document: ${JSON.stringify(documentContent)}`
},
{
  name: "Risk Assessment",
  prompt: `You are an expert writing consultant specializing in ${documentType} documents.

USER CONTEXT: ${userContext}  // user.persona field
DOCUMENT CONTEXT: ${documentContext}  // document.context field

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

Document: ${JSON.stringify(documentContent)}`
},
{
  name: "Competitive Context",
  prompt: `You are an expert writing consultant specializing in ${documentType} documents.

USER CONTEXT: ${userContext}  // user.persona field
DOCUMENT CONTEXT: ${documentContext}  // document.context field

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

Document: ${JSON.stringify(documentContent)}`
}
```

### Concurrent Processing Order
**Priority 1 (Context-Aware - Blue Styling):**
1. Implementation Feasibility
2. Domain Expertise  
3. Risk Assessment
4. Competitive Context

**Priority 2 (Standard Advisory - Amber Styling):**
5. Strengthen a Claim
6. Define a Key Term/Acronym
7. Improve Structural Flow
8. Add a Clear Call to Action
9. Acknowledge Alternatives

### Frontend Styling Logic
- **Context-Aware Categories**: All 4 categories use blue styling (`#3B82F6`)
  - Implementation Feasibility (Blue)
  - Domain Expertise (Blue)
  - Risk Assessment (Blue)
  - Competitive Context (Blue)
- **Standard Categories**: Existing amber styling (`#F59E0B`)
- **Visual Hierarchy**: Context-aware recommendations appear first in modal
- **Consistency**: Same modal structure and interaction patterns

### Data Flow
1. **Trigger**: User clicks "Get Feedback" button in DocumentEditor
2. **Context Extraction**: Extract `user.persona` and `document.context`
3. **Backend Processing**: Pass contexts to enhanced `generateAdvisoryComments`
4. **Concurrent Analysis**: Run 9 categories total (4 context-aware first, then 5 standard)
5. **Response Handling**: Process JSON responses, identify blue vs amber styling
6. **UI Rendering**: Display context-aware (blue) recommendations first, then standard (amber)

### Error Handling & Fallbacks
- **Missing Context**: Context-aware categories degrade gracefully if persona or context empty
- **Prompt Failures**: Individual category failures don't break entire advisory flow
- **Type Safety**: TypeScript interfaces ensure proper parameter passing
- **Backward Compatibility**: Existing advisory comments continue working unchanged

## 5. Success Criteria
- Context-aware recommendations appear alongside existing advisory comments
- Blue styling clearly distinguishes context-driven suggestions
- Recommendations leverage both user persona and document context effectively
- No regression in existing advisory comment functionality
- Concurrent processing maintains performance standards 