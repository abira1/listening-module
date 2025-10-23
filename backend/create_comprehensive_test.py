"""
Create comprehensive IELTS test with ALL 18 question types
"""
import json
import sys
import sqlite3
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

from track_creation_service import TrackCreationService

def create_comprehensive_test():
    """Create test with all 18 question types"""
    
    test_data = {
        "test_type": "listening",
        "title": "IELTS Comprehensive Test - All 18 Question Types",
        "description": "Complete test demonstrating all 18 supported IELTS question types",
        "duration_seconds": 7200,
        "sections": [
            # SECTION 1: Listening Types (1-10)
            {
                "index": 1,
                "title": "Section 1: Listening Question Types",
                "instructions": "Questions 1-10: Listening section with 10 different question types",
                "passage_text": "Listen to the audio about a university accommodation office.",
                "questions": [
                    # 1. MCQ Single
                    {
                        "index": 1,
                        "type": "mcq_single",
                        "prompt": "What is the main purpose of the accommodation office?",
                        "answer_key": "B",
                        "options": ["To collect rent payments", "To help students find housing", "To manage university buildings", "To arrange student events"]
                    },
                    # 2. MCQ Multiple
                    {
                        "index": 2,
                        "type": "mcq_multiple",
                        "prompt": "Which of the following services does the office provide? (Select 2 answers)",
                        "answer_key": ["A", "B"],
                        "options": ["Housing assistance", "Lease advice", "Furniture sales", "Transportation"]
                    },
                    # 3. Sentence Completion
                    {
                        "index": 3,
                        "type": "sentence_completion",
                        "prompt": "Students can contact the office during business hours.",
                        "answer_key": "business"
                    },
                    # 4. Form Completion
                    {
                        "index": 4,
                        "type": "form_completion",
                        "prompt": "Application deadline: 31 August",
                        "answer_key": "31 August"
                    },
                    # 5. Table Completion
                    {
                        "index": 5,
                        "type": "table_completion",
                        "prompt": "Accommodation type: Shared flat | Price: £150/week",
                        "answer_key": "Shared flat"
                    },
                    # 6. Flowchart Completion
                    {
                        "index": 6,
                        "type": "flowchart_completion",
                        "prompt": "Step 1: Register → Step 2: View properties → Step 3: Sign lease",
                        "answer_key": "View properties"
                    },
                    # 7. Fill Gaps
                    {
                        "index": 7,
                        "type": "fill_gaps",
                        "prompt": "The office is located in the administration building, near the main entrance.",
                        "answer_key": ["administration"]
                    },
                    # 8. Fill Gaps Short
                    {
                        "index": 8,
                        "type": "fill_gaps_short",
                        "prompt": "Phone number: 555-1234",
                        "answer_key": "1234"
                    },
                    # 9. Matching
                    {
                        "index": 9,
                        "type": "matching",
                        "prompt": "Match accommodation types with descriptions",
                        "answer_key": "A",
                        "items": ["Halls of residence", "Private rental", "Host family"],
                        "options": ["University-owned", "Independent landlord", "Local family"]
                    },
                    # 10. Map Labelling
                    {
                        "index": 10,
                        "type": "map_labelling",
                        "prompt": "Label the accommodation office on the campus map",
                        "answer_key": "Building C",
                        "image": "campus_map.jpg",
                        "labels": ["Building A", "Building B", "Building C"]
                    }
                ]
            },
            # SECTION 2: Reading Types (11-16)
            {
                "index": 2,
                "title": "Section 2: Reading Question Types",
                "instructions": "Questions 11-16: Reading section with 6 different question types",
                "passage_text": "Climate change is one of the most pressing issues of our time. Rising temperatures are causing glaciers to melt, sea levels to rise, and weather patterns to become more extreme. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause.",
                "questions": [
                    # 11. True/False/Not Given
                    {
                        "index": 11,
                        "type": "true_false_ng",
                        "prompt": "Glaciers are melting due to rising temperatures.",
                        "answer_key": "True"
                    },
                    # 12. Matching Headings
                    {
                        "index": 12,
                        "type": "matching_headings",
                        "prompt": "Match paragraphs with headings",
                        "answer_key": "i",
                        "items": ["Global warming effects", "Solutions to climate change", "Historical climate data"]
                    },
                    # 13. Matching Features
                    {
                        "index": 13,
                        "type": "matching_features",
                        "prompt": "Match features with climate impacts",
                        "answer_key": "A",
                        "items": ["Rising sea levels", "Stable temperatures", "Decreasing CO2"],
                        "features": ["A. Rising sea levels", "B. Stable temperatures", "C. Decreasing CO2"]
                    },
                    # 14. Matching Endings
                    {
                        "index": 14,
                        "type": "matching_endings",
                        "prompt": "Climate change is caused by",
                        "answer_key": "B",
                        "items": ["natural cycles only", "human activities", "solar radiation"]
                    },
                    # 15. Note Completion
                    {
                        "index": 15,
                        "type": "note_completion",
                        "prompt": "Main cause of climate change",
                        "answer_key": "fossil fuels",
                        "notes": ["fossil fuels", "renewable energy", "natural cycles"]
                    },
                    # 16. Summary Completion
                    {
                        "index": 16,
                        "type": "summary_completion",
                        "prompt": "Climate change summary",
                        "answer_key": "sea levels",
                        "summary": "Climate change is affecting sea levels and weather patterns.",
                        "wordList": ["sea levels", "temperatures", "CO2", "glaciers"]
                    }
                ]
            },
            # SECTION 3: More Listening Types (17-20)
            {
                "index": 3,
                "title": "Section 3: Additional Listening Types",
                "instructions": "Questions 17-20: More listening examples",
                "passage_text": "A conversation about booking a hotel room.",
                "questions": [
                    # 17. MCQ Single (different context)
                    {
                        "index": 17,
                        "type": "mcq_single",
                        "prompt": "How many nights does the guest want to stay?",
                        "answer_key": "B",
                        "options": ["2 nights", "3 nights", "5 nights", "7 nights"]
                    },
                    # 18. Sentence Completion (different context)
                    {
                        "index": 18,
                        "type": "sentence_completion",
                        "prompt": "The hotel offers free breakfast for guests.",
                        "answer_key": "breakfast"
                    },
                    # 19. Form Completion (different context)
                    {
                        "index": 19,
                        "type": "form_completion",
                        "prompt": "Check-in time: 3:00 PM",
                        "answer_key": "3:00 PM"
                    },
                    # 20. Table Completion (different context)
                    {
                        "index": 20,
                        "type": "table_completion",
                        "prompt": "Room type: Double room | Rate: £80/night",
                        "answer_key": "Double room"
                    }
                ]
            },
            # SECTION 4: Writing Types (21-24)
            {
                "index": 4,
                "title": "Section 4: Writing Question Types",
                "instructions": "Questions 21-24: Writing tasks and additional types",
                "passage_text": "Writing section - complete the following tasks.",
                "questions": [
                    # 21. Writing Task 1
                    {
                        "index": 21,
                        "type": "writing_task1",
                        "prompt": "You should spend about 20 minutes on this task. The chart below shows the percentage of households with different types of technology in 2020. Summarize the information by selecting and reporting the main features.",
                        "minWords": 150,
                        "maxWords": 200
                    },
                    # 22. Writing Task 2
                    {
                        "index": 22,
                        "type": "writing_task2",
                        "prompt": "You should spend about 40 minutes on this task. Write about the following topic: Some people believe that technology has made our lives better, while others think it has made our lives worse. Discuss both views and give your own opinion.",
                        "minWords": 250,
                        "maxWords": 350
                    },
                    # 23. Fill Gaps (additional)
                    {
                        "index": 23,
                        "type": "fill_gaps",
                        "prompt": "The technology sector has experienced significant growth over the past decade.",
                        "answer_key": ["significant"]
                    },
                    # 24. Matching (additional)
                    {
                        "index": 24,
                        "type": "matching",
                        "prompt": "Match technology types with their primary uses",
                        "answer_key": "B",
                        "items": ["Communication", "Data storage", "Entertainment"],
                        "options": ["Phones and messaging", "Cloud services", "Video streaming"]
                    }
                ]
            }
        ]
    }
    
    return test_data

def convert_format(test_data):
    """Convert to system format"""
    converted = {
        "test_type": test_data["test_type"],
        "title": test_data["title"],
        "description": test_data["description"],
        "duration_seconds": test_data["duration_seconds"],
        "sections": []
    }

    for section in test_data["sections"]:
        converted_section = {
            "index": section["index"],
            "title": section["title"],
            "instructions": section["instructions"],
            "passage_text": section["passage_text"],
            "questions": []
        }

        for q in section["questions"]:
            qtype = q["type"]
            converted_q = {
                "id": f"q{q['index']}",
                "type": qtype,
                "text": q["prompt"]
            }

            # Handle different field names based on question type
            if qtype in ["writing_task1", "writing_task2"]:
                converted_q["prompt"] = q["prompt"]
                converted_q["minWords"] = q.get("minWords", 150)
                converted_q["maxWords"] = q.get("maxWords", 200)
            elif qtype == "mcq_single":
                # MCQ Single: correctAnswers should be a list with single item
                answer = q.get("answer_key", "")
                converted_q["correctAnswers"] = [answer] if answer else []
                converted_q["options"] = q.get("options", [])
            elif qtype == "mcq_multiple":
                # MCQ Multiple: correctAnswers is already a list
                converted_q["correctAnswers"] = q.get("answer_key", [])
                converted_q["options"] = q.get("options", [])
            elif qtype == "sentence_completion":
                # Sentence Completion: correctAnswers should be a list
                answer = q.get("answer_key", "")
                converted_q["correctAnswers"] = [answer] if answer else []
            elif qtype == "form_completion":
                # Form Completion: correctAnswers should be a list
                answer = q.get("answer_key", "")
                converted_q["correctAnswers"] = [answer] if answer else []
            elif qtype == "table_completion":
                # Table Completion: correctAnswers should be a list
                answer = q.get("answer_key", "")
                converted_q["correctAnswers"] = [answer] if answer else []
            elif qtype == "flowchart_completion":
                # Flowchart Completion: correctAnswers should be a list
                answer = q.get("answer_key", "")
                converted_q["correctAnswers"] = [answer] if answer else []
            elif qtype == "fill_gaps":
                # Fill Gaps: correctAnswers is already a list
                converted_q["correctAnswers"] = q.get("answer_key", [])
            elif qtype == "fill_gaps_short":
                # Fill Gaps Short: correctAnswers should be a list
                answer = q.get("answer_key", "")
                converted_q["correctAnswers"] = [answer] if answer else []
            elif qtype == "true_false_ng":
                # True/False/Not Given: correctAnswers should be a list
                answer = q.get("answer_key", "")
                converted_q["correctAnswers"] = [answer] if answer else []
            elif qtype == "matching":
                converted_q["items"] = q.get("items", [])
                converted_q["options"] = q.get("options", [])
            elif qtype == "map_labelling":
                converted_q["image"] = q.get("image", "")
                converted_q["labels"] = q.get("labels", [])
            elif qtype == "matching_headings":
                converted_q["items"] = q.get("items", [])
            elif qtype == "matching_features":
                converted_q["items"] = q.get("items", [])
                converted_q["features"] = q.get("features", [])
            elif qtype == "matching_endings":
                converted_q["items"] = q.get("items", [])
            elif qtype == "note_completion":
                converted_q["notes"] = q.get("notes", [])
            elif qtype == "summary_completion":
                converted_q["summary"] = q.get("summary", "")
                converted_q["wordList"] = q.get("wordList", [])

            converted_section["questions"].append(converted_q)

        converted["sections"].append(converted_section)

    return converted

def save_track_to_database(track_id, title, track_type, description, test_data, questions_by_type, total_questions):
    """Save track, sections, and questions to SQLite database"""
    conn = sqlite3.connect('data/ielts.db')
    cursor = conn.cursor()

    try:
        now = datetime.now().isoformat()

        # Create track
        cursor.execute('''
            INSERT INTO tracks (id, title, type, description, total_questions, total_sections, status, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (track_id, title, track_type, description, total_questions, len(test_data['sections']), 'inactive', 'admin', now, now))

        # Create sections and questions
        for section_idx, section in enumerate(test_data['sections'], 1):
            section_id = f"section-{track_id[:8]}-{section_idx}"

            # Create section
            cursor.execute('''
                INSERT INTO sections (id, track_id, section_number, title, description, question_count, duration_minutes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (section_id, track_id, section_idx, section.get('title', f'Section {section_idx}'),
                  section.get('passage_text', ''), len(section.get('questions', [])), 0, now))

            # Create questions for this section
            for q_idx, question in enumerate(section.get('questions', []), 1):
                question_id = f"q-{track_id[:8]}-{section_idx}-{q_idx}"

                # Build payload
                payload = {
                    'text': question.get('prompt', ''),
                    'type': question.get('type', ''),
                }

                # Add type-specific fields
                if question.get('type') in ['mcq_single', 'mcq_multiple']:
                    payload['options'] = question.get('options', [])
                    payload['correctAnswers'] = question.get('answer_key', [])
                    if isinstance(payload['correctAnswers'], str):
                        payload['correctAnswers'] = [payload['correctAnswers']]
                elif question.get('type') in ['sentence_completion', 'form_completion', 'table_completion', 'fill_gaps', 'fill_gaps_short']:
                    payload['correctAnswers'] = question.get('answer_key', [])
                    if isinstance(payload['correctAnswers'], str):
                        payload['correctAnswers'] = [payload['correctAnswers']]
                elif question.get('type') == 'true_false_ng':
                    payload['correctAnswers'] = question.get('answer_key', [])
                    if isinstance(payload['correctAnswers'], str):
                        payload['correctAnswers'] = [payload['correctAnswers']]
                elif question.get('type') in ['matching', 'matching_headings', 'matching_features', 'matching_endings']:
                    payload['items'] = question.get('items', [])
                    payload['options'] = question.get('options', [])
                    payload['correctAnswers'] = question.get('answer_key', [])
                elif question.get('type') == 'map_labelling':
                    payload['image'] = question.get('image', '')
                    payload['labels'] = question.get('labels', [])
                    payload['correctAnswers'] = question.get('answer_key', [])
                elif question.get('type') in ['note_completion', 'summary_completion']:
                    payload['correctAnswers'] = question.get('answer_key', [])
                    if isinstance(payload['correctAnswers'], str):
                        payload['correctAnswers'] = [payload['correctAnswers']]
                elif question.get('type') in ['writing_task1', 'writing_task2']:
                    payload['prompt'] = question.get('prompt', '')
                    payload['minWords'] = question.get('minWords', 150)
                    payload['maxWords'] = question.get('maxWords', 250)

                # Save question
                cursor.execute('''
                    INSERT INTO questions (id, track_id, section_id, question_number, type, payload, marks, difficulty, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (question_id, track_id, section_id, q_idx, question.get('type', ''),
                      json.dumps(payload), 1, 'medium', now))

        conn.commit()
        return True
    except Exception as e:
        print(f"[ERROR] Database error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 70)
    print("[*] CREATING COMPREHENSIVE IELTS TEST - ALL 18 QUESTION TYPES")
    print("=" * 70)

    # Create test data
    test_data = create_comprehensive_test()
    print(f"\n[OK] Test data created")
    print(f"   Sections: {len(test_data['sections'])}")

    # Count questions by type
    type_count = {}
    for section in test_data["sections"]:
        for q in section["questions"]:
            qtype = q["type"]
            type_count[qtype] = type_count.get(qtype, 0) + 1

    print(f"   Total questions: {sum(type_count.values())}")
    print(f"   Question types: {len(type_count)}")

    # Convert format
    converted_data = convert_format(test_data)
    print(f"\n[OK] Format converted")

    # Create track
    result = TrackCreationService.create_track_from_json(converted_data)

    if result['success']:
        track_id = result['track_id']

        # Save to database
        if save_track_to_database(
            track_id,
            test_data['title'],
            test_data['test_type'],
            test_data['description'],
            test_data,
            result['questions_by_type'],
            result['questions_created']
        ):
            print(f"\n[OK] SUCCESS!")
            print(f"   Track ID: {track_id}")
            print(f"   Questions Created: {result['questions_created']}")
            print(f"\n[INFO] Questions by Type:")
            for qtype, count in sorted(result['questions_by_type'].items()):
                print(f"   [OK] {qtype}: {count}")
        else:
            print(f"\n[ERROR] Failed to save to database!")
            sys.exit(1)
    else:
        print(f"\n[ERROR] FAILED!")
        print(f"   Errors: {result['errors']}")
        sys.exit(1)

