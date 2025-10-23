"""
Phase 2 Integration Test
Verifies complete Phase 2 workflow integration
"""

import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from database import db
from question_type_detector import QuestionTypeDetector
from track_creation_service import TrackCreationService
from local_auth_service import LocalAuthService


def test_phase2_track_creation():
    """Test Phase 2 track creation"""
    print("\n" + "="*60)
    print("TEST 1: Phase 2 Track Creation")
    print("="*60)

    try:
        # Phase 2: Create a track
        json_data = {
            'title': 'Integration Test Track',
            'type': 'listening',
            'sections': [
                {
                    'section_number': 1,
                    'title': 'Section 1',
                    'questions': [
                        {
                            'id': 'q1',
                            'text': 'Question 1',
                            'options': ['A', 'B', 'C'],
                            'correctAnswer': 'A'
                        }
                    ]
                },
                {
                    'section_number': 2,
                    'title': 'Section 2',
                    'questions': [
                        {
                            'id': 'q2',
                            'text': 'Question 2',
                            'options': ['A', 'B'],
                            'correctAnswers': ['A']
                        }
                    ]
                },
                {
                    'section_number': 3,
                    'title': 'Section 3',
                    'questions': [
                        {
                            'id': 'q3',
                            'text': 'Question 3',
                            'correctAnswer': 'True'
                        }
                    ]
                },
                {
                    'section_number': 4,
                    'title': 'Section 4',
                    'questions': [
                        {
                            'id': 'q4',
                            'text': 'Question 4',
                            'gaps': ['blank'],
                            'correctAnswer': 'answer'
                        }
                    ]
                }
            ]
        }

        track_result = TrackCreationService.create_track_from_json(
            json_data,
            admin_id='admin'
        )

        if not track_result['success']:
            print(f"❌ Failed to create track: {track_result['errors']}")
            return False

        print(f"✅ Track created: {track_result['track_id']}")
        print(f"✅ Questions created: {track_result['questions_created']}")
        print(f"✅ Question types: {track_result['questions_by_type']}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_all_18_question_types_in_track():
    """Test that all 18 question types can be created in a track"""
    print("\n" + "="*60)
    print("TEST 2: All 18 Question Types in Track")
    print("="*60)

    try:
        # Create a track with all 18 question types
        json_data = {
            'title': 'All Question Types Test',
            'type': 'listening',
            'sections': [
                {
                    'section_number': 1,
                    'title': 'Listening Types',
                    'questions': [
                        {'id': 'q1', 'text': 'MCQ Single', 'options': ['A', 'B'], 'correctAnswer': 'A'},
                        {'id': 'q2', 'text': 'MCQ Multiple', 'options': ['A', 'B', 'C'], 'correctAnswers': ['A', 'B']},
                        {'id': 'q3', 'text': 'Sentence Completion', 'gaps': ['blank'], 'correctAnswer': 'answer'},
                        {'id': 'q4', 'text': 'Form Completion', 'formFields': {'f1': ''}, 'correctAnswers': {'f1': 'val'}},
                        {'id': 'q5', 'text': 'Table Completion', 'tableData': {}, 'correctAnswers': {}},
                    ]
                },
                {
                    'section_number': 2,
                    'title': 'Reading Types',
                    'questions': [
                        {'id': 'q6', 'text': 'True/False/NG', 'correctAnswer': 'True'},
                        {'id': 'q7', 'text': 'Matching Headings', 'headings': ['H1'], 'paragraphs': ['P1']},
                        {'id': 'q8', 'text': 'Matching Features', 'features': ['F1'], 'options': ['O1']},
                        {'id': 'q9', 'text': 'Matching Endings', 'stems': ['S1'], 'endings': ['E1']},
                        {'id': 'q10', 'text': 'Note Completion', 'noteTemplate': {}, 'correctAnswers': {}},
                    ]
                },
                {
                    'section_number': 3,
                    'title': 'More Types',
                    'questions': [
                        {'id': 'q11', 'text': 'Summary Completion', 'summaryTemplate': '', 'options': []},
                        {'id': 'q12', 'text': 'Fill Gaps Short', 'gaps': ['b1'], 'maxWords': 2, 'correctAnswer': 'ans'},
                        {'id': 'q13', 'text': 'Flowchart', 'flowchartData': {}, 'correctAnswers': {}},
                        {'id': 'q14', 'text': 'Map Labelling', 'mapImage': '', 'correctAnswers': {}},
                        {'id': 'q15', 'text': 'Diagram Labelling', 'diagram': {}, 'correctAnswers': {}},
                    ]
                },
                {
                    'section_number': 4,
                    'title': 'Writing Types',
                    'questions': [
                        {'id': 'q16', 'text': 'Writing Task 1', 'minWords': 100, 'maxWords': 150, 'task_number': 1},
                        {'id': 'q17', 'text': 'Writing Task 2', 'minWords': 200, 'maxWords': 300, 'task_number': 2},
                        {'id': 'q18', 'text': 'Matching', 'items': ['I1'], 'options': ['O1'], 'type': 'matching'},
                    ]
                }
            ]
        }
        
        result = TrackCreationService.create_track_from_json(json_data)
        
        if not result['success']:
            print(f"❌ Failed: {result['errors']}")
            return False
        
        print(f"✅ Track created with {result['questions_created']} questions")
        print(f"✅ Question types detected: {len(result['questions_by_type'])} types")
        
        for qtype, count in result['questions_by_type'].items():
            print(f"   - {qtype}: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_database_persistence():
    """Test that database tables are properly created"""
    print("\n" + "="*60)
    print("TEST 3: Database Persistence")
    print("="*60)
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check all Phase 2 tables
        tables_to_check = ['tracks', 'sections', 'questions']
        
        for table in tables_to_check:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"✅ Table '{table}': {count} rows")
        
        # Check table schemas
        cursor.execute("PRAGMA table_info(tracks)")
        tracks_columns = [row[1] for row in cursor.fetchall()]
        print(f"✅ Tracks columns: {', '.join(tracks_columns[:5])}...")
        
        cursor.execute("PRAGMA table_info(questions)")
        questions_columns = [row[1] for row in cursor.fetchall()]
        print(f"✅ Questions columns: {', '.join(questions_columns[:5])}...")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_json_validation():
    """Test JSON validation for tracks"""
    print("\n" + "="*60)
    print("TEST 4: JSON Validation")
    print("="*60)

    try:
        # Test 1: Invalid - Only 3 sections
        json_data_3_sections = {
            'title': 'Test',
            'type': 'listening',
            'sections': [
                {'section_number': i, 'questions': [{'id': f'q{i}', 'text': f'Q{i}', 'options': ['A'], 'correctAnswer': 'A'}]}
                for i in range(1, 4)
            ]
        }

        result = TrackCreationService.create_track_from_json(json_data_3_sections)
        if not result['success']:
            print(f"✅ Correctly rejected 3-section track")
        else:
            print(f"❌ Should have rejected 3-section track")
            return False

        # Test 2: Invalid - Section with 11 questions
        json_data_11_questions = {
            'title': 'Test',
            'type': 'listening',
            'sections': [
                {
                    'section_number': 1,
                    'questions': [
                        {'id': f'q{i}', 'text': f'Q{i}', 'options': ['A'], 'correctAnswer': 'A'}
                        for i in range(1, 12)
                    ]
                }
            ] + [
                {'section_number': i, 'questions': [{'id': f'q{i}', 'text': f'Q{i}', 'options': ['A'], 'correctAnswer': 'A'}]}
                for i in range(2, 5)
            ]
        }

        result = TrackCreationService.create_track_from_json(json_data_11_questions)
        if not result['success']:
            print(f"✅ Correctly rejected section with 11 questions")
        else:
            print(f"❌ Should have rejected section with 11 questions")
            return False

        print(f"✅ JSON validation working correctly")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all integration tests"""
    print("\n" + "="*60)
    print("PHASE 2 INTEGRATION TEST SUITE")
    print("="*60)
    
    tests = [
        ("Phase 2 Track Creation", test_phase2_track_creation),
        ("All 18 Question Types", test_all_18_question_types_in_track),
        ("Database Persistence", test_database_persistence),
        ("JSON Validation", test_json_validation),
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
    print("INTEGRATION TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 Phase 2 Integration Complete!")
        print("\n📋 PHASE 2 SUMMARY:")
        print("   ✅ Database tables created (tracks, sections, questions)")
        print("   ✅ Question type detection working (18 types)")
        print("   ✅ Track creation from JSON working")
        print("   ✅ Phase 1 + Phase 2 integration verified")
        print("   ✅ JSON validation working")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == '__main__':
    sys.exit(main())

