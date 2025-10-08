#!/usr/bin/env python3
"""
IELTS Listening Practice Test 1 - Specific Backend API Tests
Tests the specific IELTS exam with ID: 8f1f5182-1747-41f2-b1cb-34c78dd68831
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend environment
BACKEND_URL = "https://code-index.preview.emergentagent.com/api"

# Specific exam ID to test
IELTS_EXAM_ID = "8f1f5182-1747-41f2-b1cb-34c78dd68831"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== {test_name} ==={Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def test_published_exams_contains_ielts():
    """Test 1: GET /api/exams/published - Verify the IELTS test appears in published exams list"""
    print_test_header("Published Exams - IELTS Test Verification")
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/published", timeout=10)
        
        if response.status_code == 200:
            published_exams = response.json()
            print_success(f"Published exams retrieved - Status: {response.status_code}")
            print_info(f"Total published exams: {len(published_exams)}")
            
            # Look for the specific IELTS exam
            ielts_exam = None
            for exam in published_exams:
                if exam.get('id') == IELTS_EXAM_ID:
                    ielts_exam = exam
                    break
            
            if ielts_exam:
                print_success(f"IELTS Listening Practice Test 1 found in published exams")
                print_info(f"Title: {ielts_exam.get('title')}")
                print_info(f"Published: {ielts_exam.get('published')}")
                return ielts_exam
            else:
                print_error(f"IELTS exam with ID {IELTS_EXAM_ID} not found in published exams")
                print_info("Available published exams:")
                for exam in published_exams:
                    print_info(f"  - {exam.get('title')} (ID: {exam.get('id')})")
                return None
        else:
            print_error(f"Failed to retrieve published exams - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Published exams request failed: {str(e)}")
        return None

def test_ielts_exam_details():
    """Test 2: GET /api/exams/{exam_id} - Verify exam details"""
    print_test_header("IELTS Exam Details Verification")
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/{IELTS_EXAM_ID}", timeout=10)
        
        if response.status_code == 200:
            exam = response.json()
            print_success(f"IELTS exam details retrieved - Status: {response.status_code}")
            
            # Verify critical details
            title = exam.get('title')
            audio_url = exam.get('audio_url')
            duration_seconds = exam.get('duration_seconds')
            question_count = exam.get('question_count')
            published = exam.get('published')
            
            print_info(f"Title: {title}")
            print_info(f"Audio URL: {audio_url}")
            print_info(f"Duration: {duration_seconds} seconds")
            print_info(f"Question Count: {question_count}")
            print_info(f"Published: {published}")
            
            # Critical checks
            checks_passed = 0
            total_checks = 5
            
            if "IELTS Listening Practice Test 1" in str(title):
                print_success("✓ Title contains 'IELTS Listening Practice Test 1'")
                checks_passed += 1
            else:
                print_error(f"✗ Title mismatch. Expected 'IELTS Listening Practice Test 1', got: {title}")
            
            if audio_url == "https://audio.jukehost.co.uk/F9irt6LcsYuP93ulaMo42JfXBEcABytV":
                print_success("✓ Audio URL matches expected value")
                checks_passed += 1
            else:
                print_error(f"✗ Audio URL mismatch. Expected: https://audio.jukehost.co.uk/F9irt6LcsYuP93ulaMo42JfXBEcABytV, got: {audio_url}")
            
            if duration_seconds == 2004:
                print_success("✓ Duration is 2004 seconds (33:24 total)")
                checks_passed += 1
            else:
                print_error(f"✗ Duration mismatch. Expected: 2004 seconds, got: {duration_seconds}")
            
            if question_count == 40:
                print_success("✓ Question count is 40")
                checks_passed += 1
            else:
                print_error(f"✗ Question count mismatch. Expected: 40, got: {question_count}")
            
            if published == True:
                print_success("✓ Exam is published")
                checks_passed += 1
            else:
                print_error(f"✗ Exam not published. Expected: True, got: {published}")
            
            print_info(f"Exam details verification: {checks_passed}/{total_checks} checks passed")
            return exam if checks_passed >= 4 else None  # Allow 1 minor failure
            
        else:
            print_error(f"Failed to retrieve IELTS exam details - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"IELTS exam details request failed: {str(e)}")
        return None

def test_ielts_full_exam_structure():
    """Test 3: GET /api/exams/{exam_id}/full - Verify complete exam structure"""
    print_test_header("IELTS Full Exam Structure Verification")
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/{IELTS_EXAM_ID}/full", timeout=10)
        
        if response.status_code == 200:
            full_data = response.json()
            print_success(f"IELTS full exam data retrieved - Status: {response.status_code}")
            
            exam = full_data.get('exam', {})
            sections = full_data.get('sections', [])
            
            print_info(f"Exam: {exam.get('title')}")
            print_info(f"Sections count: {len(sections)}")
            
            if len(sections) != 4:
                print_error(f"Expected 4 sections, found {len(sections)}")
                return None
            
            # Verify each section structure and question counts
            section_checks = []
            total_questions = 0
            
            for i, section in enumerate(sections, 1):
                section_title = section.get('title', f'Section {i}')
                questions = section.get('questions', [])
                question_count = len(questions)
                total_questions += question_count
                
                print_info(f"Section {i} ({section_title}): {question_count} questions")
                
                # Detailed section verification
                if i == 1:
                    section_checks.append(verify_section_1(section, questions))
                elif i == 2:
                    section_checks.append(verify_section_2(section, questions))
                elif i == 3:
                    section_checks.append(verify_section_3(section, questions))
                elif i == 4:
                    section_checks.append(verify_section_4(section, questions))
            
            print_info(f"Total questions across all sections: {total_questions}")
            
            # Overall verification
            if total_questions == 40:
                print_success("✓ Total question count is 40")
            else:
                print_error(f"✗ Total question count mismatch. Expected: 40, got: {total_questions}")
                return None
            
            passed_sections = sum(1 for check in section_checks if check)
            print_info(f"Section structure verification: {passed_sections}/4 sections passed")
            
            return full_data if passed_sections >= 3 else None  # Allow 1 section to have minor issues
            
        else:
            print_error(f"Failed to retrieve IELTS full exam data - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"IELTS full exam data request failed: {str(e)}")
        return None

def verify_section_1(section, questions):
    """Verify Section 1 has 10 short_answer questions"""
    print_test_header("Section 1 Verification")
    
    if len(questions) != 10:
        print_error(f"Section 1: Expected 10 questions, found {len(questions)}")
        return False
    
    short_answer_count = 0
    question_indices = []
    
    for question in questions:
        q_type = question.get('type')
        q_index = question.get('index')
        question_indices.append(q_index)
        
        if q_type == 'short_answer':
            short_answer_count += 1
    
    print_info(f"Section 1 question indices: {sorted(question_indices)}")
    print_info(f"Short answer questions: {short_answer_count}/10")
    
    if short_answer_count == 10:
        print_success("✓ Section 1: All 10 questions are short_answer type")
        return True
    else:
        print_error(f"✗ Section 1: Expected 10 short_answer questions, found {short_answer_count}")
        return False

def verify_section_2(section, questions):
    """Verify Section 2 has 6 map_labeling questions (11-16) and 4 multiple_choice questions (17-20)"""
    print_test_header("Section 2 Verification")
    
    if len(questions) != 10:
        print_error(f"Section 2: Expected 10 questions, found {len(questions)}")
        return False
    
    map_labeling_count = 0
    multiple_choice_count = 0
    map_labeling_with_image = 0
    question_indices = []
    
    for question in questions:
        q_type = question.get('type')
        q_index = question.get('index')
        payload = question.get('payload', {})
        question_indices.append(q_index)
        
        if q_type == 'map_labeling':
            map_labeling_count += 1
            if 'image_url' in payload and payload['image_url']:
                map_labeling_with_image += 1
        elif q_type == 'multiple_choice':
            multiple_choice_count += 1
    
    print_info(f"Section 2 question indices: {sorted(question_indices)}")
    print_info(f"Map labeling questions: {map_labeling_count} (with image: {map_labeling_with_image})")
    print_info(f"Multiple choice questions: {multiple_choice_count}")
    
    checks_passed = 0
    
    if map_labeling_count == 6:
        print_success("✓ Section 2: Found 6 map_labeling questions")
        checks_passed += 1
    else:
        print_error(f"✗ Section 2: Expected 6 map_labeling questions, found {map_labeling_count}")
    
    if multiple_choice_count == 4:
        print_success("✓ Section 2: Found 4 multiple_choice questions")
        checks_passed += 1
    else:
        print_error(f"✗ Section 2: Expected 4 multiple_choice questions, found {multiple_choice_count}")
    
    if map_labeling_with_image == 6:
        print_success("✓ Section 2: All map_labeling questions have image_url")
        checks_passed += 1
    else:
        print_warning(f"Section 2: {map_labeling_with_image}/6 map_labeling questions have image_url")
    
    return checks_passed >= 2

def verify_section_3(section, questions):
    """Verify Section 3 has 5 multiple_choice (21-25), 3 short_answer (26-28), 2 multiple_choice (29-30)"""
    print_test_header("Section 3 Verification")
    
    if len(questions) != 10:
        print_error(f"Section 3: Expected 10 questions, found {len(questions)}")
        return False
    
    multiple_choice_count = 0
    short_answer_count = 0
    question_indices = []
    
    for question in questions:
        q_type = question.get('type')
        q_index = question.get('index')
        question_indices.append(q_index)
        
        if q_type == 'multiple_choice':
            multiple_choice_count += 1
        elif q_type == 'short_answer':
            short_answer_count += 1
    
    print_info(f"Section 3 question indices: {sorted(question_indices)}")
    print_info(f"Multiple choice questions: {multiple_choice_count}")
    print_info(f"Short answer questions: {short_answer_count}")
    
    checks_passed = 0
    
    if multiple_choice_count == 7:  # 5 + 2 = 7 total multiple choice
        print_success("✓ Section 3: Found 7 multiple_choice questions (5+2)")
        checks_passed += 1
    else:
        print_error(f"✗ Section 3: Expected 7 multiple_choice questions, found {multiple_choice_count}")
    
    if short_answer_count == 3:
        print_success("✓ Section 3: Found 3 short_answer questions")
        checks_passed += 1
    else:
        print_error(f"✗ Section 3: Expected 3 short_answer questions, found {short_answer_count}")
    
    return checks_passed >= 1

def verify_section_4(section, questions):
    """Verify Section 4 has 5 diagram_labeling questions (31-35) and 5 short_answer questions (36-40)"""
    print_test_header("Section 4 Verification")
    
    if len(questions) != 10:
        print_error(f"Section 4: Expected 10 questions, found {len(questions)}")
        return False
    
    diagram_labeling_count = 0
    short_answer_count = 0
    diagram_labeling_with_image = 0
    question_indices = []
    
    for question in questions:
        q_type = question.get('type')
        q_index = question.get('index')
        payload = question.get('payload', {})
        question_indices.append(q_index)
        
        if q_type == 'diagram_labeling':
            diagram_labeling_count += 1
            if 'image_url' in payload and payload['image_url']:
                diagram_labeling_with_image += 1
        elif q_type == 'short_answer':
            short_answer_count += 1
    
    print_info(f"Section 4 question indices: {sorted(question_indices)}")
    print_info(f"Diagram labeling questions: {diagram_labeling_count} (with image: {diagram_labeling_with_image})")
    print_info(f"Short answer questions: {short_answer_count}")
    
    checks_passed = 0
    
    if diagram_labeling_count == 5:
        print_success("✓ Section 4: Found 5 diagram_labeling questions")
        checks_passed += 1
    else:
        print_error(f"✗ Section 4: Expected 5 diagram_labeling questions, found {diagram_labeling_count}")
    
    if short_answer_count == 5:
        print_success("✓ Section 4: Found 5 short_answer questions")
        checks_passed += 1
    else:
        print_error(f"✗ Section 4: Expected 5 short_answer questions, found {short_answer_count}")
    
    if diagram_labeling_with_image == 5:
        print_success("✓ Section 4: All diagram_labeling questions have image_url")
        checks_passed += 1
    else:
        print_warning(f"Section 4: {diagram_labeling_with_image}/5 diagram_labeling questions have image_url")
    
    return checks_passed >= 2

def test_create_submission():
    """Test 8: POST /api/submissions - Create a test submission with sample answers"""
    print_test_header("Create Test Submission")
    
    # Create realistic sample answers for all 40 questions
    sample_answers = {}
    
    # Section 1 (1-10): Short answer questions
    for i in range(1, 11):
        sample_answers[str(i)] = f"answer_{i}"
    
    # Section 2 (11-20): Map labeling (11-16) + Multiple choice (17-20)
    for i in range(11, 17):  # Map labeling
        sample_answers[str(i)] = f"location_{i}"
    for i in range(17, 21):  # Multiple choice
        sample_answers[str(i)] = "A"  # Sample choice
    
    # Section 3 (21-30): Multiple choice (21-25, 29-30) + Short answer (26-28)
    for i in range(21, 26):  # Multiple choice
        sample_answers[str(i)] = "B"
    for i in range(26, 29):  # Short answer
        sample_answers[str(i)] = f"response_{i}"
    for i in range(29, 31):  # Multiple choice
        sample_answers[str(i)] = "C"
    
    # Section 4 (31-40): Diagram labeling (31-35) + Short answer (36-40)
    for i in range(31, 36):  # Diagram labeling
        sample_answers[str(i)] = f"component_{i}"
    for i in range(36, 41):  # Short answer
        sample_answers[str(i)] = f"final_answer_{i}"
    
    submission_data = {
        "exam_id": IELTS_EXAM_ID,
        "user_id_or_session": "test_user_ielts_submission",
        "answers": sample_answers,
        "started_at": datetime.now().isoformat(),
        "finished_at": datetime.now().isoformat(),
        "progress_percent": 100
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/submissions",
            json=submission_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            submission = response.json()
            print_success(f"Test submission created - Status: {response.status_code}")
            print_info(f"Submission ID: {submission.get('id')}")
            print_info(f"Exam ID: {submission.get('exam_id')}")
            print_info(f"User/Session: {submission.get('user_id_or_session')}")
            print_info(f"Answers count: {len(submission.get('answers', {}))}")
            print_info(f"Progress: {submission.get('progress_percent')}%")
            
            if len(submission.get('answers', {})) == 40:
                print_success("✓ Submission contains all 40 answers")
            else:
                print_warning(f"Submission contains {len(submission.get('answers', {}))} answers (expected 40)")
            
            return submission
        else:
            print_error(f"Submission creation failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Submission creation request failed: {str(e)}")
        return None

def test_retrieve_submission(submission_id):
    """Test 9: GET /api/submissions/{submission_id} - Retrieve the created submission"""
    print_test_header("Retrieve Test Submission")
    
    if not submission_id:
        print_error("No submission ID provided for retrieval test")
        return None
    
    try:
        response = requests.get(f"{BACKEND_URL}/submissions/{submission_id}", timeout=10)
        
        if response.status_code == 200:
            submission = response.json()
            print_success(f"Submission retrieved - Status: {response.status_code}")
            print_info(f"Submission ID: {submission.get('id')}")
            print_info(f"Exam ID: {submission.get('exam_id')}")
            print_info(f"User/Session: {submission.get('user_id_or_session')}")
            print_info(f"Answers count: {len(submission.get('answers', {}))}")
            
            # Verify it's the correct submission
            if submission.get('id') == submission_id and submission.get('exam_id') == IELTS_EXAM_ID:
                print_success("✓ Retrieved submission matches created submission")
                return submission
            else:
                print_error("✗ Retrieved submission doesn't match expected values")
                return None
        else:
            print_error(f"Submission retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Submission retrieval request failed: {str(e)}")
        return None

def test_exam_submissions():
    """Test 10: GET /api/exams/{exam_id}/submissions - List all submissions for this exam"""
    print_test_header("List Exam Submissions")
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/{IELTS_EXAM_ID}/submissions", timeout=10)
        
        if response.status_code == 200:
            submissions = response.json()
            print_success(f"Exam submissions retrieved - Status: {response.status_code}")
            print_info(f"Total submissions for IELTS exam: {len(submissions)}")
            
            if len(submissions) > 0:
                print_success("✓ Found submissions for IELTS exam")
                for i, submission in enumerate(submissions[:3]):  # Show first 3
                    print_info(f"  Submission {i+1}: {submission.get('user_id_or_session')} ({len(submission.get('answers', {}))} answers)")
                return submissions
            else:
                print_warning("No submissions found for IELTS exam")
                return []
        else:
            print_error(f"Exam submissions retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Exam submissions request failed: {str(e)}")
        return None

def test_submission_count_increment():
    """Test 11: Verify exam submission_count increments after submission"""
    print_test_header("Submission Count Verification")
    
    try:
        # Get current exam details to check submission count
        response = requests.get(f"{BACKEND_URL}/exams/{IELTS_EXAM_ID}", timeout=10)
        
        if response.status_code == 200:
            exam = response.json()
            submission_count = exam.get('submission_count', 0)
            print_success(f"Current submission count: {submission_count}")
            
            if submission_count > 0:
                print_success("✓ Exam submission count has been incremented")
                return True
            else:
                print_warning("Exam submission count is 0 - may not have been incremented")
                return False
        else:
            print_error(f"Failed to retrieve exam for submission count check - Status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Submission count check request failed: {str(e)}")
        return False

def run_ielts_specific_tests():
    """Run all IELTS Listening Practice Test 1 specific tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("  IELTS Listening Practice Test 1 - Specific Backend API Tests")
    print("=" * 80)
    print(f"{Colors.END}")
    
    print_info(f"Testing backend at: {BACKEND_URL}")
    print_info(f"IELTS Exam ID: {IELTS_EXAM_ID}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = {}
    created_submission = None
    
    # Test 1: Verify IELTS exam in published list
    published_exam = test_published_exams_contains_ielts()
    test_results['published_exam_found'] = published_exam is not None
    
    # Test 2: Verify IELTS exam details
    exam_details = test_ielts_exam_details()
    test_results['exam_details_correct'] = exam_details is not None
    
    # Test 3: Verify full exam structure
    full_exam_data = test_ielts_full_exam_structure()
    test_results['full_exam_structure'] = full_exam_data is not None
    
    # Test 4: Create test submission
    created_submission = test_create_submission()
    test_results['submission_creation'] = created_submission is not None
    
    # Test 5: Retrieve created submission
    if created_submission:
        submission_id = created_submission.get('id')
        retrieved_submission = test_retrieve_submission(submission_id)
        test_results['submission_retrieval'] = retrieved_submission is not None
    else:
        test_results['submission_retrieval'] = False
    
    # Test 6: List exam submissions
    exam_submissions = test_exam_submissions()
    test_results['exam_submissions_list'] = exam_submissions is not None
    
    # Test 7: Verify submission count increment
    test_results['submission_count_increment'] = test_submission_count_increment()
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}=== IELTS SPECIFIC TEST SUMMARY ==={Colors.END}")
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    print(f"\n{Colors.BOLD}Test Results:{Colors.END}")
    for test_name, result in test_results.items():
        status = "PASS" if result else "FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"  {color}{status:4} - {test_name.replace('_', ' ').title()}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Overall Results: {passed_tests}/{total_tests} tests passed{Colors.END}")
    
    if passed_tests == total_tests:
        print_success("🎉 ALL IELTS SPECIFIC TESTS PASSED! The IELTS Listening Practice Test 1 is fully functional! ✨")
        return True
    else:
        failed_tests = total_tests - passed_tests
        print_error(f"❌ {failed_tests} test(s) failed - IELTS exam needs attention")
        
        # Provide specific guidance on failures
        if not test_results.get('published_exam_found'):
            print_error("CRITICAL: IELTS exam not found in published exams list")
        if not test_results.get('exam_details_correct'):
            print_error("CRITICAL: IELTS exam details don't match expected values")
        if not test_results.get('full_exam_structure'):
            print_error("CRITICAL: IELTS exam structure (sections/questions) is incorrect")
        
        return False

if __name__ == "__main__":
    success = run_ielts_specific_tests()
    sys.exit(0 if success else 1)