# Story 2.4: PDF Upload & Stage 1 Parsing (Infrastructure)

**Status:** Approved
**Epic:** 2. Banking & Data Ingestion
**Story:**
**As a** User,
**I want** to upload a PDF bank statement and see that it is being processed,
**So that** I don't have to manually enter every transaction.

## Acceptance Criteria
1.  [x] **UI Component:** Create a `StatementUpload` component with a simple file input.
2.  [x] **File Validation:** Only accept `.pdf` files. Max size limit 5MB.
3.  [x] **Server Action:** Implement `parseStatementPDF(formData)` in `lib/actions/upload.ts`.
4.  [x] **Text Extraction:** Use `pdf-parse` to extract **raw text** from the uploaded buffer.
5.  [x] **Security/Privacy:** Processed in-memory; file not persisted to disk or storage.
6.  [x] **Feedback UI:** Displays "Processing..." text while extracting.
7.  [x] **Output:** The extracted raw text is returned and displayed in a debug box.

**Verification Notes:**
- Implemented `parseStatementPDF` in `src/lib/actions/upload.ts` and `/api/upload` route at `src/app/api/upload/route.ts`.
- `StatementUpload` component available at `src/components/upload/StatementUpload.tsx` and wired into `/data` page.
- To verify:
  1) Run `npm run dev`.
  2) Go to `/data` and upload a small PDF (<=5MB).
  3) Confirm the UI shows "Processing..." and then displays the extracted text and character count.
  4) Confirm the file is not stored in the project or DB (no logs), only shown in the UI.

## Dev Notes (Context)

**1. The "Two-Stage" Architecture:**
We are implementing **Stage 1** here.
*   *Input:* PDF File.
*   *Process:* Node.js extracts strings.
*   *Output:* Big String of Text.
*(Stage 2 - Sending this text to OpenAI - will be implemented in Story 2.5)*.

**2. Library Choice:**
Use `pdf-parse`. It's lightweight and works well in Node.js environments (Next.js Server Actions).
*   `npm install pdf-parse`
*   `npm install --save-dev @types/pdf-parse`

**3. Server Action Implementation Hint:**
```typescript
'use server'
import pdf from 'pdf-parse';

export async function parseStatementPDF(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file uploaded');

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const data = await pdf(buffer);
  
  // For Story 2.4, just return the text to prove it works
  return { success: true, text: data.text };
}

**4. UI UX (Transparent Processing):**
The UX Spec calls for "Transparent Processing."
When the user uploads, show a state:
*   "Reading PDF..." (While uploading/parsing)
*   "Extracted [X] characters" (On success)

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-2.4-pdf-parsing"
  title: "PDF Upload & Stage 1 Parsing"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "pdf-parse"
  devDependencies:
    - "@types/pdf-parse"
  shadcn_components_to_add:
    - "input" (file type)
    - "button"
    - "progress" (for visual feedback)
    - "card"
  folder_structure:
    - "/components/upload/statement-upload.tsx"
    - "/lib/actions/upload.ts"
  security_constraints:
    - "Do NOT configure S3 or Supabase Storage buckets."
    - "Process file in-memory only."
  verify: "User uploads a PDF. The UI shows a loading state. The raw text of the PDF is returned and logged/displayed."