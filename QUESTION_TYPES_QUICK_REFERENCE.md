# Question Types Quick Reference Card

## 🎯 All 12 Question Types at a Glance

| # | Type | Category | Input | Auto-Grade | Usage |
|---|------|----------|-------|------------|-------|
| 1 | `short_answer` | Listening | Text (inline) | ✅ Yes | L: S1, S3, S4 |
| 2 | `multiple_choice` | Listening | Radio | ✅ Yes | L: S2, S3 |
| 3 | `map_labeling` | Listening | Dropdown | ✅ Yes | L: S2 |
| 4 | `diagram_labeling` | Listening | Text (inline) | ✅ Yes | L: S4 |
| 5 | `matching_paragraphs` | Reading | Paragraph click | ✅ Yes | R: All passages |
| 6 | `sentence_completion` | Reading | Text | ✅ Yes | R: P1, P2 |
| 7 | `sentence_completion_wordlist` | Reading | Dropdown | ✅ Yes | R: P3 |
| 8 | `short_answer_reading` | Reading | Text | ✅ Yes | R: P2 |
| 9 | `true_false_not_given` | Reading | 3 buttons | ✅ Yes | R: P1, P3 |
| 10 | `yes_no_not_given` | Reading | 3 buttons | ✅ Yes | R: Variant |
| 11 | `writing_task` | Writing | Textarea | ❌ Manual | W: T1, T2 |
| 12 | `matching_draggable` | Bonus | Drag & drop | ✅ Yes | Any test |

---

## 📝 Payload Quick Reference

### Listening Types

**short_answer**
```json
{"prompt": "Job is _____ — 4 days", "max_words": 2, "answer_key": "part-time"}
```

**multiple_choice**
```json
{"prompt": "What time?", "options": ["10am", "9pm"], "answer_key": "B"}
```

**map_labeling**
```json
{"prompt": "Restaurant", "options": ["A","B","C"], "answer_key": "B", "image_url": "..."}
```

**diagram_labeling**
```json
{"prompt": "_____ rods", "max_words": 1, "answer_key": "Fuel", "image_url": "..."}
```

---

### Reading Types

**matching_paragraphs**
```json
{"prompt": "Description of brain development", "options": ["A","B",...], "answer_key": "A"}
```

**sentence_completion**
```json
{"prompt": "Subjects were exposed for a _____ period", "max_words": 1, "answer_key": "short"}
```

**sentence_completion_wordlist**
```json
{"prompt": "Our _____ list", "word_list": ["initial","current"], "answer_key": "current"}
```

**short_answer_reading**
```json
{"prompt": "What determines behavior?", "max_words": 3, "answer_key": "genetic variation"}
```

**true_false_not_given**
```json
{"prompt": "All music enhances performance", "options": ["TRUE","FALSE","NOT GIVEN"], "answer_key": "NOT GIVEN"}
```

---

### Writing Type

**writing_task**
```json
{
  "instructions": "Spend 20 minutes...",
  "prompt": "The chart shows...",
  "chart_image": "https://...",
  "min_words": 150,
  "task_number": 1,
  "answer_key": null
}
```

---

## 🔧 Implementation Checklist

### Adding New Question Type

**Backend** (`/app/backend/`)
- [ ] Add type to `ai_import_service.py` line 22-33
- [ ] Add grading logic to `server.py` line 569-575
- [ ] Add example in `init_*_test.py`
- [ ] Test validation with sample JSON

**Frontend** (`/app/frontend/src/components/`)
- [ ] Create component in `/reading/` or inline
- [ ] Add case to `renderQuestionComponent()`
- [ ] Implement `handleAnswerChange()` integration
- [ ] Style with Tailwind CSS
- [ ] Test on mobile and desktop

**Testing**
- [ ] Test rendering with sample question
- [ ] Test answer submission
- [ ] Verify auto-grading accuracy
- [ ] Check accessibility (ARIA, keyboard)
- [ ] Test with screen reader

---

## 🎨 Component Locations

```
Frontend Components:
├── ListeningTest.jsx (lines 397-546)
├── ReadingTest.jsx (lines 347-395)
├── WritingTest.jsx (full component)
├── reading/
│   ├── MatchingParagraphs.jsx
│   ├── SentenceCompletion.jsx
│   ├── TrueFalseNotGiven.jsx
│   └── ShortAnswerReading.jsx
└── questions/
    └── MatchingDraggable.jsx

Backend Files:
├── server.py (grading: 545-620)
├── ai_import_service.py (validation: 1-150)
├── init_ielts_test.py (listening samples)
├── init_reading_test.py (reading samples)
└── init_writing_test.py (writing samples)
```

---

## 🔍 Grading Logic Reference

### Case-Insensitive (Text-Based)
```python
["short_answer", "diagram_labeling", "sentence_completion", 
 "short_answer_reading", "sentence_completion_wordlist"]
```

### Exact Match (Choice-Based)
```python
["multiple_choice", "map_labeling", "matching_paragraphs", 
 "true_false_not_given", "yes_no_not_given"]
```

### Manual Only
```python
["writing_task"]
```

---

## 📊 Test Statistics

- **Total Types**: 12
- **Auto-Graded**: 11 (91.7%)
- **Manual-Graded**: 1 (8.3%)
- **With Images**: 3 (map_labeling, diagram_labeling, writing_task)
- **With Word Limits**: 6 (all text input types)
- **Interactive**: 1 (matching_draggable)

---

## 🚀 Performance Tips

1. **Use bulk operations** for multiple questions
2. **Cache exam data** to avoid repeated DB queries
3. **Lazy load images** for map/diagram types
4. **Debounce word counters** (300ms)
5. **Use React.memo** for question components
6. **Index MongoDB** on exam_id and section_id

---

## 🐛 Common Issues & Solutions

**Issue**: Question not rendering
- ✅ Check type spelling in database
- ✅ Verify payload has required fields
- ✅ Check browser console for errors

**Issue**: Answer not saving
- ✅ Verify question index matches
- ✅ Check handleAnswerChange is called
- ✅ Ensure answers state is updating

**Issue**: Wrong grading result
- ✅ Check answer_key format (string)
- ✅ Verify case sensitivity rules
- ✅ Check for leading/trailing spaces

**Issue**: Word counter not working
- ✅ Verify max_words in payload
- ✅ Check split regex: `/\s+/`
- ✅ Ensure trim() is applied

---

## 📱 Mobile Considerations

- ✅ Drag & drop has click alternative
- ✅ Radio buttons are touch-friendly (48px min)
- ✅ Text inputs auto-zoom disabled
- ✅ Navigation footer is sticky
- ✅ All interactive elements > 44px

---

## ♿ Accessibility Checklist

- ✅ All inputs have labels
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA
- ✅ Screen reader announces states

---

## 📚 Further Reading

- Full Documentation: `/app/QUESTION_TYPES_DOCUMENTATION.md`
- Visual Hierarchy: `/app/QUESTION_TYPES_VISUAL_MAP.md`
- Test Results: `/app/test_result.md`
- API Docs: Backend `/api/docs`

---

*Quick Reference v1.0 | IELTS Practice Test Platform*
