# Track System - Next Agent Checklist

## 🎯 Your Mission
Complete the Track System implementation (Phase 1). Foundation is 40% done.

---

## ✅ Pre-Flight Check

Before starting, verify these files exist:

**Backend:**
- [ ] `/app/backend/track_models.py` exists (313 lines)
- [ ] `/app/backend/track_api.py` exists (456 lines)
- [ ] `/app/backend/exam_track_api.py` exists (373 lines)

**Frontend:**
- [ ] `/app/frontend/src/components/track-questions/QuestionWrapper.jsx` exists
- [ ] 9 question component files exist in `listening/`, `reading/`, `writing/` folders

**Documentation:**
- [ ] `/app/docs/TRACK_SYSTEM_IMPLEMENTATION_PLAN.md` exists
- [ ] `/app/docs/TRACK_SYSTEM_HANDOFF.md` exists (this is your main guide)

If any are missing, STOP and request the previous agent's work.

---

## 📝 Task Checklist

### Task 1: Server Integration (30 min)
- [ ] Open `/app/backend/server.py`
- [ ] Add imports:
  ```python
  from track_api import get_router as get_track_router
  from exam_track_api import get_router as get_exam_track_router
  ```
- [ ] Add router includes:
  ```python
  app.include_router(get_track_router())
  app.include_router(get_exam_track_router())
  ```
- [ ] Test with curl: `curl http://localhost:8001/api/tracks`
- [ ] Should return `{"tracks":[],"total":0,"page":1,"page_size":20}`

### Task 2: Track Service (1 hour)
- [ ] Create `/app/frontend/src/services/TrackService.js`
- [ ] Implement methods:
  - [ ] `createTrack(data)`
  - [ ] `listTracks(filters)`
  - [ ] `getTrack(id)`
  - [ ] `updateTrack(id, data)`
  - [ ] `deleteTrack(id)`
  - [ ] `uploadAudio(trackId, file)`
  - [ ] `setAudioUrl(trackId, url)`
  - [ ] `addQuestion(trackId, sectionOrder, questionData)`
  - [ ] `updateQuestion(trackId, sectionOrder, questionId, data)`
  - [ ] `deleteQuestion(trackId, sectionOrder, questionId)`
  - [ ] `validateTrack(trackId)`
  - [ ] `publishTrack(trackId)`
- [ ] Test each method with console.log

### Task 3: Track Management UI (4 hours)

**3.1: TrackManagement.jsx (List Page)**
- [ ] Create `/app/frontend/src/components/admin/TrackManagement.jsx`
- [ ] Implement:
  - [ ] Fetch tracks on mount
  - [ ] Display in table (title, type, status, actions)
  - [ ] Filter by type dropdown
  - [ ] Search input
  - [ ] "Create Track" button → navigate to editor
  - [ ] Edit button → navigate to editor with ID
  - [ ] Delete button with confirmation
  - [ ] Publish/Unpublish toggle
- [ ] Style with Tailwind (match existing admin pages)

**3.2: TrackEditor.jsx (Stepper Form)**
- [ ] Create `/app/frontend/src/components/admin/TrackEditor.jsx`
- [ ] Implement 4-step stepper:
  - [ ] Step 1: Metadata form
  - [ ] Step 2: Audio upload (conditional on listening type)
  - [ ] Step 3: Sections & questions
  - [ ] Step 4: Review & publish
- [ ] Navigation: Back/Next buttons
- [ ] Validation on each step
- [ ] Save draft functionality

**3.3: QuestionEditorModal.jsx**
- [ ] Create `/app/frontend/src/components/admin/QuestionEditorModal.jsx`
- [ ] Implement:
  - [ ] Question type dropdown (9 types)
  - [ ] Dynamic form based on selected type
  - [ ] Payload field inputs (prompt, options, answer_key, etc.)
  - [ ] Image upload (for types that support it)
  - [ ] Validation
  - [ ] Save/Cancel buttons
- [ ] Preview pane (optional)

**3.4: Router Integration**
- [ ] Open `/app/frontend/src/components/admin/AdminRouter.jsx`
- [ ] Add route: `/admin/tracks` → TrackManagement
- [ ] Add route: `/admin/tracks/new` → TrackEditor
- [ ] Add route: `/admin/tracks/:id/edit` → TrackEditor
- [ ] Update admin sidebar with "Tracks" link

### Task 4: Student Interface (3 hours)

**4.1: ExamTrackService.js**
- [ ] Create `/app/frontend/src/services/ExamTrackService.js`
- [ ] Implement:
  - [ ] `startExam(examId)`
  - [ ] `nextTrack(submissionId)`
  - [ ] `autosaveAnswer(submissionId, trackId, questionId, answer)`
  - [ ] `submitExam(submissionId)`
  - [ ] `getSubmission(submissionId)`

**4.2: TrackExam.jsx**
- [ ] Create `/app/frontend/src/components/TrackExam.jsx`
- [ ] Implement:
  - [ ] Fixed header with timer
  - [ ] Audio player (if listening)
  - [ ] Render sections with questions using QuestionWrapper
  - [ ] QTI footer navigation (40 buttons)
  - [ ] Answer state management
  - [ ] Autosave with debounce (3 seconds)
  - [ ] Timer with auto-submit
  - [ ] Track completion handler

**4.3: WaitingScreen.jsx**
- [ ] Create `/app/frontend/src/components/WaitingScreen.jsx`
- [ ] Implement:
  - [ ] Large countdown timer
  - [ ] Track progress display
  - [ ] "Skip Wait" button (optional)
  - [ ] Auto-navigate when countdown ends
  - [ ] Motivational message

**4.4: ExamTest.jsx Integration**
- [ ] Open `/app/frontend/src/components/ExamTest.jsx`
- [ ] Add detection: if exam has `tracks` field, use TrackExam
- [ ] Otherwise, use existing ListeningTest/ReadingTest
- [ ] Pass correct props

### Task 5: Migration Script (2 hours)
- [ ] Create `/app/scripts/migrate_to_tracks.py`
- [ ] Implement logic from handoff document
- [ ] Test on a single exam first
- [ ] Run full migration
- [ ] Verify in MongoDB: `db.tracks.find().count()`

### Task 6: Testing (3 hours)

**6.1: Backend Tests**
- [ ] Create `/app/tests/test_track_api.py`
- [ ] Test: Create track
- [ ] Test: List tracks
- [ ] Test: Add question
- [ ] Test: Upload audio
- [ ] Test: Create exam from tracks
- [ ] Run: `pytest tests/test_track_api.py -v`

**6.2: Frontend Tests**
- [ ] Create test files in `/app/frontend/src/components/track-questions/__tests__/`
- [ ] Test each question component
- [ ] Run: `cd frontend && yarn test`

**6.3: E2E Tests**
- [ ] Create `/app/tests/e2e/test_track_flow.py`
- [ ] Test full flow: create → publish → take exam → submit
- [ ] Run: `pytest tests/e2e/test_track_flow.py -v`

### Task 7: Documentation (2 hours)
- [ ] Create `/app/docs/ADMIN_TRACK_GUIDE.md`
- [ ] Create `/app/docs/QUESTION_TYPE_GUIDE.md`
- [ ] Create `/app/docs/API_TRACK_REFERENCE.md`
- [ ] Create `/app/docs/TRACK_MIGRATION_GUIDE.md`
- [ ] Update `/app/README.md` with Track System section

---

## 🧪 Testing Checklist

After each task, verify:

**After Task 1:**
- [ ] `curl http://localhost:8001/api/tracks` returns valid JSON
- [ ] Backend logs show no errors

**After Task 2:**
- [ ] Can call TrackService methods from browser console
- [ ] Network tab shows API requests

**After Task 3:**
- [ ] Can navigate to /admin/tracks
- [ ] Can create a track with 1 question
- [ ] Track appears in list

**After Task 4:**
- [ ] Can start a track-based exam
- [ ] Questions render correctly
- [ ] Answers autosave (check network tab)
- [ ] Timer counts down

**After Task 5:**
- [ ] Old exams converted to tracks
- [ ] Track count matches old exam count
- [ ] Questions preserved

**After Task 6:**
- [ ] All tests pass
- [ ] No console errors

---

## 🐛 Debugging Tips

If stuck:

1. **API not working?**
   - Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
   - Verify MongoDB: `mongo` then `use ielts_platform` then `db.tracks.find()`

2. **Frontend not rendering?**
   - Check browser console for errors
   - Verify imports are correct
   - Check component props

3. **Autosave not working?**
   - Check network tab for 429 (too many requests)
   - Verify debounce is working (should fire every 3s max)
   - Check localStorage as backup

4. **Questions not rendering?**
   - Verify QuestionWrapper import
   - Check question type matches component map
   - Console.log the question object

5. **Audio not playing?**
   - Check CORS headers
   - Verify audio URL is accessible
   - Check file format

---

## 📊 Progress Tracking

Update this as you complete tasks:

```
Total Tasks: 7
Completed: [ ] / 7

Task 1: [ ] Server Integration
Task 2: [ ] Track Service
Task 3: [ ] Track Management UI
Task 4: [ ] Student Interface
Task 5: [ ] Migration Script
Task 6: [ ] Testing
Task 7: [ ] Documentation

Estimated Time Remaining: _____ hours
```

---

## 🎉 Completion Criteria

You're done when:

1. [ ] Admin can create a listening track with audio
2. [ ] Admin can add 10 questions to the track
3. [ ] Admin can publish the track
4. [ ] Admin can create an exam from 2 tracks
5. [ ] Student can start the exam
6. [ ] Student sees first track with questions
7. [ ] Answers autosave every 3 seconds
8. [ ] Timer counts down and auto-submits
9. [ ] Waiting screen shows for 120 seconds
10. [ ] Second track loads after waiting
11. [ ] Final submission succeeds
12. [ ] All tests pass
13. [ ] Documentation is complete

---

## 📞 Need Help?

Refer to:
- `/app/docs/TRACK_SYSTEM_HANDOFF.md` - Detailed instructions for each task
- `/app/docs/TRACK_SYSTEM_IMPLEMENTATION_PLAN.md` - Original architecture plan
- `/app/COMPLETE_SYSTEM_INDEX.md` - Overall system documentation

---

**Start with Task 1 and work sequentially. Good luck! 🚀**
