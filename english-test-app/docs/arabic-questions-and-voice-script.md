# Arabic Questions And Voice Script — Revised

# Corrected and grounded in Arabic dyslexia research (Elbeheri & Everatt, ADAT error patterns)

#

# Key Arabic dyslexia error patterns used as the basis for all distractor choices:

# • Dot-based confusions: ب ↔ ت ↔ ث ↔ ن ↔ ي (same base shape, different dots)

# • Enclosure confusions: ج ↔ ح ↔ خ

# • Tail confusions: د ↔ ذ | ر ↔ ز | س ↔ ش | ص ↔ ض | ط ↔ ظ | ع ↔ غ | ف ↔ ق

# • Mirror confusions: و ↔ ر (reversed curves)

# • Tashkeel omission / vowel substitution errors

# • Letter addition/deletion within words (common in Arabic dyslexic writing)

# • Word segmentation errors (written Arabic merges words with no spaces)

#

# Q14–Q17 mechanics fix:

# Each "click" event should load a completely new letter pair (target + distractor).

# The grid is fully redrawn with a new target letter and new distractor letter.

# Variants list all the pairs that cycle through during the question duration.

# Do NOT shuffle positions — replace the entire grid content each click.

#

# Source of truth in code: src/lib/questions-ar.ts

---

## Q1 — السؤال 1

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الحرف ب في الشبكة
- Instruction: اضغط على كل حرف ب تراه قبل انتهاء الوقت
- Voice line: اعثر على الحرف ب
- Correct answer (targetToken): ب
- Distractors: ت | ث | ن | ي
- Design note: All distractors share the same base shape as ب — only dot count/position differs. This is the most documented Arabic dyslexia confusion family.

---

## Q2 — السؤال 2

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الحرف ج في الشبكة
- Instruction: اضغط على كل حرف ج تراه قبل انتهاء الوقت
- Voice line: اعثر على الحرف ج
- Correct answer (targetToken): ج
- Distractors: ح | خ | ع | غ
- Design note: ج/ح/خ share enclosure shape; ع/غ added as secondary visual confusable.

---

## Q3 — السؤال 3

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الحرف د في الشبكة
- Instruction: اضغط على كل حرف د تراه قبل انتهاء الوقت
- Voice line: اعثر على الحرف د
- Correct answer (targetToken): د
- Distractors: ذ | ر | ز | و
- Design note: د/ذ are the canonical Arabic mirror pair (one dot difference); ر/ز added as tail-shape confusables; و added as curve confusable.

---

## Q4 — السؤال 4

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الحرف س في الشبكة
- Instruction: اضغط على كل حرف س تراه قبل انتهاء الوقت
- Voice line: اعثر على الحرف س
- Correct answer (targetToken): س
- Distractors: ش | ص | ض | ث
- Design note: س/ش differ by three dots; ص/ض share the same base with different dots; ث visually close to س for young readers.

---

## Q5 — السؤال 5

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على المقطع با في الشبكة
- Instruction: اضغط على المقطع با أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على المقطع با
- Correct answer (targetToken): با
- Distractors: تا | ثا | نا | يا | بي | بو | بن
- Design note: Distractors split into two families — same vowel/different consonant (تا ثا نا يا — dot confusion on ب) and same consonant/different vowel (بي بو بن — vowel substitution errors documented in Arabic dyslexia writing).

---

## Q6 — السؤال 6

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على المقطع دار في الشبكة
- Instruction: اضغط على المقطع دار أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على المقطع دار
- Correct answer (targetToken): دار
- Distractors: ذار | زار | رار | دير | دور | نار | بار
- Design note: ذار/زار target the د↔ذ and ر↔ز confusions; دير/دور are vowel-substitution errors on the same consonantal root; نار/بار are phonologically close syllable-level distractors.

---

## Q7 — السؤال 7

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على المقطع بِرا في الشبكة
- Instruction: اضغط على المقطع بِرا أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على المقطع بِرا
- Correct answer (targetToken): برا
- Distractors: ترا | ثرا | نرا | يرا | بزا | بدا | برو
- Design note: First group targets ب dot confusions; بزا targets ر↔ز; بدا targets ر↔د; برو is a vowel substitution.

---

## Q8 — السؤال 8

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على المقطع بلا في الشبكة
- Instruction: اضغط على المقطع بلا أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على المقطع بلا
- Correct answer (targetToken): بلا
- Distractors: تلا | ثلا | نلا | يلا | بلو | بلي | ملا
- Design note: Same split strategy as Q5–Q7 — consonant confusion vs vowel substitution. ملا is a plausible Arabic syllable that differs only in initial consonant.

---

## Q9 — السؤال 9

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على المقطع سِتر في الشبكة
- Instruction: اضغط على المقطع ستر أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على المقطع ستر
- Correct answer (targetToken): ستر
- Distractors: شتر | صتر | ستز | سطر | ستن | ستل | ثتر
- Design note: شتر/صتر/ثتر target the س family dot confusions; ستز targets ر↔ز; سطر is a real Arabic word that is visually very close (ط↔ت confusion); ستن/ستل are plausible near-phonological foils.

---

## Q10 — السؤال 10

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الكلمة بيت في الشبكة
- Instruction: اضغط على الكلمة بيت أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على الكلمة بيت
- Correct answer (targetToken): بيت
- Distractors: تيت | ثيت | نيت | بيد | بيز | بيث | بنت
- Design note: تيت/ثيت/نيت target initial-letter dot confusion; بيد/بيز/بيث target final-letter confusions (ت↔د↔ز↔ث — a major Arabic dyslexia error class); بنت is a real Arabic word that differs by one medial letter.

---

## Q11 — السؤال 11

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الكلمة كتاب في الشبكة
- Instruction: اضغط على الكلمة كتاب أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على الكلمة كتاب
- Correct answer (targetToken): كتاب
- Distractors: كثاب | كتاث | كتان | كتاد | كناب | قتاب
- Design note: كثاب targets ت↔ث; كتاث/كتاد target final ب dot confusion; كتان is a real Arabic word one letter away; كناب targets medial ت↔ن; قتاب targets ك↔ق (a common Arabic spelling error, especially in children from regions that pronounce ق differently).

---

## Q12 — السؤال 12

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الكلمة مدرسة في الشبكة
- Instruction: اضغط على الكلمة مدرسة أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على الكلمة مدرسة
- Correct answer (targetToken): مدرسة
- Distractors: مذرسة | مدرزة | مدرشة | مدرصة | مدرسه | مدرثة
- Design note: مذرسة targets د↔ذ; مدرزة targets س→ز (tashkeel-free reading confusion); مدرشة/مدرصة target the س family; مدرسه is the most common real spelling error (ة↔ه, which children and dyslexics frequently confuse); مدرثة targets س↔ث.

---

## Q13 — السؤال 13

- Interaction type: grid (Whac-A-Mole)
- Prompt: اعثر على الكلمة مكتبة في الشبكة
- Instruction: اضغط على الكلمة مكتبة أكبر عدد ممكن قبل انتهاء الوقت
- Voice line: اعثر على الكلمة مكتبة
- Correct answer (targetToken): مكتبة
- Distractors: مكثبة | مكتثة | مكتنة | مقتبة | مكتبه | مكتية
- Design note: مكتثة targets ب↔ث; مكتنة targets ب↔ن; مقتبة targets ك↔ق; مكتبه targets ة↔ه; مكتية is a letter-deletion foil (ب dropped, ي substituted).

---

## Q14–Q17 — MECHANICS FIX NOTE

#

# BUG IN CURRENT IMPLEMENTATION:

# On each click the grid reshuffles the POSITIONS of the same target/distractor.

# This is wrong. The child learns the position and clicks mechanically.

#

# CORRECT BEHAVIOUR (matching paper's design intent):

# On each successful click → load the NEXT variant (new target letter + new distractor letter).

# The grid is fully redrawn with a completely new letter pair.

# Continue cycling through variants until time runs out.

# If variants are exhausted, cycle back to the first one.

#

# IMPLEMENTATION GUIDE (frontend):

# const [variantIndex, setVariantIndex] = useState(0);

# const currentPair = variants[variantIndex % variants.length];

#

# function handleCorrectClick() {

# recordHit();

# setVariantIndex(v => v + 1); // move to next pair, DO NOT reshuffle current pair

# }

#

# The grid should be generated fresh from currentPair.target and currentPair.distractor

# each time variantIndex changes.

---

## Q14 — السؤال 14

- Interaction type: grid (odd-one-out, cycling variants)
- Prompt: اعثر على الحرف المختلف في الشبكة
- Instruction: اضغط على الحرف الذي يختلف عن الباقين قبل انتهاء الوقت
- Voice line: اعثر على الحرف المختلف
- Mechanic: Grid filled with distractor letter. One cell contains target. On correct click → load next variant pair.
- Variants (target → distractor, all from ب-family dot confusions):
  - Variant 1: target=ب | distractor=ت (ب alone among ت)
  - Variant 2: target=ت | distractor=ب (ت alone among ب)
  - Variant 3: target=ث | distractor=ب (ث alone among ب)
  - Variant 4: target=ب | distractor=ث (ب alone among ث)
  - Variant 5: target=ن | distractor=ت (ن alone among ت)
  - Variant 6: target=ت | distractor=ن (ت alone among ن)
  - Variant 7: target=ي | distractor=ب (ي alone among ب)
  - Variant 8: target=ب | distractor=ن (ب alone among ن)
- Design note: All pairs within the same dot-confusion family. Cycle continuously until time ends.

---

## Q15 — السؤال 15

- Interaction type: grid (odd-one-out, cycling variants)
- Prompt: اعثر على الحرف المختلف في الشبكة
- Instruction: اضغط على الحرف الذي يختلف عن الباقين قبل انتهاء الوقت
- Voice line: اعثر على الحرف المختلف
- Variants (target → distractor, from enclosure-confusion family ج/ح/خ and ع/غ):
  - Variant 1: target=ج | distractor=ح
  - Variant 2: target=ح | distractor=ج
  - Variant 3: target=خ | distractor=ح
  - Variant 4: target=ح | distractor=خ
  - Variant 5: target=ج | distractor=خ
  - Variant 6: target=ع | distractor=غ
  - Variant 7: target=غ | distractor=ع
  - Variant 8: target=ج | distractor=ع

---

## Q16 — السؤال 16

- Interaction type: grid (odd-one-out, cycling variants)
- Prompt: اعثر على الحرف المختلف في الشبكة
- Instruction: اضغط على الحرف الذي يختلف عن الباقين قبل انتهاء الوقت
- Voice line: اعثر على الحرف المختلف
- Variants (target → distractor, tail-shape confusion family د/ذ/ر/ز):
  - Variant 1: target=د | distractor=ذ
  - Variant 2: target=ذ | distractor=د
  - Variant 3: target=ر | distractor=ز
  - Variant 4: target=ز | distractor=ر
  - Variant 5: target=د | distractor=ر
  - Variant 6: target=ذ | distractor=ز
  - Variant 7: target=ر | distractor=د
  - Variant 8: target=ز | distractor=ذ

---

## Q17 — السؤال 17

- Interaction type: grid (odd-one-out, cycling variants)
- Prompt: اعثر على الحرف المختلف في الشبكة
- Instruction: اضغط على الحرف الذي يختلف عن الباقين قبل انتهاء الوقت
- Voice line: اعثر على الحرف المختلف
- Variants (target → distractor, dotted-base confusion family س/ش/ص/ض and ط/ظ):
  - Variant 1: target=س | distractor=ش
  - Variant 2: target=ش | distractor=س
  - Variant 3: target=ص | distractor=ض
  - Variant 4: target=ض | distractor=ص
  - Variant 5: target=س | distractor=ص
  - Variant 6: target=ط | distractor=ظ
  - Variant 7: target=ظ | distractor=ط
  - Variant 8: target=ش | distractor=ض

---

## Q18 — السؤال 18

- Interaction type: grid (pseudo-word spelling choice)
- Prompt: اختر التهجئة الصحيحة للكلمة غير الحقيقية
- Instruction: استمع إلى الكلمة ثم اضغط على تهجئتها الصحيحة
- Voice line: اعثر على الكلمة بلونتك
- Correct answer (targetToken): بلونتك
- Distractors: تلونتك | نلونتك | بلونذك | بلونتق | بلونتث
- Design note: تلونتك/نلونتك target initial ب dot confusion; بلونذك targets ت→ذ (final cluster); بلونتق targets ك↔ق; بلونتث targets ك→ث (uncommon but occurs in children's writing).

---

## Q19 — السؤال 19

- Interaction type: grid (pseudo-word spelling choice)
- Prompt: اختر التهجئة الصحيحة للكلمة غير الحقيقية
- Instruction: استمع إلى الكلمة ثم اضغط على تهجئتها الصحيحة
- Voice line: اعثر على الكلمة ستراميت
- Correct answer (targetToken): ستراميت
- Distractors: شتراميت | صتراميت | ستراميث | سطراميت | ستراميد
- Design note: شتراميت/صتراميت target initial س family; ستراميث targets final ت↔ث; سطراميت targets medial ت↔ط; ستراميد targets final ت↔د.

---

## Q20 — السؤال 20

- Interaction type: grid (real-word spelling choice)
- Prompt: اختر التهجئة الصحيحة للكلمة
- Instruction: استمع إلى الكلمة ثم اضغط على تهجئتها الصحيحة
- Voice line: اعثر على الكلمة نافذة
- Correct answer (targetToken): نافذة
- Distractors: نافده | نافزة | نافضة | ناقذة | نافذه
- Design note: نافده targets ة↔ه (most common Arabic spelling error); نافزة targets ذ↔ز; نافضة targets ذ↔ض; ناقذة targets ف↔ق; نافذه is the ة↔ه variant again as a second foil (very high frequency error type, worth two slots).

---

## Q21 — السؤال 21

- Interaction type: grid (real-word spelling choice)
- Prompt: اختر التهجئة الصحيحة للكلمة
- Instruction: استمع إلى الكلمة ثم اضغط على تهجئتها الصحيحة
- Voice line: اعثر على الكلمة قلم
- Correct answer (targetToken): قلم
- Distractors: كلم | فلم | قنم | قلن | قلب
- Design note: كلم targets ق↔ك (very common in Egyptian/Levantine Arabic dyslexia errors — phonological overlap of these letters in certain dialects); فلم is a real Arabic word (film) that differs only in initial letter; قنم targets medial ل↔ن; قلن targets final م↔ن; قلب is a real Arabic word that differs by one letter.

---

## Q22 — السؤال 22

- Interaction type: letterChoices (fill the missing letter)
- Prompt: اختر الحرف الناقص في الكلمة
- Instruction: اضغط على الحرف الصحيح الذي يكمل الكلمة
- Voice line: اختر الحرف الناقص
- Choice count: 5
- Variants: 12
  - Variant 1: cue=بـ_ت | answer=ي | distractors=ا | و | ن | ث (بيت — ي/ا/و vowel confusion, ن/ث dot confusion on ي)
  - Variant 2: cue=قـ_م | answer=ل | distractors=ن | ب | ر | ت (قلم — ل↔ن are visually similar in isolation)
  - Variant 3: cue=مـ_رسة | answer=د | distractors=ذ | ز | ر | ب (مدرسة — د↔ذ↔ز↔ر tail-family)
  - Variant 4: cue=كـ_اب | answer=ت | distractors=ث | ب | ن | د (كتاب — ت dot family)
  - Variant 5: cue=وـ_دة | answer=ر | distractors=ز | د | ذ | ن (وردة — ر↔ز↔د↔ذ tail-family)
  - Variant 6: cue=شـ_س | answer=م | distractors=ن | ب | ت | ل (شمس — م↔ن in this position)
  - Variant 7: cue=حـ_يقة | answer=د | distractors=ذ | ز | ر | ب (حديقة — د↔ذ family)
  - Variant 8: cue=سـ_ارة | answer=ي | distractors=ا | و | ن | ب (سيارة — vowel confusion)
  - Variant 9: cue=مـ_تبة | answer=ك | distractors=ق | خ | ف | ج (مكتبة — ك↔ق↔خ enclosure/dot family)
  - Variant 10: cue=تـ_اج | answer=ف | distractors=ق | ك | ب | ن (تفاج pseudo — ف↔ق↔ك)
  - Variant 11: cue=نـ_م | answer=ج | distractors=ح | خ | ع | غ (نجم — ج↔ح↔خ enclosure family)
  - Variant 12: cue=رـ_حة | answer=ا | distractors=و | ي | ن | م (راحة — vowel confusion)

---

## Q23 — السؤال 23

- Interaction type: wordLetters (tap the wrong letter inside the word)
- Prompt: اضغط على الحرف الخاطئ داخل الكلمة
- Instruction: اقرأ الكلمة وحدد الحرف الذي لا ينتمي إليها
- Voice line: اضغط على الحرف الخاطئ
- Variants: 12
  - Variant 1: cue=بيتز | answer=ز | correct_word=بيت | note: ز intruded for ت (tail confusion)
  - Variant 2: cue=قلام | answer=ا | correct_word=قلم | note: extra alef inserted (elongation error)
  - Variant 3: cue=مدرصة | answer=ص | correct_word=مدرسة | note: ص substituted for س (dot confusion)
  - Variant 4: cue=شجزة | answer=ز | correct_word=شجرة | note: ز substituted for ر (tail confusion)
  - Variant 5: cue=نافذةن | answer=ن | correct_word=نافذة | note: ن added after ة (letter insertion)
  - Variant 6: cue=كتاثب | answer=ث | correct_word=كتاب | note: ث intruded before ب (dot confusion, letter insertion)
  - Variant 7: cue=مكتضة | answer=ض | correct_word=مكتبة | note: ض substituted for ب (dot confusion)
  - Variant 8: cue=سياذة | answer=ذ | correct_word=سيارة | note: ذ substituted for ر (tail confusion)
  - Variant 9: cue=حديفقة | answer=ف | correct_word=حديقة | note: ف intruded before ق (letter insertion)
  - Variant 10: cue=وردغة | answer=غ | correct_word=وردة | note: غ substituted for ة (enclosure confusion)
  - Variant 11: cue=مصتاح | answer=ص | correct_word=مفتاح | note: ص substituted for ف (both have similar baseline forms)
  - Variant 12: cue=قهلم | answer=ه | correct_word=قلم | note: ه inserted between ق and ل (letter insertion)

---

## Q24 — السؤال 24

- Interaction type: sentenceWords (tap the semantically wrong word)
- Prompt: اضغط على الكلمة التي لا تناسب معنى الجملة
- Instruction: اقرأ الجملة وحدد الكلمة التي لا تنتمي إليها
- Voice line: اضغط على الكلمة غير المناسبة
- Variants: 4
  - Variant 1: cue=ذهب سامي إلى المخبز ليشتري قلم | answer=قلم | note: semantic mismatch (you buy bread at a bakery, not a pen)
  - Variant 2: cue=فتحت مريم المظلة لأن الجو مشمس | answer=المظلة | note: you open an umbrella when it rains, not when it is sunny
  - Variant 3: cue=وضع الطفل الحساء في الثلاجة ليصبح ساخناً | answer=ساخناً | note: fridge makes things cold, not hot
  - Variant 4: cue=كتب المعلم الدرس على كوب كبير | answer=كوب | note: teachers write on the board, not a cup

---

## Q25 — السؤال 25

- Interaction type: sentenceWords (tap the grammatically wrong word)
- Prompt: اضغط على الكلمة النحوية الخاطئة في الجملة
- Instruction: اقرأ الجملة وحدد الخطأ النحوي
- Voice line: اضغط على الكلمة الخاطئة نحوياً
- Variants: 4
  - Variant 1: cue=هو مهتم على الموسيقى | answer=على | correct_preposition=بـ | note: اهتم يتعدى بـ"بـ" لا "على"
  - Variant 2: cue=اعطيت الكتاب على صديقي | answer=على | correct_preposition=لـ | note: أعطى يتعدى بـ"لـ"
  - Variant 3: cue=نحن ننتظر من الحافلة كل صباح | answer=من | correct_preposition=بـ / Ø | note: ننتظر لا يتعدى بـ"من"
  - Variant 4: cue=استمعت على القصة قبل النوم | answer=على | correct_preposition=إلى | note: استمع يتعدى بـ"إلى"

---

## Q26 — السؤال 26

- Interaction type: letterReplacement (tap wrong letter then choose correct)
- Prompt: حدد الحرف الخاطئ في الكلمة ثم اختر الحرف الصحيح
- Instruction: اضغط على الحرف الخاطئ أولاً ثم اختر بديله الصحيح
- Voice line: صحح الحرف الخاطئ في الكلمة
- Variants: 9
  - Variant 1: cue=بيث | wrong=ث | answer=ت | correct_word=بيت | choices=ت | ب | ن | ذ | ز
  - Variant 2: cue=كتاث | wrong=ث | answer=ب | correct_word=كتاب | choices=ب | ن | ت | ي | و
  - Variant 3: cue=شجزة | wrong=ز | answer=ر | correct_word=شجرة | choices=ر | د | ذ | ن | و
  - Variant 4: cue=قنم | wrong=ن | answer=ل | correct_word=قلم | choices=ل | ر | ب | م | ت
  - Variant 5: cue=مذرسة | wrong=ذ | answer=د | correct_word=مدرسة | choices=د | ر | ز | ب | ت
  - Variant 6: cue=وزدة | wrong=ز | answer=ر | correct_word=وردة | choices=ر | د | ذ | ب | ن
  - Variant 7: cue=مكتضة | wrong=ض | answer=ب | correct_word=مكتبة | choices=ب | ت | ن | ث | ي
  - Variant 8: cue=سيازة | wrong=ز | answer=ر | correct_word=سيارة | choices=ر | د | ذ | و | ن
  - Variant 9: cue=مصتاح | wrong=ص | answer=ف | correct_word=مفتاح | choices=ف | ق | ك | ب | ت

---

## Q27 — السؤال 27

- Interaction type: letterArrangement (tap letters in correct order)
- Prompt: رتب الحروف لتكوين الكلمة الصحيحة
- Instruction: اضغط على الحروف بالترتيب الصحيح لتكوين الكلمة
- Voice line: رتب الحروف لتكوين الكلمة
- Variants: 5
  - Variant 1: cue=م,د,ر,س,ة | answer=مدرسة
  - Variant 2: cue=ك,ت,ا,ب | answer=كتاب
  - Variant 3: cue=ق,ل,م | answer=قلم
  - Variant 4: cue=ن,ا,ف,ذ,ة | answer=نافذة
  - Variant 5: cue=ح,د,ي,ق,ة | answer=حديقة
- Design note: No incorrect word options shown — the child must reconstruct from scrambled letters. If wrong order clicked, highlight the wrong position without revealing the answer.

---

## Q28 — السؤال 28

- Interaction type: syllableArrangement (tap syllable chunks in correct order)
- Prompt: رتب المقاطع لتكوين الكلمة الصحيحة
- Instruction: اضغط على المقاطع بالترتيب الصحيح
- Voice line: رتب المقاطع لتكوين الكلمة
- Variants: 5
  - Variant 1: cue=مدر,سة | answer=مدرسة
  - Variant 2: cue=مك,تبة | answer=مكتبة
  - Variant 3: cue=سي,ارة | answer=سيارة
  - Variant 4: cue=فا,كهة | answer=فاكهة
  - Variant 5: cue=مص,باح | answer=مصباح
- Design note: Each syllable chunk is a draggable/tappable tile. Target syllable boundaries follow natural Arabic morphological breaks.

---

## Q29 — السؤال 29

- Interaction type: sentenceSegmentationChoices (choose the correctly spaced sentence)
- Prompt: اختر الجملة المكتوبة بشكل صحيح مع المسافات
- Instruction: النص بدون مسافات — اختر النسخة الصحيحة التي تضع المسافات في مكانها الصحيح
- Voice line: اختر الجملة المفصولة بشكل صحيح
- Variants: 10
  - Variant 1: cue=ذهبتالىالمدرسةاليوم | correct=ذهبت الى المدرسة اليوم | wrong_a=ذهبتالى المدرسة اليوم | wrong_b=ذهبت الىالمدرسة اليوم | wrong_c=ذهبت الى المدرسةاليوم
  - Variant 2: cue=يقرأاخيالكتابكلليلة | correct=يقرأ اخي الكتاب كل ليلة | wrong_a=يقرأاخي الكتاب كل ليلة | wrong_b=يقرأ اخيالكتاب كل ليلة | wrong_c=يقرأ اخي الكتابكل ليلة
  - Variant 3: cue=يلعبالاطفالفيساحةالبيت | correct=يلعب الاطفال في ساحة البيت | wrong_a=يلعبالاطفال في ساحة البيت | wrong_b=يلعب الاطفالفي ساحة البيت | wrong_c=يلعب الاطفال فيساحة البيت
  - Variant 4: cue=كتبتالمعلمةالواجبعلىالسبورة | correct=كتبت المعلمة الواجب على السبورة | wrong_a=كتبتالمعلمة الواجب على السبورة | wrong_b=كتبت المعلمةالواجب على السبورة | wrong_c=كتبت المعلمة الواجبعلى السبورة
  - Variant 5: cue=يغسلالطفليديهقبلالطعام | correct=يغسل الطفل يديه قبل الطعام | wrong_a=يغسلالطفل يديه قبل الطعام | wrong_b=يغسل الطفليديه قبل الطعام | wrong_c=يغسل الطفل يديهقبل الطعام
  - Variant 6: cue=شاهدنافلماجميلابعدالعشاء | correct=شاهدنا فلما جميلا بعد العشاء | wrong_a=شاهدنافلما جميلا بعد العشاء | wrong_b=شاهدنا فلماجميلا بعد العشاء | wrong_c=شاهدنا فلما جميلابعد العشاء
  - Variant 7: cue=يحملساميحقيبةزرقاء | correct=يحمل سامي حقيبة زرقاء | wrong_a=يحملسامي حقيبة زرقاء | wrong_b=يحمل ساميحقيبة زرقاء | wrong_c=يحمل سامي حقيبةزرقاء
  - Variant 8: cue=نرتبالكتببعدالدراسة | correct=نرتب الكتب بعد الدراسة | wrong_a=نرتبالكتب بعد الدراسة | wrong_b=نرتب الكتببعد الدراسة | wrong_c=نرتب الكتب بعدالدراسة
  - Variant 9: cue=يرسمراميشجرةفيالحديقة | correct=يرسم رامي شجرة في الحديقة | wrong_a=يرسمرامي شجرة في الحديقة | wrong_b=يرسم راميشجرة في الحديقة | wrong_c=يرسم رامي شجرةفي الحديقة
  - Variant 10: cue=يسقيابيالزهوركلصباح | correct=يسقي ابي الزهور كل صباح | wrong_a=يسقيابي الزهور كل صباح | wrong_b=يسقي ابيالزهور كل صباح | wrong_c=يسقي ابي الزهوركل صباح

---

## Q30 — السؤال 30

- Interaction type: typedSequenceRecall (see sequence 3 sec → type from memory)
- Prompt: احفظ تسلسل الحروف ثم اكتبه من الذاكرة
- Instruction: ستظهر الحروف لمدة 3 ثوان فقط، ثم اكتبها
- Voice line: احفظ ثم اكتب
- Variants: 4
  - Variant 1: display=ن ب ر | answer=نبر
  - Variant 2: display=د ا ف و | answer=دافو
  - Variant 3: display=س ق ي ر | answer=سقير
  - Variant 4: display=م ت ر ن | answer=مترن
- Design note: Sequences shown with spaces for clarity during display, typed without spaces. Tests Sequential Visual Working Memory.

---

## Q31 — السؤال 31

- Interaction type: typedSequenceRecall (listen → type real words)
- Prompt: استمع إلى الكلمة واكتبها كما سمعتها
- Instruction: ستسمع كلمة حقيقية، اكتبها بشكل صحيح
- Voice line: استمع واكتب الكلمات
- Variants: 4
  - Variant 1: spoken=شمس | answer=شمس
  - Variant 2: spoken=وردة | answer=وردة
  - Variant 3: spoken=نافذة | answer=نافذة
  - Variant 4: spoken=مكتبة | answer=مكتبة
- Design note: Words chosen to contain the high-error letters (ذ, ة, ك/ق). Tests Orthographic Awareness and Auditory Working Memory.

---

## Q32 — السؤال 32

- Interaction type: typedSequenceRecall (listen → type pseudo-words)
- Prompt: استمع إلى الكلمة غير الحقيقية واكتبها كما سمعتها
- Instruction: ستسمع كلمة غير حقيقية، اكتبها بشكل صحيح كما سمعتها بالضبط
- Voice line: استمع واكتب الكلمات غير الحقيقية
- Variants: 4
  - Variant 1: spoken=سارن | answer=سارن
  - Variant 2: spoken=كلفد | answer=كلفد
  - Variant 3: spoken=منبور | answer=منبور
  - Variant 4: spoken=راثب | answer=راثب
- Design note: Pseudo-words constructed using Arabic phonotactic rules. راثب and كلفد specifically contain letters from confusion families (ث near ت, ف near ق) to test phonological encoding under no lexical support.

---

## Voice Playback Notes

- Arabic exam uses locale ar-SA (Saudi) or ar-EG (Egyptian) — prefer ar-EG for broader dialect accessibility.
- Voice prompt plays once automatically. Child may tap the speaker icon to replay.
- Q30: display the letter sequence visually with a countdown, NO voice for the sequence itself (tests visual memory, not auditory).
- Q31–Q32: voice is the only stimulus — do not show the word visually before the child types.
- App must request one explicit "Enable Voice" tap to satisfy browser audio gesture policies before the test starts.

## Quick Checks

1. Start the test from Dashboard with Arabic selected so URL includes ?lang=ar.
2. On the intro screen, press Enable Voice once and verify audio plays.
3. Q14–Q17: after each correct tap the grid should show a completely new letter pair — verify in dev tools that the variant index increments and the grid re-renders with new letters.
4. Q30: confirm the display disappears after 3 seconds and the text input appears.
5. Q31–Q32: confirm the word is spoken but NOT shown visually at any point.
