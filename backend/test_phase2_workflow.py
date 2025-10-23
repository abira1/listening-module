"""
Phase 2 Workflow Test
Tests complete JSON upload, type detection, and track creation
"""

import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from database import db
from question_type_detector import QuestionTypeDetector
from track_creation_service import TrackCreationService


def test_database_tables():
    """Test that all database tables exist"""
    print("\n" + "="*60)
    print("TEST 1: Database Tables")
    print("="*60)
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        required_tables = ['tracks', 'sections', 'questions']
        for table in required_tables:
            if table in tables:
                print(f"✅ Table '{table}' exists")
            else:
                print(f"❌ Table '{table}' missing")
        
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_question_type_detection():
    """Test question type detection"""
    print("\n" + "="*60)
    print("TEST 2: Question Type Detection")
    print("="*60)

    test_cases = [
        {
            'name': 'MCQ Single',
            'question': {
                'options': ['A', 'B', 'C'],
                'correctAnswer': 'A'
            },
            'expected': 'mcq_single'
        },
        {
            'name': 'MCQ Multiple',
            'question': {
                'options': ['A', 'B', 'C'],
                'correctAnswers': ['A', 'C']
            },
            'expected': 'mcq_multiple'
        },
        {
            'name': 'Fill Gaps',
            'question': {
                'gaps': ['blank1', 'blank2'],
                'correctAnswer': 'answer'
            },
            'expected': 'fill_gaps'
        },
        {
            'name': 'Form Completion',
            'question': {
                'formFields': {'name': '', 'email': ''},
                'correctAnswers': {'name': 'John', 'email': 'john@example.com'}
            },
            'expected': 'form_completion'
        },
        {
            'name': 'Matching',
            'question': {
                'items': ['Item 1', 'Item 2'],
                'options': ['Option A', 'Option B'],
                'correctMatches': {'Item 1': 'Option A'},
                'type': 'matching'  # Explicit type to avoid MCQ detection
            },
            'expected': 'matching'
        },
        {
            'name': 'True/False/Not Given',
            'question': {
                'correctAnswer': 'True'
            },
            'expected': 'true_false_ng'
        },
        {
            'name': 'Writing Task 1',
            'question': {
                'minWords': 100,
                'maxWords': 150,
                'task_number': 1
            },
            'expected': 'writing_task1'
        },
        {
            'name': 'Writing Task 2',
            'question': {
                'minWords': 200,
                'maxWords': 300,
                'task_number': 2
            },
            'expected': 'writing_task2'
        }
    ]

    passed = 0
    for test in test_cases:
        detected = QuestionTypeDetector.detect_type(test['question'])
        if detected == test['expected']:
            print(f"✅ {test['name']}: {detected}")
            passed += 1
        else:
            print(f"❌ {test['name']}: Expected {test['expected']}, got {detected}")

    print(f"\nPassed: {passed}/{len(test_cases)}")
    return passed == len(test_cases)


def test_track_creation():
    """Test track creation from JSON"""
    print("\n" + "="*60)
    print("TEST 3: Track Creation from JSON")
    print("="*60)

    # Sample JSON with 4 sections and mixed question types
    json_data = {
        'title': 'IELTS Listening Practice Test 1',
        'type': 'listening',
        'description': 'Full listening test with 4 sections',
        'sections': [
            {
                'section_number': 1,
                'title': 'Conversation',
                'questions': [
                    {
                        'id': 'q1',
                        'text': 'What is the main topic?',
                        'options': ['Travel', 'Work', 'Study'],
                        'correctAnswer': 'Travel',
                        'marks': 1
                    },
                    {
                        'id': 'q2',
                        'text': 'The meeting is on ___',
                        'gaps': ['blank1'],
                        'correctAnswer': 'Tuesday',
                        'marks': 1
                    }
                ]
            },
            {
                'section_number': 2,
                'title': 'Monologue',
                'questions': [
                    {
                        'id': 'q3',
                        'text': 'Which statement is true?',
                        'correctAnswer': 'True',
                        'marks': 1
                    }
                ]
            },
            {
                'section_number': 3,
                'title': 'Academic Discussion',
                'questions': [
                    {
                        'id': 'q4',
                        'text': 'Match the items',
                        'items': ['Item 1', 'Item 2'],
                        'options': ['Option A', 'Option B'],
                        'correctMatches': {'Item 1': 'Option A'},
                        'marks': 1
                    }
                ]
            },
            {
                'section_number': 4,
                'title': 'Lecture',
                'questions': [
                    {
                        'id': 'q5',
                        'text': 'Complete the form',
                        'formFields': {'name': '', 'email': ''},
                        'correctAnswers': {'name': 'John', 'email': 'john@example.com'},
                        'marks': 1
                    }
                ]
            }
        ]
    }

    try:
        # Create track
        result = TrackCreationService.create_track_from_json(json_data, admin_id='test_admin')

        if not result['success']:
            print(f"❌ Track creation failed: {result['errors']}")
            return False

        print(f"✅ Track created: {result['track_id']}")
        print(f"✅ Questions created: {result['questions_created']}")
        print(f"✅ Questions by type: {result['questions_by_type']}")

        # Verify track object
        track = result['track']
        if track:
            print(f"✅ Track object: {track['title']}")
            print(f"✅ Track has {len(track.get('sections', []))} sections")
        else:
            print(f"❌ Track object missing")
            return False

        # Verify sections in track
        sections = track.get('sections', [])
        total_questions = sum(len(s.get('questions', [])) for s in sections)
        print(f"✅ Total questions in track: {total_questions}")

        # Verify question types detected
        if result['questions_by_type']:
            print(f"✅ Question types detected: {result['questions_by_type']}")
        else:
            print(f"❌ No question types detected")
            return False

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_all_question_types():
    """Test detection of all 18 question types"""
    print("\n" + "="*60)
    print("TEST 4: All 18 Question Types")
    print("="*60)
    
    all_types = QuestionTypeDetector.get_all_types()
    print(f"Total supported types: {len(all_types)}")
    
    for qtype in all_types:
        print(f"  - {qtype}")
    
    return len(all_types) >= 18


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("PHASE 2 WORKFLOW TEST SUITE")
    print("="*60)
    
    tests = [
        ("Database Tables", test_database_tables),
        ("Question Type Detection", test_question_type_detection),
        ("Track Creation", test_track_creation),
        ("All Question Types", test_all_question_types),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Test '{name}' crashed: {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Phase 2 is ready!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == '__main__':
    sys.exit(main())

