# Story 2.5: AI Extraction & Categorization (Stage 2)

**Status:** Approved
**Epic:** 2. Banking & Data Ingestion
**Story:**
**As a** System,
**I want** to interpret the raw text from bank statements and convert it into structured transaction records,
**So that** the user's database is populated automatically without manual entry.

## Acceptance Criteria
1.  [x] **OpenAI Integration:** Configure the `openai` SDK with the `OPENAI_API_KEY` environment variable.
2.  [x] **Extraction Logic:** `parseStatementPDF` now sends the extracted raw text to OpenAI and receives structured output.
3.  [x] **Structured Output:** Implemented Zod schema (`src/lib/ai/schemas.ts`) to validate transactions output from OpenAI.
4.  [x] **Prompt Engineering:**
    *   Instruct the AI to identify Portuguese merchants (e.g., "Continente" -> Groceries, "Galp" -> Transport).
    *   Handle Portuguese number formats (`1.234,56` -> `1234.56`).
    *   Handle date formats (`DD/MM/YYYY`).
    *   Assign a `confidence_score` (0.0 - 1.0) based on how sure it is about the category.
5.  [x] **Database Insertion:** Parsed transactions are inserted via the server supabase client into the `transactions` table (lib/actions/upload.ts). (Drizzle can be integrated later; Supabase server insert is used for now.)
6.  [x] **Error Handling:** AI or parsing errors return a clear error to the client; unparseable text returns a structured fail result.
7.  [x] **Verification:** Uploading a PDF via the UI results in inserted rows and inserted count is shown by the upload UI; transactions appear in the Transaction List.

**Verification Notes:**
- `src/lib/actions/upload.ts` now calls `extractTransactionsFromText` (AI) and inserts validated transactions into the `transactions` table using the server Supabase client.
- The `StatementUpload` UI supports selecting an account and will display number of inserted rows after upload.
- To test manually: set `OPENAI_API_KEY` in `.env`, start dev server (`npm run dev`), log in, go to `/data`, choose an account, upload a small PDF containing transactions, and verify inserted transactions appear in the list on the page.

## Dev Notes (Context)

**1. Model Choice:**
Use **`gpt-4o-mini`**. It is significantly cheaper than GPT-4o and perfectly capable of this extraction task.

**2. Prompt Strategy (System Prompt):**
> "You are a data extraction engine for Portuguese bank statements. Extract transactions from the provided text. Convert all amounts to standard floats (negative for expenses). Assign categories based on merchant names (e.g., Pingo Doce = Groceries). Return JSON only."

**3. Zod Schema for AI:**

const TransactionExtractionSchema = z.object({
  transactions: z.array(z.object({
    date: z.string().describe("ISO 8601 date YYYY-MM-DD"),
    description: z.string(),
    amount: z.number(),
    category: z.enum(['Housing', 'Transport', 'Food', 'Utilities', 'Insurance', 'Healthcare', 'Financial', 'Lifestyle', 'Income', 'Uncategorized']),
    confidence: z.number().min(0).max(1)
  }))
});

**4. Data Flow:**
`Client (Upload)` -> `Server Action (pdf-parse)` -> `OpenAI (Completion)` -> `DB (Insert)` -> `Client (Revalidate)`.

**5. Privacy:**
Do not log the raw text or the AI response to console in production.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-2.5-ai-extraction"
  title: "AI Extraction & Categorization"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "openai"
    - "zod"
  env_vars_required:
    - "OPENAI_API_KEY"
  folder_structure:
    - "/lib/ai/openai.ts" (Client config)
    - "/lib/ai/prompts.ts" (System prompts)
    - "/lib/actions/upload.ts" (Update existing action)
  model: "gpt-4o-mini"
  categories:
    - "Housing"
    - "Transport"
    - "Food"
    - "Utilities"
    - "Insurance"
    - "Healthcare"
    - "Financial"
    - "Lifestyle"
    - "Income"
    - "Uncategorized"
  verify: "Upload a PDF statement. Check Supabase 'transactions' table for new rows with correct categories and confidence scores."

