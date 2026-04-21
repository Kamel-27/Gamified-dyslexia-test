# LEXORA Dyslexia Screening Exam — Copilot Skill
## Adapted for: `english-test-app` existing project

> **READ BEFORE WRITING ANY CODE**
> This skill adds a NEW independent screening test to the existing project.
> It does NOT touch or modify any existing files under `src/app/test/`.
> Build one step at a time. Stop and verify after each step.

---

## Context: What Already Exists

```
src/app/
  test/
    ar/[sessionId]/page.tsx   ← EXISTS — Rello Arabic test (DO NOT TOUCH)
    en/                       ← EXISTS — English test (DO NOT TOUCH)
    [sessionId]/              ← EXISTS (DO NOT TOUCH)
  api/                        ← EXISTS — add new routes here
  ar/                         ← EXISTS (DO NOT TOUCH)
  dashboard/                  ← EXISTS (DO NOT TOUCH)
src/components/               ← EXISTS — add new components here
src/hooks/                    ← EXISTS — add new hooks here
src/lib/                      ← EXISTS — add new lib files here
prisma/schema.prisma          ← EXISTS — APPEND only, never replace
```

---

## What This Skill Creates

A new **dyslexia screening test** accessible at `/screening`.
It is a separate product from the Rello test — different route, different DB tables, different scoring.

```
src/app/
  screening/
    page.tsx                          ← Entry form (age + language)
    layout.tsx                        ← RTL layout for Arabic
    [sessionId]/
      stage/
        [stageNum]/
          page.tsx                    ← Stage router (server component)
          GenericStage.tsx            ← Client stage component
      results/
        page.tsx                      ← Risk report

src/app/api/
  screening/
    session/
      create/route.ts
    submit/route.ts
    complete/route.ts
    result/[sessionId]/route.ts

src/components/
  screening/
    StageShell.tsx
    OptionButton.tsx
    RiskBadge.tsx

src/hooks/
  useScreeningTimer.ts
  useScreeningSession.ts

src/lib/
  screening/
    types.ts
    questions.ts
    scoring.ts
```

---

## Step 0 — Verify Prerequisites

```bash
# 1. Confirm project root
ls src/app/test/ar

# 2. Check framer-motion (optional but nice)
cat package.json | grep framer-motion
# If missing: npm install framer-motion

# 3. Confirm Cairo/Tajawal fonts are in src/app/layout.tsx
# If not there, add them ONLY to src/app/screening/layout.tsx (Step 5)

# 4. Confirm tsconfig paths
cat tsconfig.json | grep '"@/*"'
# Must show: "@/*": ["./src/*"]
```

---

## Step 1 — Types + Prisma Schema

**Files to CREATE:** `src/lib/screening/types.ts`
**Files to APPEND:** `prisma/schema.prisma` (end of file only)

### src/lib/screening/types.ts

```typescript
export type ScreeningStageId =
  | 'letter_confusion'
  | 'ran'
  | 'phonological_awareness'
  | 'pseudowords'
  | 'working_memory'
  | 'vowel_effect'
  | 'visual_attention'
  | 'morphology'
  | 'letter_position'

export type AnswerResult = 'correct' | 'wrong' | 'timeout'

export interface ScreeningQuestion {
  id: string
  stageId: ScreeningStageId
  audioPrompt?: string
  displayArabic?: string
  displayOptions: string[]
  correctIndex: number        // -1 for working memory (sequence-based)
  timeLimitSeconds: number
  difficultyWeight: number    // 1.0 | 1.5 | 2.0
}

export interface ScreeningStageConfig {
  id: ScreeningStageId
  nameAr: string
  nameEn: string
  descriptionAr: string
  weight: number
  maxRawScore: number
  questions: ScreeningQuestion[]
}

export interface ScreeningResponse {
  questionId: string
  stageId: ScreeningStageId
  chosenIndex: number | null
  result: AnswerResult
  reactionTimeMs: number
  timeLimitSeconds: number
}

export interface ScreeningStageScore {
  stageId: ScreeningStageId
  rawScore: number
  maxRawScore: number
  normalizedScore: number
  weightedScore: number
  avgReactionMs: number
  timeoutCount: number
}

export interface ScreeningResult {
  sessionId: string
  totalScore: number
  riskBand: 'low' | 'medium' | 'high'
  stageScores: ScreeningStageScore[]
  ranAvgMs: number
  vowelDeltaMs: number
  flaggedStages: ScreeningStageId[]
  computedAt: Date
}
```

### Append to prisma/schema.prisma

```prisma
// ─────────────────────────────────────────
// Dyslexia Screening (separate from Rello)
// ─────────────────────────────────────────

model ScreeningSession {
  id          String    @id @default(cuid())
  childAge    Int
  language    String    @default("ar")
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  isComplete  Boolean   @default(false)
  responses   ScreeningResponse[]
  result      ScreeningResult?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ScreeningResponse {
  id               String  @id @default(cuid())
  sessionId        String
  stageId          String
  questionId       String
  chosenIndex      Int?
  result           String
  reactionTimeMs   Int
  timeLimitSeconds Int
  session          ScreeningSession @relation(fields: [sessionId], references: [id])
  @@index([sessionId])
  @@index([sessionId, stageId])
}

model ScreeningResult {
  id                String   @id @default(cuid())
  sessionId         String   @unique
  totalScore        Float
  riskBand          String
  stageScoresJson   String
  ranAvgMs          Float
  vowelDeltaMs      Float
  flaggedStagesJson String
  computedAt        DateTime @default(now())
  session           ScreeningSession @relation(fields: [sessionId], references: [id])
}
```

```bash
npx prisma migrate dev --name add_screening_tables
npx prisma generate
npx tsc --noEmit
```

**STOP — fix all errors before Step 2.**

---

## Step 2 — Question Bank

**File:** `src/lib/screening/questions.ts`

Data only — no React, no Next.js imports.

```typescript
import type { ScreeningStageConfig } from './types'

// Sum of weights = 1.25 — normalized in scoring.ts (divide by WEIGHT_SUM)
export const WEIGHT_SUM = 1.25
export const SCREENING_STAGES: ScreeningStageConfig[] = [

  // ══ STAGE 1 — Letter Confusion ══
  {
    id: 'letter_confusion', nameAr: 'تمييز الحروف المتشابهة',
    nameEn: 'Letter Confusion', descriptionAr: 'استمع للحرف واضغط عليه',
    weight: 0.10, maxRawScore: 12,
    questions: [
      { id: 'lc_01', stageId: 'letter_confusion', audioPrompt: 'باء',
        displayArabic: 'الحرف: ب', displayOptions: ['ب','ت','ث','ن'],
        correctIndex: 0, timeLimitSeconds: 25, difficultyWeight: 1.0 },
      { id: 'lc_02', stageId: 'letter_confusion', audioPrompt: 'حاء',
        displayArabic: 'الحرف: ح', displayOptions: ['ج','ح','خ'],
        correctIndex: 1, timeLimitSeconds: 25, difficultyWeight: 1.0 },
      { id: 'lc_03', stageId: 'letter_confusion', audioPrompt: 'ذال',
        displayArabic: 'الحرف: ذ', displayOptions: ['د','ذ','ر','ز'],
        correctIndex: 1, timeLimitSeconds: 25, difficultyWeight: 1.0 },
      { id: 'lc_04', stageId: 'letter_confusion', audioPrompt: 'شين',
        displayArabic: 'الحرف: ش', displayOptions: ['س','ش','ص','ض'],
        correctIndex: 1, timeLimitSeconds: 25, difficultyWeight: 1.0 },
      { id: 'lc_05', stageId: 'letter_confusion', audioPrompt: 'غين',
        displayArabic: 'الحرف: غ', displayOptions: ['ع','غ'],
        correctIndex: 1, timeLimitSeconds: 25, difficultyWeight: 1.0 },
      { id: 'lc_06', stageId: 'letter_confusion', audioPrompt: 'ثاب',
        displayArabic: 'الكلمة: ثَاب', displayOptions: ['بَاب','تَاب','ثَاب','نَاب'],
        correctIndex: 2, timeLimitSeconds: 20, difficultyWeight: 1.5 },
      { id: 'lc_07', stageId: 'letter_confusion', audioPrompt: 'سَمِع',
        displayArabic: 'الكلمة: سَمِع', displayOptions: ['سَمِع','شَمِع','صَمِع','سَمَع'],
        correctIndex: 0, timeLimitSeconds: 20, difficultyWeight: 1.5 },
    ],
  },

  // ══ STAGE 2 — RAN ══ (strongest Arabic predictor)
  {
    id: 'ran', nameAr: 'التسمية السريعة', nameEn: 'Rapid Naming',
    descriptionAr: 'اضغط على اسم الحرف أو الرقم بأسرع ما تستطيع',
    weight: 0.25, maxRawScore: 16,
    questions: [
      { id: 'ran_01', stageId: 'ran', displayArabic: 'ب',
        displayOptions: ['باء','تاء','نون','ياء'],
        correctIndex: 0, timeLimitSeconds: 8, difficultyWeight: 1.0 },
      { id: 'ran_02', stageId: 'ran', displayArabic: 'س',
        displayOptions: ['شين','سين','صاد','ضاد'],
        correctIndex: 1, timeLimitSeconds: 8, difficultyWeight: 1.0 },
      { id: 'ran_03', stageId: 'ran', displayArabic: 'ع',
        displayOptions: ['غين','عين','حاء','خاء'],
        correctIndex: 1, timeLimitSeconds: 8, difficultyWeight: 1.0 },
      { id: 'ran_04', stageId: 'ran', displayArabic: '٧',
        displayOptions: ['٥','٦','٧','٨'],
        correctIndex: 2, timeLimitSeconds: 6, difficultyWeight: 1.0 },
      { id: 'ran_05', stageId: 'ran', displayArabic: '٣',
        displayOptions: ['١','٢','٣','٤'],
        correctIndex: 2, timeLimitSeconds: 6, difficultyWeight: 1.0 },
      { id: 'ran_06', stageId: 'ran', displayArabic: 'ق',
        displayOptions: ['فاء','قاف','كاف','لام'],
        correctIndex: 1, timeLimitSeconds: 8, difficultyWeight: 1.0 },
      { id: 'ran_07', stageId: 'ran', displayArabic: 'ظ',
        displayOptions: ['ظاء','طاء','ذال','ثاء'],
        correctIndex: 0, timeLimitSeconds: 8, difficultyWeight: 1.5 },
      { id: 'ran_08', stageId: 'ran', displayArabic: '٩',
        displayOptions: ['٦','٧','٨','٩'],
        correctIndex: 3, timeLimitSeconds: 6, difficultyWeight: 1.0 },
    ],
  },

  // ══ STAGE 3 — Phonological Awareness ══
  {
    id: 'phonological_awareness', nameAr: 'الوعي الصوتي',
    nameEn: 'Phonological Awareness', descriptionAr: 'استمع ثم اختر الإجابة الصحيحة',
    weight: 0.25, maxRawScore: 18,
    questions: [
      { id: 'pa_01', stageId: 'phonological_awareness',
        audioPrompt: 'أي كلمة تقافي كلمة باب',
        displayArabic: 'ما الكلمة التي تُقافي "بَاب"؟',
        displayOptions: ['كِتَاب','ثَوَاب','شَجَرَة','قَلَم'],
        correctIndex: 1, timeLimitSeconds: 30, difficultyWeight: 1.0 },
      { id: 'pa_02', stageId: 'phonological_awareness',
        audioPrompt: 'كم عدد المقاطع في كلمة مدرسة',
        displayArabic: 'كم عدد مقاطع "مَدْرَسَة"؟',
        displayOptions: ['2','3','4','5'],
        correctIndex: 2, timeLimitSeconds: 30, difficultyWeight: 1.0 },
      { id: 'pa_03', stageId: 'phonological_awareness',
        audioPrompt: 'أي كلمة تقافي كلمة نور',
        displayArabic: 'ما الكلمة التي تُقافي "نُور"؟',
        displayOptions: ['سُور','بَيْت','قَلَم','كِتَاب'],
        correctIndex: 0, timeLimitSeconds: 30, difficultyWeight: 1.0 },
      { id: 'pa_04', stageId: 'phonological_awareness',
        audioPrompt: 'قل كلمة سمك بدون صوت سَ',
        displayArabic: '"سَمَك" بدون "سَ" = ؟',
        displayOptions: ['مَك','سَمَ','كَس','سَك'],
        correctIndex: 0, timeLimitSeconds: 30, difficultyWeight: 2.0 },
      { id: 'pa_05', stageId: 'phonological_awareness',
        audioPrompt: 'قل كلمة باب بدون الباء الأولى',
        displayArabic: '"بَاب" بدون "بَـ" الأولى = ؟',
        displayOptions: ['اب','بَا','بَب','آب'],
        correctIndex: 0, timeLimitSeconds: 30, difficultyWeight: 2.0 },
      { id: 'pa_06', stageId: 'phonological_awareness',
        audioPrompt: 'كم عدد المقاطع في كلمة استغفار',
        displayArabic: 'كم عدد مقاطع "اسْتِغْفَار"؟',
        displayOptions: ['3','4','5','6'],
        correctIndex: 1, timeLimitSeconds: 30, difficultyWeight: 1.5 },
    ],
  },

  // ══ STAGE 4 — Pseudowords ══
  {
    id: 'pseudowords', nameAr: 'الكلمات الوهمية', nameEn: 'Pseudoword Reading',
    descriptionAr: 'استمع للكلمة غير الحقيقية واختر مكتوبتها',
    weight: 0.20, maxRawScore: 12,
    questions: [
      { id: 'pw_01', stageId: 'pseudowords', audioPrompt: 'بَتِيل',
        displayArabic: 'اختر الكلمة التي سمعتها (بتشكيل)',
        displayOptions: ['بَتِيل','تَبِيل','بَلِيت','تَلِيب'],
        correctIndex: 0, timeLimitSeconds: 20, difficultyWeight: 1.0 },
      { id: 'pw_02', stageId: 'pseudowords', audioPrompt: 'فِرْبَاس',
        displayArabic: 'اختر الكلمة التي سمعتها (بتشكيل)',
        displayOptions: ['فِرْسَاب','فِرْبَاس','سِرْفَاب','فِبْرَاس'],
        correctIndex: 1, timeLimitSeconds: 20, difficultyWeight: 1.0 },
      { id: 'pw_03', stageId: 'pseudowords', audioPrompt: 'مَلْفِير',
        displayArabic: 'اختر الكلمة التي سمعتها (بدون تشكيل)',
        displayOptions: ['ملفير','مفلير','لمفير','ملفري'],
        correctIndex: 0, timeLimitSeconds: 20, difficultyWeight: 2.0 },
      { id: 'pw_04', stageId: 'pseudowords', audioPrompt: 'تِرْبَاق',
        displayArabic: 'اختر الكلمة التي سمعتها (بدون تشكيل)',
        displayOptions: ['ترباق','تربقا','بترقا','قرتاب'],
        correctIndex: 0, timeLimitSeconds: 20, difficultyWeight: 2.0 },
      { id: 'pw_05', stageId: 'pseudowords', audioPrompt: 'نَشْتُوف',
        displayArabic: 'اختر الكلمة التي سمعتها (بتشكيل)',
        displayOptions: ['نَشْتُوف','شَنْتُوف','نَتْشُوف','شَتْنُوف'],
        correctIndex: 0, timeLimitSeconds: 20, difficultyWeight: 1.0 },
    ],
  },

  // ══ STAGE 5 — Working Memory ══
  // Special: two-phase (show → recall). correctIndex = -1 (ignored).
  // Correct sequence = displayArabic.split(' — ')
  {
    id: 'working_memory', nameAr: 'الذاكرة العاملة', nameEn: 'Working Memory',
    descriptionAr: 'احفظ الحروف ثم اضغط عليها بنفس الترتيب',
    weight: 0.05, maxRawScore: 10,
    questions: [
      { id: 'wm_01', stageId: 'working_memory',
        displayArabic: 'ب — س — ر',
        displayOptions: ['ب','س','ر','م','ل','ك'],
        correctIndex: -1, timeLimitSeconds: 45, difficultyWeight: 1.0 },
      { id: 'wm_02', stageId: 'working_memory',
        displayArabic: 'م — ل — ك — ب',
        displayOptions: ['م','ل','ك','ب','س','ر','ن'],
        correctIndex: -1, timeLimitSeconds: 45, difficultyWeight: 1.5 },
      { id: 'wm_03', stageId: 'working_memory',
        displayArabic: 'ق — ر — ط — م — ن',
        displayOptions: ['ق','ر','ط','م','ن','س','ل','ك'],
        correctIndex: -1, timeLimitSeconds: 45, difficultyWeight: 2.0 },
    ],
  },

  // ══ STAGE 6 — Vowel Effect ══ (Arabic-only)
  // Pairs: _a = vowelized (baseline), _b = unvowelized (diagnostic)
  // Key metric = delta reaction time between _a and _b
  {
    id: 'vowel_effect', nameAr: 'أثر التشكيل', nameEn: 'Vowel Effect',
    descriptionAr: 'استمع للكلمة واختر مكتوبتها',
    weight: 0.10, maxRawScore: 10,
    questions: [
      { id: 've_01a', stageId: 'vowel_effect', audioPrompt: 'كَتَبَ',
        displayArabic: 'اختر الكلمة الصحيحة (بتشكيل)',
        displayOptions: ['كَتَبَ','كَتَمَ','كَذَبَ','كَلَبَ'],
        correctIndex: 0, timeLimitSeconds: 25, difficultyWeight: 1.0 },
      { id: 've_01b', stageId: 'vowel_effect', audioPrompt: 'كَتَبَ',
        displayArabic: 'اختر الكلمة الصحيحة (بدون تشكيل)',
        displayOptions: ['كتب','كتم','كذب','كلب'],
        correctIndex: 0, timeLimitSeconds: 25, difficultyWeight: 2.0 },
      { id: 've_02a', stageId: 'vowel_effect', audioPrompt: 'ذَهَبَ',
        displayArabic: 'اختر الكلمة الصحيحة (بتشكيل)',
        displayOptions: ['ذَهَبَ','ذَهَلَ','ذَهَنَ','زَهَبَ'],
        correctIndex: 0, timeLimitSeconds: 25, difficultyWeight: 1.0 },
      { id: 've_02b', stageId: 'vowel_effect', audioPrompt: 'ذَهَبَ',
        displayArabic: 'اختر الكلمة الصحيحة (بدون تشكيل)',
        displayOptions: ['ذهب','ذهل','زهب','دهب'],
        correctIndex: 0, timeLimitSeconds: 25, difficultyWeight: 2.0 },
    ],
  },

  // ══ STAGE 7 — Visual Attention ══
  // correctIndex = position of the odd-one-out in the grid
  {
    id: 'visual_attention', nameAr: 'الانتباه البصري', nameEn: 'Visual Attention',
    descriptionAr: 'اضغط على الحرف المختلف في المجموعة',
    weight: 0.05, maxRawScore: 8,
    questions: [
      { id: 'va_01', stageId: 'visual_attention',
        displayArabic: 'أي حرف مختلف؟',
        displayOptions: ['ب','ب','ت','ب','ب'],
        correctIndex: 2, timeLimitSeconds: 20, difficultyWeight: 1.0 },
      { id: 'va_02', stageId: 'visual_attention',
        displayArabic: 'أي حرف مختلف؟',
        displayOptions: ['س','س','س','ش','س','س'],
        correctIndex: 3, timeLimitSeconds: 20, difficultyWeight: 1.0 },
      { id: 'va_03', stageId: 'visual_attention',
        displayArabic: 'أي حرف مختلف؟',
        displayOptions: ['ع','ع','ع','ع','غ','ع'],
        correctIndex: 4, timeLimitSeconds: 15, difficultyWeight: 1.5 },
      { id: 'va_04', stageId: 'visual_attention',
        displayArabic: 'أي حرف مختلف؟',
        displayOptions: ['ق','ق','ف','ق','ق','ق'],
        correctIndex: 2, timeLimitSeconds: 15, difficultyWeight: 1.5 },
    ],
  },

  // ══ STAGE 8 — Morphology ══ (Arabic-only — no Dytective equivalent)
  {
    id: 'morphology', nameAr: 'الوعي الصرفي والجذر',
    nameEn: 'Morphological Awareness',
    descriptionAr: 'اختر الجذر المشترك أو الكلمة من نفس الجذر',
    weight: 0.15, maxRawScore: 16,
    questions: [
      { id: 'mo_01', stageId: 'morphology',
        audioPrompt: 'ما الجذر المشترك في كَتَبَ كِتَاب مَكْتُوب كَاتِب',
        displayArabic: 'الجذر المشترك في: كَتَبَ / كِتَاب / مَكْتُوب / كَاتِب',
        displayOptions: ['ك ت ب','ك ت م','ك ب ر','ت ب ك'],
        correctIndex: 0, timeLimitSeconds: 35, difficultyWeight: 2.0 },
      { id: 'mo_02', stageId: 'morphology',
        audioPrompt: 'أي كلمة من نفس جذر دَرَسَ',
        displayArabic: 'أي كلمة من نفس جذر "دَرَسَ"؟',
        displayOptions: ['مَدْرَسَة','مَكْتَبَة','مَلْعَب','مَطْبَخ'],
        correctIndex: 0, timeLimitSeconds: 25, difficultyWeight: 1.5 },
      { id: 'mo_03', stageId: 'morphology',
        audioPrompt: 'ما الجذر المشترك في سَمِعَ سَمَاع مِسْمَع',
        displayArabic: 'الجذر المشترك في: سَمِعَ / سَمَاع / مِسْمَع',
        displayOptions: ['س م ع','س م ح','س م ك','ص م ع'],
        correctIndex: 0, timeLimitSeconds: 35, difficultyWeight: 2.0 },
      { id: 'mo_04', stageId: 'morphology',
        audioPrompt: 'أي كلمة من نفس جذر عَلِمَ',
        displayArabic: 'أي كلمة من نفس جذر "عَلِمَ"؟',
        displayOptions: ['مَعْلَم','مَكْتَب','مَسْجِد','مَلْعَب'],
        correctIndex: 0, timeLimitSeconds: 25, difficultyWeight: 1.5 },
      { id: 'mo_05', stageId: 'morphology',
        audioPrompt: 'أي كلمة على وزن فاعل',
        displayArabic: 'أي كلمة على وزن "فَاعِل"؟',
        displayOptions: ['كَاتِب','مَكْتُوب','كِتَاب','كَتْب'],
        correctIndex: 0, timeLimitSeconds: 35, difficultyWeight: 2.0 },
    ],
  },

  // ══ STAGE 9 — Letter Position Forms ══ (Arabic-only)
  // Arabic letters have 4 forms: initial / medial / final / isolated
  {
    id: 'letter_position', nameAr: 'شكل الحرف حسب موضعه',
    nameEn: 'Letter Position Forms',
    descriptionAr: 'اختر الشكل الصحيح للحرف حسب موضعه في الكلمة',
    weight: 0.10, maxRawScore: 10,
    questions: [
      { id: 'lp_01', stageId: 'letter_position',
        audioPrompt: 'حرف عين في وسط الكلمة أي شكل صحيح',
        displayArabic: '"ع" في وَسَط الكلمة — أي شكل صحيح؟',
        displayOptions: ['عـ','ـعـ','ـع','ع'],
        correctIndex: 1, timeLimitSeconds: 25, difficultyWeight: 2.0 },
      { id: 'lp_02', stageId: 'letter_position',
        audioPrompt: 'حرف عين في آخر الكلمة أي شكل صحيح',
        displayArabic: '"ع" في آخر الكلمة — أي شكل صحيح؟',
        displayOptions: ['عـ','ـعـ','ـع','ع'],
        correctIndex: 2, timeLimitSeconds: 25, difficultyWeight: 2.0 },
      { id: 'lp_03', stageId: 'letter_position',
        audioPrompt: 'في أي كلمة حرف الحاء في البداية',
        displayArabic: 'في أي كلمة حرف "ح" في البداية؟',
        displayOptions: ['صَحِيح','حَجَر','نَاجِح','رَاحَة'],
        correctIndex: 1, timeLimitSeconds: 25, difficultyWeight: 1.5 },
      { id: 'lp_04', stageId: 'letter_position',
        audioPrompt: 'أكمل كلمة كتاب الحرف الناقص في الوسط',
        displayArabic: 'أكمل: "كـ_ـاب" — الحرف الناقص؟',
        displayOptions: ['ت','ب','ث','ن'],
        correctIndex: 0, timeLimitSeconds: 20, difficultyWeight: 1.5 },
    ],
  },
]

export const TOTAL_STAGES = SCREENING_STAGES.length  // 9

export function getStageByIndex(i: number) { return SCREENING_STAGES[i] ?? null }
export function getStageById(id: string) { return SCREENING_STAGES.find(s => s.id === id) ?? null }
export function getStageNumber(id: string) { return SCREENING_STAGES.findIndex(s => s.id === id) + 1 }
```

```bash
npx tsc --noEmit   # must pass with 0 errors
```

---

## Step 3 — Scoring Engine

**File:** `src/lib/screening/scoring.ts`

```typescript
import type { ScreeningResult, ScreeningResponse, ScreeningStageScore, ScreeningStageId } from './types'
import { SCREENING_STAGES, WEIGHT_SUM } from './questions'

const RISK = { LOW: 65, MEDIUM: 40 }
const FLAG_THRESHOLD = 40

export function computeScreeningResult(
  sessionId: string,
  responses: ScreeningResponse[],
): ScreeningResult {
  const stageScores: ScreeningStageScore[] = []

  for (const stage of SCREENING_STAGES) {
    const sr = responses.filter(r => r.stageId === stage.id)
    let rawScore = 0, totalMs = 0, timeouts = 0

    for (const resp of sr) {
      const q = stage.questions.find(q => q.id === resp.questionId)
      if (!q) continue
      totalMs += resp.reactionTimeMs
      if (resp.result === 'timeout') { timeouts++; continue }
      if (resp.result === 'correct') {
        const speedRatio = Math.min(1, resp.reactionTimeMs / (q.timeLimitSeconds * 1000))
        rawScore += q.difficultyWeight * (2 - 1.5 * speedRatio)
      }
    }

    const normalized = sr.length > 0 ? Math.min(100, (rawScore / stage.maxRawScore) * 100) : 0
    const normalizedWeight = stage.weight / WEIGHT_SUM

    stageScores.push({
      stageId: stage.id as ScreeningStageId,
      rawScore, maxRawScore: stage.maxRawScore,
      normalizedScore: normalized,
      weightedScore: normalized * normalizedWeight,
      avgReactionMs: sr.length > 0 ? totalMs / sr.length : 0,
      timeoutCount: timeouts,
    })
  }

  const totalScore = stageScores.reduce((s, sc) => s + sc.weightedScore, 0)

  // RAN signal
  const ranAvgMs = stageScores.find(s => s.stageId === 'ran')?.avgReactionMs ?? 0

  // Vowel delta signal (Arabic-specific)
  const veA = responses.filter(r => r.questionId.endsWith('a') && r.stageId === 'vowel_effect')
  const veB = responses.filter(r => r.questionId.endsWith('b') && r.stageId === 'vowel_effect')
  const avg = (arr: ScreeningResponse[]) =>
    arr.length ? arr.reduce((s, r) => s + r.reactionTimeMs, 0) / arr.length : 0
  const vowelDeltaMs = avg(veB) - avg(veA)

  const flaggedStages = stageScores
    .filter(s => s.normalizedScore < FLAG_THRESHOLD)
    .map(s => s.stageId)

  const riskBand = totalScore >= RISK.LOW ? 'low' : totalScore >= RISK.MEDIUM ? 'medium' : 'high'

  return { sessionId, totalScore, riskBand, stageScores, ranAvgMs, vowelDeltaMs, flaggedStages, computedAt: new Date() }
}
```

---

## Step 4 — Hooks

### src/hooks/useScreeningTimer.ts

```typescript
import { useEffect, useRef, useState, useCallback } from 'react'

export function useScreeningTimer(limitSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(limitSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(Date.now())
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false
    startRef.current = Date.now()
    setRemaining(limitSeconds)
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      const left = Math.max(0, limitSeconds - (Date.now() - startRef.current) / 1000)
      setRemaining(left)
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(intervalRef.current!)
        onExpire()
      }
    }, 100)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [limitSeconds])

  const getElapsedMs = useCallback(() => Date.now() - startRef.current, [])
  return { remaining, progressPct: (remaining / limitSeconds) * 100, getElapsedMs }
}
```

### src/hooks/useScreeningSession.ts

```typescript
import { useCallback } from 'react'
import type { ScreeningResponse } from '@/lib/screening/types'

export function useScreeningSession(sessionId: string) {
  const submitStageResponses = useCallback(async (responses: ScreeningResponse[]) => {
    await fetch('/api/screening/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, responses }),
    })
  }, [sessionId])

  const finalizeExam = useCallback(async () => {
    const res = await fetch('/api/screening/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    return res.json() as Promise<{ riskBand: string }>
  }, [sessionId])

  return { submitStageResponses, finalizeExam }
}
```

---

## Step 5 — Shared Components

### src/components/screening/StageShell.tsx

```tsx
'use client'
import { useScreeningTimer } from '@/hooks/useScreeningTimer'

interface StageShellProps {
  stageNameAr: string
  stageNumber: number
  totalStages: number
  questionNumber: number
  totalQuestions: number
  timeLimitSeconds: number
  onTimeout: () => void
  children: React.ReactNode
}

export function StageShell({
  stageNameAr, stageNumber, totalStages,
  questionNumber, totalQuestions, timeLimitSeconds, onTimeout, children,
}: StageShellProps) {
  const { remaining, progressPct } = useScreeningTimer(timeLimitSeconds, onTimeout)

  const barColor = progressPct > 60 ? 'bg-emerald-500' : progressPct > 30 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-slate-400">المرحلة {stageNumber} / {totalStages}</p>
              <p className="text-sm font-bold text-slate-800">{stageNameAr}</p>
            </div>
            <div className="text-center">
              <span className={`text-2xl font-black tabular-nums ${
                progressPct < 30 ? 'text-rose-600' : progressPct < 60 ? 'text-amber-600' : 'text-slate-800'
              }`}>{Math.ceil(remaining)}</span>
              <p className="text-xs text-slate-400">ثانية</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">السؤال</p>
              <p className="text-sm font-bold text-slate-800">{questionNumber} / {totalQuestions}</p>
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-100 ${barColor}`}
              style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-center gap-1.5 mt-2">
            {Array.from({ length: totalStages }).map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${
                i + 1 < stageNumber ? 'w-2 h-2 bg-indigo-400' :
                i + 1 === stageNumber ? 'w-4 h-2 bg-indigo-600' : 'w-2 h-2 bg-slate-200'
              }`} />
            ))}
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  )
}
```

### src/components/screening/OptionButton.tsx

```tsx
interface OptionButtonProps {
  label: string
  index: number
  disabled: boolean
  showFeedback: boolean
  isCorrect: boolean
  isChosen: boolean
  onClick: (index: number) => void
  large?: boolean
}

export function OptionButton({ label, index, disabled, showFeedback, isCorrect, isChosen, onClick, large }: OptionButtonProps) {
  let cls = `w-full py-4 px-5 rounded-xl font-bold border-2 transition-all duration-150 ${large ? 'text-3xl' : 'text-xl'} `
  if (!showFeedback) {
    cls += 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 active:scale-[0.98]'
  } else if (isCorrect) {
    cls += 'border-emerald-500 bg-emerald-50 text-emerald-700'
  } else if (isChosen) {
    cls += 'border-rose-400 bg-rose-50 text-rose-700'
  } else {
    cls += 'border-slate-100 bg-slate-50 text-slate-400 opacity-40'
  }
  return <button className={cls} disabled={disabled} onClick={() => onClick(index)}>{label}</button>
}
```

### src/components/screening/RiskBadge.tsx

```tsx
const CONFIG = {
  low: { label: 'خطورة منخفضة', sub: 'لا مؤشرات ملحوظة', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  medium: { label: 'خطورة متوسطة', sub: 'يُنصح بمتابعة مختص', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500' },
  high: { label: 'خطورة مرتفعة', sub: 'يُنصح بإحالة لأخصائي', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', dot: 'bg-rose-500' },
}

export function RiskBadge({ riskBand, score }: { riskBand: 'low'|'medium'|'high', score: number }) {
  const c = CONFIG[riskBand]
  return (
    <div className={`${c.bg} ${c.border} border-2 rounded-2xl p-6 text-center`}>
      <div className={`w-4 h-4 ${c.dot} rounded-full mx-auto mb-3`} />
      <div className={`text-4xl font-black ${c.text} mb-1`}>{Math.round(score)}%</div>
      <div className={`text-lg font-bold ${c.text}`}>{c.label}</div>
      <div className={`text-sm ${c.text} opacity-80 mt-1`}>{c.sub}</div>
    </div>
  )
}
```

---

## Step 6 — Entry Page + Layout

### src/app/screening/layout.tsx

```tsx
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Lexora — فحص الديسلكسيا' }

export default function ScreeningLayout({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" lang="ar" className="min-h-screen">{children}</div>
}
```

### src/app/screening/page.tsx

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ScreeningEntryPage() {
  const [age, setAge] = useState<number | null>(null)
  const [lang, setLang] = useState<'ar'|'en'>('ar')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function start() {
    if (!age) return
    setLoading(true)
    try {
      const res = await fetch('/api/screening/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childAge: age, language: lang }),
      })
      const { sessionId } = await res.json()
      router.push(`/screening/${sessionId}/stage/1`)
    } catch { setLoading(false) }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-indigo-700 mb-1">Lexora</div>
          <h1 className="text-xl font-bold text-slate-800">فحص الديسلكسيا</h1>
          <p className="text-sm text-slate-500 mt-2">اختبار فحص تمهيدي · 20–25 دقيقة</p>
        </div>

        <p className="text-sm font-bold text-slate-700 mb-3">عمر الطفل</p>
        <div className="grid grid-cols-6 gap-2 mb-6">
          {[7,8,9,10,11,12].map(a => (
            <button key={a} onClick={() => setAge(a)}
              className={`py-3 rounded-xl font-bold text-lg transition-all ${
                age === a ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>{a}</button>
          ))}
        </div>

        <p className="text-sm font-bold text-slate-700 mb-3">لغة الاختبار</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(['ar','en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`py-3 rounded-xl font-bold transition-all ${
                lang === l ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>{l === 'ar' ? 'العربية' : 'English'}</button>
          ))}
        </div>

        <button onClick={start} disabled={!age || loading}
          className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg
                     disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors">
          {loading ? 'جاري التحضير...' : 'ابدأ الاختبار'}
        </button>
      </div>
    </main>
  )
}
```

**Test:** `npm run dev` → visit `http://localhost:3000/screening` → select age → click start → expect redirect (404 = ok at this point).

---

## Step 7 — API Routes

### src/app/api/screening/session/create/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(req: NextRequest) {
  const { childAge, language } = await req.json()
  if (!childAge || childAge < 7 || childAge > 12)
    return NextResponse.json({ error: 'Invalid age' }, { status: 400 })
  const session = await prisma.screeningSession.create({
    data: { childAge: Number(childAge), language: language ?? 'ar' },
  })
  return NextResponse.json({ sessionId: session.id })
}
```

### src/app/api/screening/submit/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(req: NextRequest) {
  const { sessionId, responses } = await req.json()
  for (const r of responses) {
    await prisma.screeningResponse.create({
      data: { sessionId, stageId: r.stageId, questionId: r.questionId,
              chosenIndex: r.chosenIndex ?? null, result: r.result,
              reactionTimeMs: r.reactionTimeMs, timeLimitSeconds: r.timeLimitSeconds },
    })
  }
  return NextResponse.json({ ok: true })
}
```

### src/app/api/screening/complete/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeScreeningResult } from '@/lib/screening/scoring'
export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()
  const responses = await prisma.screeningResponse.findMany({ where: { sessionId } })
  const result = computeScreeningResult(sessionId, responses as any)
  await prisma.screeningResult.create({
    data: { sessionId, totalScore: result.totalScore, riskBand: result.riskBand,
            stageScoresJson: JSON.stringify(result.stageScores),
            ranAvgMs: result.ranAvgMs, vowelDeltaMs: result.vowelDeltaMs,
            flaggedStagesJson: JSON.stringify(result.flaggedStages) },
  })
  await prisma.screeningSession.update({
    where: { id: sessionId }, data: { isComplete: true, completedAt: new Date() },
  })
  return NextResponse.json({ ok: true, riskBand: result.riskBand })
}
```

### src/app/api/screening/result/[sessionId]/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  const result = await prisma.screeningResult.findUnique({
    where: { sessionId: params.sessionId },
    include: { session: { select: { childAge: true, language: true } } },
  })
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    ...result,
    stageScores: JSON.parse(result.stageScoresJson),
    flaggedStages: JSON.parse(result.flaggedStagesJson),
  })
}
```

---

## Step 8 — Stage Router + GenericStage

### src/app/screening/[sessionId]/stage/[stageNum]/page.tsx

```tsx
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SCREENING_STAGES } from '@/lib/screening/questions'
import { GenericStage } from './GenericStage'

export default async function StagePage({
  params,
}: { params: { sessionId: string; stageNum: string } }) {
  const idx = parseInt(params.stageNum) - 1
  if (isNaN(idx) || idx < 0 || idx >= SCREENING_STAGES.length) notFound()

  const session = await prisma.screeningSession.findUnique({
    where: { id: params.sessionId },
    select: { id: true, childAge: true, isComplete: true },
  })
  if (!session) notFound()
  if (session.isComplete) redirect(`/screening/${params.sessionId}/results`)

  return <GenericStage sessionId={session.id} stageIndex={idx} childAge={session.childAge} />
}
```

### src/app/screening/[sessionId]/stage/[stageNum]/GenericStage.tsx

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { StageShell } from '@/components/screening/StageShell'
import { OptionButton } from '@/components/screening/OptionButton'
import { useScreeningSession } from '@/hooks/useScreeningSession'
import { SCREENING_STAGES, TOTAL_STAGES } from '@/lib/screening/questions'
import type { ScreeningResponse } from '@/lib/screening/types'

export function GenericStage({ sessionId, stageIndex, childAge }: {
  sessionId: string; stageIndex: number; childAge: number
}) {
  const stage = SCREENING_STAGES[stageIndex]
  const { submitStageResponses, finalizeExam } = useScreeningSession(sessionId)
  const router = useRouter()
  const stageNum = stageIndex + 1

  const [qIndex, setQIndex] = useState(0)
  const [allResponses, setAllResponses] = useState<ScreeningResponse[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [chosenIdx, setChosenIdx] = useState<number | null>(null)
  const startRef = useRef(Date.now())

  const q = stage.questions[qIndex]

  useEffect(() => {
    startRef.current = Date.now()
    if (!q.audioPrompt || typeof window === 'undefined') return
    const u = new SpeechSynthesisUtterance(q.audioPrompt)
    u.lang = 'ar-SA'; u.rate = 0.85
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }, [qIndex])

  function handleAnswer(idx: number) {
    if (showFeedback) return
    const ms = Date.now() - startRef.current
    const result = idx === q.correctIndex ? 'correct' : 'wrong'
    setChosenIdx(idx); setShowFeedback(true)
    const resp: ScreeningResponse = {
      questionId: q.id, stageId: stage.id, chosenIndex: idx,
      result, reactionTimeMs: ms, timeLimitSeconds: q.timeLimitSeconds,
    }
    setTimeout(() => advance([...allResponses, resp]), 600)
  }

  function handleTimeout() {
    if (showFeedback) return
    const resp: ScreeningResponse = {
      questionId: q.id, stageId: stage.id, chosenIndex: null,
      result: 'timeout', reactionTimeMs: q.timeLimitSeconds * 1000,
      timeLimitSeconds: q.timeLimitSeconds,
    }
    advance([...allResponses, resp])
  }

  async function advance(updated: ScreeningResponse[]) {
    setShowFeedback(false); setChosenIdx(null); setAllResponses(updated)
    if (qIndex + 1 < stage.questions.length) { setQIndex(i => i + 1); return }
    await submitStageResponses(updated)
    if (stageNum < TOTAL_STAGES) {
      router.push(`/screening/${sessionId}/stage/${stageNum + 1}`)
    } else {
      await finalizeExam()
      router.push(`/screening/${sessionId}/results`)
    }
  }

  const cols = q.displayOptions.length <= 2 ? 'grid-cols-2' :
               q.displayOptions.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <StageShell stageNameAr={stage.nameAr} stageNumber={stageNum} totalStages={TOTAL_STAGES}
      questionNumber={qIndex + 1} totalQuestions={stage.questions.length}
      timeLimitSeconds={q.timeLimitSeconds} onTimeout={handleTimeout}>

      <p className="text-center text-slate-500 mb-4 text-sm">{stage.descriptionAr}</p>

      <div className="bg-white border border-slate-200 rounded-2xl px-8 py-10 text-center shadow-sm mb-6">
        <div className="text-4xl font-bold text-indigo-900 leading-relaxed">{q.displayArabic}</div>
      </div>

      <div className={`grid ${cols} gap-3 mb-4`}>
        {q.displayOptions.map((opt, i) => (
          <OptionButton key={i} label={opt} index={i} disabled={showFeedback}
            showFeedback={showFeedback} isCorrect={i === q.correctIndex}
            isChosen={i === chosenIdx} onClick={handleAnswer} />
        ))}
      </div>

      {q.audioPrompt && (
        <div className="text-center">
          <button onClick={() => {
            const u = new SpeechSynthesisUtterance(q.audioPrompt!)
            u.lang = 'ar-SA'; u.rate = 0.85
            window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
          }} className="text-sm text-indigo-500 hover:text-indigo-700 underline">
            🔊 إعادة الاستماع
          </button>
        </div>
      )}

      {showFeedback && (
        <div className={`text-center text-xl font-black mt-4 ${
          chosenIdx === q.correctIndex ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {chosenIdx === q.correctIndex ? '✓ صحيح' : '✗ خطأ'}
        </div>
      )}
    </StageShell>
  )
}
```

**STOP. Full flow test: entry → stage 1 through 9 → results redirect.**

---

## Step 9 — Results Page

### src/app/screening/[sessionId]/results/page.tsx

```tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SCREENING_STAGES } from '@/lib/screening/questions'
import { RiskBadge } from '@/components/screening/RiskBadge'
import type { ScreeningStageScore } from '@/lib/screening/types'

const NEXT_STEPS = {
  low: 'لا يوجد ما يدعو للقلق حالياً. يُنصح بالمتابعة الدورية.',
  medium: 'تظهر بعض المؤشرات. يُنصح باستشارة معلم متخصص أو أخصائي تعلم.',
  high: 'تظهر مؤشرات قوية. يُنصح بالإحالة لأخصائي صعوبات التعلم في أقرب وقت.',
}

export default async function ResultsPage({ params }: { params: { sessionId: string } }) {
  const result = await prisma.screeningResult.findUnique({
    where: { sessionId: params.sessionId },
    include: { session: { select: { childAge: true } } },
  })
  if (!result) notFound()

  const stageScores: ScreeningStageScore[] = JSON.parse(result.stageScoresJson)
  const flagged: string[] = JSON.parse(result.flaggedStagesJson)

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-2xl font-black text-indigo-700 mb-1">Lexora</div>
          <h1 className="text-xl font-bold text-slate-800">نتيجة فحص الديسلكسيا</h1>
          <p className="text-sm text-slate-500 mt-1">الطفل: {result.session.childAge} سنوات</p>
        </div>

        <div className="mb-6">
          <RiskBadge riskBand={result.riskBand as any} score={result.totalScore} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-slate-800 mb-2">ماذا بعد؟</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {NEXT_STEPS[result.riskBand as keyof typeof NEXT_STEPS]}
          </p>
          <p className="text-xs text-slate-400 mt-3">
            ⚠️ هذا اختبار فحص تمهيدي وليس تشخيصاً طبياً.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black tabular-nums">{Math.round(result.ranAvgMs)}ms</div>
            <div className="text-xs text-slate-500 mt-1">متوسط زمن RAN</div>
            <div className="text-xs text-slate-400">{result.ranAvgMs > 2000 ? '⚠️ بطيء' : '✓ طبيعي'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black tabular-nums">+{Math.round(result.vowelDeltaMs)}ms</div>
            <div className="text-xs text-slate-500 mt-1">أثر التشكيل ∆</div>
            <div className="text-xs text-slate-400">{result.vowelDeltaMs > 8000 ? '⚠️ فارق كبير' : '✓ طبيعي'}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">التفصيل بالمراحل</h2>
          <div className="space-y-3">
            {stageScores.map(sc => {
              const meta = SCREENING_STAGES.find(s => s.id === sc.stageId)
              return (
                <div key={sc.stageId} className="flex items-center gap-3">
                  <div className="w-36 text-xs font-semibold text-slate-700 text-right shrink-0">
                    {flagged.includes(sc.stageId) && <span className="text-rose-500 ml-1">⚑</span>}
                    {meta?.nameAr}
                  </div>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      sc.normalizedScore >= 65 ? 'bg-emerald-500' :
                      sc.normalizedScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} style={{ width: `${sc.normalizedScore}%` }} />
                  </div>
                  <div className="w-10 text-xs font-bold text-left shrink-0 tabular-nums">
                    {Math.round(sc.normalizedScore)}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-sm">
            🖨️ طباعة
          </button>
          <a href="/dashboard"
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-center hover:bg-indigo-700 text-sm">
            لوحة التحكم
          </a>
        </div>
      </div>
    </div>
  )
}
```

---

## Common Errors

| Error | Fix |
|---|---|
| `Cannot find module '@/lib/screening/types'` | Check tsconfig has `"@/*": ["./src/*"]` |
| `prisma.screeningSession is not a function` | Run `npx prisma generate` |
| `prisma` import fails | Use existing import path from `src/lib/prisma.ts` — check what path the existing test uses |
| RTL not applying | Add `dir="rtl"` to the container div, not just layout |
| Timer not resetting between questions | The `useEffect` in `useScreeningTimer` depends on `limitSeconds` — if it doesn't change between questions, add `key={q.id}` on `StageShell` |
| `SpeechSynthesis` undefined in build | Wrap all TTS calls in `if (typeof window !== 'undefined')` |
| Results show 0% | `submit` API must be called for EVERY stage before `complete` is called |
| `createMany` error | Already handled — using loop with individual `.create()` |
| Working memory scoring | Parse correct sequence: `q.displayArabic.split(' — ')` → compare to user's tap sequence |
