"""
Question Type Preview Test - Comprehensive test with all 25 IELTS question types
This test demonstrates all question types available in the platform with 2 questions each.
Total: ~50 questions across Listening, Reading, and Writing sections.
"""

import sys
import uuid
from datetime import datetime

# Determine if running as script or imported
if __name__ == '__main__':
    from server import exams_collection, sections_collection, questions_collection
else:
    from backend.server import exams_collection, sections_collection, questions_collection


def create_question_preview_test():
    """Create comprehensive question type preview test"""
    
    exam_id = "question-type-preview-test"
    
    # Check if exam already exists
    existing = exams_collection.find_one({"id": exam_id})
    if existing:
        print(f"Question Preview Test already exists with ID: {exam_id}")
        return exam_id
    
    # Create exam
    exam = {
        "id": exam_id,
        "title": "🎯 Question Type Preview - All 25 Types",
        "description": "Comprehensive preview test demonstrating all IELTS question types (2 questions each). For admin testing and demonstration purposes.",
        "exam_type": "preview",  # Special type for preview
        "duration_seconds": 7200,  # 120 minutes (2 hours) 
        "question_count": 50,  # 2 questions × 25 types
        "audio_url": "https://audio.jukehost.co.uk/F9irt6LcsYuP93ulaMo42JfXBEcABytV",  # Sample audio
        "published": True,
        "is_visible": True,  # Visible to admins
        "is_active": True,  # Active by default
        "submission_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "started_at": None,
        "stopped_at": None
    }
    
    exams_collection.insert_one(exam)
    print(f"✅ Created Question Preview Test: {exam_id}")
    
    # ========================================
    # LISTENING SECTION (11 question types)
    # ========================================
    
    # Section 1: Listening Part 1
    listening_section_1_id = str(uuid.uuid4())
    listening_section_1 = {
        "id": listening_section_1_id,
        "exam_id": exam_id,
        "index": 1,
        "title": "LISTENING - Part 1 (Types 1-6)",
        "instructions": "Listen to the audio and answer questions 1-12",
        "passage_text": None,
        "created_at": datetime.utcnow().isoformat()
    }
    sections_collection.insert_one(listening_section_1)
    
    # Section 2: Listening Part 2
    listening_section_2_id = str(uuid.uuid4())
    listening_section_2 = {
        "id": listening_section_2_id,
        "exam_id": exam_id,
        "index": 2,
        "title": "LISTENING - Part 2 (Types 7-11)",
        "instructions": "Continue listening and answer questions 13-22",
        "passage_text": None,
        "created_at": datetime.utcnow().isoformat()
    }
    sections_collection.insert_one(listening_section_2)
    
    # LISTENING QUESTIONS
    listening_questions = [
        # Type 1: Multiple Choice (Single Answer) - Questions 1-2
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 1,
            "type": "multiple_choice",
            "payload": {
                "prompt": "What is the main purpose of the conversation?",
                "options": [
                    "To book a hotel room",
                    "To arrange a meeting",
                    "To cancel an appointment",
                    "To ask for directions"
                ],
                "answer_key": "B"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 2,
            "type": "multiple_choice",
            "payload": {
                "prompt": "When will the meeting take place?",
                "options": [
                    "Monday morning",
                    "Tuesday afternoon",
                    "Wednesday evening",
                    "Friday morning"
                ],
                "answer_key": "B"
            },
            "marks": 1
        },
        
        # Type 2: Multiple Choice (Multiple Answer) - Questions 3-4
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 3,
            "type": "multiple_choice_multiple",
            "payload": {
                "prompt": "Which TWO items does the speaker mention bringing to the meeting?",
                "options": [
                    "Laptop",
                    "Documents",
                    "Notebook",
                    "Pens",
                    "Calculator"
                ],
                "max_selections": 2,
                "answer_key": ["A", "B"]
            },
            "marks": 1
        },
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 4,
            "type": "multiple_choice_multiple",
            "payload": {
                "prompt": "Select THREE reasons mentioned for the delay.",
                "options": [
                    "Traffic congestion",
                    "Bad weather",
                    "Technical problems",
                    "Staff shortage",
                    "Equipment failure"
                ],
                "max_selections": 3,
                "answer_key": ["A", "B", "C"]
            },
            "marks": 1
        },
        
        # Type 3: Matching - Questions 5-6
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 5,
            "type": "matching",
            "payload": {
                "prompt": "Match each person to their role.",
                "question": "John Smith",
                "options": [
                    "Manager",
                    "Engineer",
                    "Accountant",
                    "Secretary",
                    "Director"
                ],
                "answer_key": "A"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 6,
            "type": "matching",
            "payload": {
                "prompt": "Match each person to their role.",
                "question": "Sarah Johnson",
                "options": [
                    "Manager",
                    "Engineer",
                    "Accountant",
                    "Secretary",
                    "Director"
                ],
                "answer_key": "C"
            },
            "marks": 1
        },
        
        # Type 4: Map/Diagram Labeling - Questions 7-8
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 7,
            "type": "map_labeling",
            "payload": {
                "prompt": "Label the location on the map - Reception",
                "image_url": "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800",
                "options": [
                    "Location A",
                    "Location B",
                    "Location C",
                    "Location D",
                    "Location E"
                ],
                "answer_key": "A"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 8,
            "type": "diagram_labeling",
            "payload": {
                "prompt": "Label the part of the device - Power Button: ________",
                "image_url": "https://images.unsplash.com/photo-1593642532400-2682810df593?w=800",
                "max_words": 2,
                "answer_key": "top right"
            },
            "marks": 1
        },
        
        # Type 5: Form Completion - Questions 9-10
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 9,
            "type": "form_completion",
            "payload": {
                "prompt": "Complete the form. Name: ________",
                "max_words": 2,
                "answer_key": "David Brown"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 10,
            "type": "form_completion",
            "payload": {
                "prompt": "Complete the form. Phone Number: ________",
                "max_words": 1,
                "answer_key": "555-1234"
            },
            "marks": 1
        },
        
        # Type 6: Note Completion - Questions 11-12
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 11,
            "type": "note_completion",
            "payload": {
                "prompt": "Complete the notes. Main Topic: ________",
                "max_words": 3,
                "answer_key": "Climate Change Effects"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_1_id,
            "exam_id": exam_id,
            "index": 12,
            "type": "note_completion",
            "payload": {
                "prompt": "Complete the notes. Key Point: ________",
                "max_words": 3,
                "answer_key": "Rising Sea Levels"
            },
            "marks": 1
        },
        
        # Type 7: Table Completion - Questions 13-14
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 13,
            "type": "table_completion",
            "payload": {
                "prompt": "Complete the table. Year: ________",
                "max_words": 1,
                "answer_key": "2020"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 14,
            "type": "table_completion",
            "payload": {
                "prompt": "Complete the table. Population: ________ million",
                "max_words": 1,
                "answer_key": "8.5"
            },
            "marks": 1
        },
        
        # Type 8: Flow-chart Completion - Questions 15-16
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 15,
            "type": "flowchart_completion",
            "payload": {
                "prompt": "Complete the flow-chart. First Step: ________",
                "max_words": 2,
                "answer_key": "Data Collection"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 16,
            "type": "flowchart_completion",
            "payload": {
                "prompt": "Complete the flow-chart. Final Step: ________",
                "max_words": 2,
                "answer_key": "Report Writing"
            },
            "marks": 1
        },
        
        # Type 9: Summary Completion - Questions 17-18
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 17,
            "type": "summary_completion",
            "payload": {
                "prompt": "Complete the summary. The research focused on ________",
                "max_words": 3,
                "answer_key": "renewable energy sources"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 18,
            "type": "summary_completion",
            "payload": {
                "prompt": "Complete the summary. The results showed ________",
                "max_words": 3,
                "answer_key": "significant improvement overall"
            },
            "marks": 1
        },
        
        # Type 10: Sentence Completion - Questions 19-20
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 19,
            "type": "short_answer",  # Using short_answer for sentence completion
            "payload": {
                "prompt": "The conference will be held in ________",
                "max_words": 2,
                "answer_key": "New York"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 20,
            "type": "short_answer",
            "payload": {
                "prompt": "Participants must register by ________",
                "max_words": 2,
                "answer_key": "March 15"
            },
            "marks": 1
        },
        
        # Type 11: Short-Answer Questions - Questions 21-22
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 21,
            "type": "short_answer",
            "payload": {
                "prompt": "What is the speaker's profession?",
                "max_words": 1,
                "answer_key": "Engineer"
            },
            "marks": 1
        },
        {
            "section_id": listening_section_2_id,
            "exam_id": exam_id,
            "index": 22,
            "type": "short_answer",
            "payload": {
                "prompt": "How many years of experience does the speaker have?",
                "max_words": 1,
                "answer_key": "15"
            },
            "marks": 1
        },
    ]
    
    # Insert listening questions
    for question in listening_questions:
        question["id"] = str(uuid.uuid4())
        question["created_at"] = datetime.utcnow().isoformat()
        questions_collection.insert_one(question)
    
    print(f"✅ Created {len(listening_questions)} LISTENING questions (11 types)")
    
    # ========================================
    # READING SECTION (12 question types)
    # ========================================
    
    # Section 3: Reading Passage 1
    reading_section_1_id = str(uuid.uuid4())
    reading_section_1 = {
        "id": reading_section_1_id,
        "exam_id": exam_id,
        "index": 3,
        "title": "READING - Passage 1 (Types 1-6)",
        "instructions": "Read the passage and answer questions 23-34",
        "passage_text": """
# The Evolution of Modern Communication

The way humans communicate has undergone dramatic transformation over the past century. From the invention of the telephone in 1876 by Alexander Graham Bell to today's instant messaging and video calls, technology has revolutionized how we connect with one another.

## The Digital Revolution

The advent of the internet in the late 20th century marked a turning point in communication history. Email became the first widely adopted digital communication method, allowing people to send messages across the globe instantly. This was followed by social media platforms, which created entirely new ways for people to share information and maintain relationships.

## Mobile Communication

The introduction of smartphones in the early 21st century further accelerated this transformation. Today, over 5 billion people own mobile devices, making it possible to communicate from virtually anywhere at any time. Video calling, once a feature of science fiction, is now commonplace.

## The Future of Communication

Experts predict that artificial intelligence and virtual reality will shape the next phase of communication evolution. These technologies promise to make interactions more immersive and personalized than ever before.

## Challenges and Concerns

Despite these advances, concerns about privacy, digital addiction, and the quality of human connections in the digital age persist. Many researchers argue that while technology has made communication more convenient, it may have diminished the depth and authenticity of interpersonal relationships.
        """,
        "created_at": datetime.utcnow().isoformat()
    }
    sections_collection.insert_one(reading_section_1)
    
    # Section 4: Reading Passage 2
    reading_section_2_id = str(uuid.uuid4())
    reading_section_2 = {
        "id": reading_section_2_id,
        "exam_id": exam_id,
        "index": 4,
        "title": "READING - Passage 2 (Types 7-12)",
        "instructions": "Read the passage and answer questions 35-46",
        "passage_text": """
# Sustainable Agriculture Practices

Modern agriculture faces the challenge of feeding a growing global population while minimizing environmental impact. Sustainable farming methods offer promising solutions to this dilemma.

## Organic Farming Methods

Organic agriculture relies on natural processes rather than synthetic chemicals. Farmers use compost, crop rotation, and biological pest control to maintain soil health and crop productivity. Research shows that organic farms can achieve yields comparable to conventional farming while significantly reducing environmental harm.

## Water Conservation Techniques

Drip irrigation systems deliver water directly to plant roots, reducing waste by up to 60% compared to traditional flooding methods. Rainwater harvesting and efficient water management are crucial in regions facing water scarcity.

## Integrated Pest Management

Rather than relying solely on pesticides, integrated pest management combines multiple strategies including beneficial insects, crop rotation, and targeted chemical use only when necessary. This approach protects ecosystems while maintaining crop health.

## The Role of Technology

Modern sensors and data analytics help farmers optimize resource use. Precision agriculture uses GPS and IoT devices to monitor soil conditions, weather patterns, and crop health in real-time, enabling more efficient farming practices.
        """,
        "created_at": datetime.utcnow().isoformat()
    }
    sections_collection.insert_one(reading_section_2)
    
    # READING QUESTIONS
    reading_questions = [
        # Type 1: Multiple Choice (Single Answer) - Questions 23-24
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 23,
            "type": "multiple_choice",
            "payload": {
                "prompt": "According to the passage, when was the telephone invented?",
                "options": [
                    "1876",
                    "1886",
                    "1896",
                    "1906"
                ],
                "answer_key": "A"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 24,
            "type": "multiple_choice",
            "payload": {
                "prompt": "What was the first widely adopted digital communication method?",
                "options": [
                    "Social media",
                    "Text messaging",
                    "Email",
                    "Video calls"
                ],
                "answer_key": "C"
            },
            "marks": 1
        },
        
        # Type 2: Multiple Choice (Multiple Answer) - Questions 25-26
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 25,
            "type": "multiple_choice_multiple",
            "payload": {
                "prompt": "Which TWO technologies does the passage mention will shape future communication?",
                "options": [
                    "Artificial Intelligence",
                    "Blockchain",
                    "Virtual Reality",
                    "Quantum Computing",
                    "Robotics"
                ],
                "max_selections": 2,
                "answer_key": ["A", "C"]
            },
            "marks": 1
        },
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 26,
            "type": "multiple_choice_multiple",
            "payload": {
                "prompt": "Select THREE concerns mentioned about digital communication.",
                "options": [
                    "Privacy issues",
                    "Cost",
                    "Digital addiction",
                    "Quality of connections",
                    "Language barriers"
                ],
                "max_selections": 3,
                "answer_key": ["A", "C", "D"]
            },
            "marks": 1
        },
        
        # Type 3: True/False/Not Given - Questions 27-28
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 27,
            "type": "true_false_not_given",
            "payload": {
                "prompt": "Over 5 billion people own mobile devices.",
                "answer_key": "True"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 28,
            "type": "true_false_not_given",
            "payload": {
                "prompt": "Video calling was predicted by scientists in the 1950s.",
                "answer_key": "Not Given"
            },
            "marks": 1
        },
        
        # Type 4: Note Completion - Questions 29-30
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 29,
            "type": "note_completion",
            "payload": {
                "prompt": "Complete the notes. The telephone was invented by ________",
                "max_words": 3,
                "answer_key": "Alexander Graham Bell"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 30,
            "type": "note_completion",
            "payload": {
                "prompt": "Complete the notes. Smartphones were introduced in the ________",
                "max_words": 4,
                "answer_key": "early 21st century"
            },
            "marks": 1
        },
        
        # Type 5: Matching Headings - Questions 31-32
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 31,
            "type": "matching_headings",
            "payload": {
                "prompt": "Match the heading to the paragraph about internet and email.",
                "paragraph_reference": "Paragraph 2",
                "options": [
                    "The Digital Revolution",
                    "Mobile Communication",
                    "The Future of Communication",
                    "Challenges and Concerns"
                ],
                "answer_key": "A"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 32,
            "type": "matching_headings",
            "payload": {
                "prompt": "Match the heading to the paragraph about privacy concerns.",
                "paragraph_reference": "Paragraph 5",
                "options": [
                    "The Digital Revolution",
                    "Mobile Communication",
                    "The Future of Communication",
                    "Challenges and Concerns"
                ],
                "answer_key": "D"
            },
            "marks": 1
        },
        
        # Type 6: Summary Completion (from text) - Questions 33-34
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 33,
            "type": "summary_completion_text",
            "payload": {
                "prompt": "Complete the summary using words from the text. Communication has undergone ________ transformation.",
                "max_words": 1,
                "answer_key": "dramatic"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_1_id,
            "exam_id": exam_id,
            "index": 34,
            "type": "summary_completion_text",
            "payload": {
                "prompt": "Complete the summary using words from the text. Social media created new ways to ________ information.",
                "max_words": 1,
                "answer_key": "share"
            },
            "marks": 1
        },
        
        # Type 7: Summary Completion (from list) - Questions 35-36
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 35,
            "type": "summary_completion_list",
            "payload": {
                "prompt": "Complete the summary using words from the list. Sustainable farming aims to minimize ________",
                "options": [
                    "environmental impact",
                    "crop yields",
                    "water usage",
                    "labor costs",
                    "technology use"
                ],
                "answer_key": "A"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 36,
            "type": "summary_completion_list",
            "payload": {
                "prompt": "Complete the summary using words from the list. Organic farming uses ________ instead of synthetic chemicals.",
                "options": [
                    "machines",
                    "natural processes",
                    "laboratory methods",
                    "imported materials",
                    "expensive equipment"
                ],
                "answer_key": "B"
            },
            "marks": 1
        },
        
        # Type 8: Flow-chart Completion - Questions 37-38
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 37,
            "type": "flowchart_completion_reading",
            "payload": {
                "prompt": "Complete the flow-chart. Integrated pest management combines ________",
                "max_words": 2,
                "answer_key": "multiple strategies"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 38,
            "type": "flowchart_completion_reading",
            "payload": {
                "prompt": "Complete the flow-chart. Precision agriculture uses ________ to monitor conditions.",
                "max_words": 2,
                "answer_key": "modern sensors"
            },
            "marks": 1
        },
        
        # Type 9: Sentence Completion - Questions 39-40
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 39,
            "type": "sentence_completion",
            "payload": {
                "prompt": "Drip irrigation reduces water waste by up to ________",
                "max_words": 2,
                "answer_key": "60%"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 40,
            "type": "sentence_completion",
            "payload": {
                "prompt": "Organic farms can achieve yields comparable to ________",
                "max_words": 2,
                "answer_key": "conventional farming"
            },
            "marks": 1
        },
        
        # Type 10: Matching Sentence Endings - Questions 41-42
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 41,
            "type": "matching_sentence_endings",
            "payload": {
                "prompt": "Match the sentence beginning with its ending. 'Organic agriculture relies on'",
                "options": [
                    "natural processes",
                    "chemical pesticides",
                    "expensive machinery",
                    "imported fertilizers"
                ],
                "answer_key": "A"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 42,
            "type": "matching_sentence_endings",
            "payload": {
                "prompt": "Match the sentence beginning with its ending. 'Modern sensors help farmers'",
                "options": [
                    "reduce costs",
                    "optimize resource use",
                    "increase profits",
                    "hire workers"
                ],
                "answer_key": "B"
            },
            "marks": 1
        },
        
        # Type 11: Table Completion - Questions 43-44
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 43,
            "type": "table_completion_reading",
            "payload": {
                "prompt": "Complete the table. Water conservation method: ________",
                "max_words": 2,
                "answer_key": "drip irrigation"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 44,
            "type": "table_completion_reading",
            "payload": {
                "prompt": "Complete the table. Pest control approach: ________",
                "max_words": 3,
                "answer_key": "integrated pest management"
            },
            "marks": 1
        },
        
        # Type 12: Matching Features - Questions 45-46
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 45,
            "type": "matching_features",
            "payload": {
                "prompt": "Match the feature to its benefit. Compost usage",
                "options": [
                    "Maintains soil health",
                    "Reduces water waste",
                    "Monitors weather",
                    "Controls pests"
                ],
                "answer_key": "A"
            },
            "marks": 1
        },
        {
            "section_id": reading_section_2_id,
            "exam_id": exam_id,
            "index": 46,
            "type": "matching_features",
            "payload": {
                "prompt": "Match the feature to its benefit. GPS technology",
                "options": [
                    "Maintains soil health",
                    "Reduces water waste",
                    "Monitors conditions",
                    "Controls pests"
                ],
                "answer_key": "C"
            },
            "marks": 1
        },
    ]
    
    # Insert reading questions
    for question in reading_questions:
        question["id"] = str(uuid.uuid4())
        question["created_at"] = datetime.utcnow().isoformat()
        questions_collection.insert_one(question)
    
    print(f"✅ Created {len(reading_questions)} READING questions (12 types)")
    
    # ========================================
    # WRITING SECTION (2 question types)
    # ========================================
    
    # Section 5: Writing Tasks
    writing_section_id = str(uuid.uuid4())
    writing_section = {
        "id": writing_section_id,
        "exam_id": exam_id,
        "index": 5,
        "title": "WRITING - Tasks 1 & 2",
        "instructions": "Complete both writing tasks",
        "passage_text": None,
        "created_at": datetime.utcnow().isoformat()
    }
    sections_collection.insert_one(writing_section)
    
    # WRITING QUESTIONS
    writing_questions = [
        # Type 1: Writing Task 1 - Question 47
        {
            "section_id": writing_section_id,
            "exam_id": exam_id,
            "index": 47,
            "type": "writing_task",
            "payload": {
                "instructions": "You should spend about 20 minutes on this task.",
                "prompt": """The chart below shows the percentage of households in different income brackets in a city from 2010 to 2020.

Summarize the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.""",
                "chart_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
                "min_words": 150,
                "task_number": 1,
                "answer_key": None
            },
            "marks": 1
        },
        
        # Type 2: Writing Task 2 - Question 48
        {
            "section_id": writing_section_id,
            "exam_id": exam_id,
            "index": 48,
            "type": "writing_task",
            "payload": {
                "instructions": "You should spend about 40 minutes on this task.",
                "prompt": """Write about the following topic:

Some people believe that technology has made our lives more complicated, while others think it has made life easier. 

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.""",
                "chart_image": None,
                "min_words": 250,
                "task_number": 2,
                "answer_key": None
            },
            "marks": 1
        },
    ]
    
    # Insert writing questions
    for question in writing_questions:
        question["id"] = str(uuid.uuid4())
        question["created_at"] = datetime.utcnow().isoformat()
        questions_collection.insert_one(question)
    
    print(f"✅ Created {len(writing_questions)} WRITING questions (2 types)")
    
    # Update exam question count
    total_questions = len(listening_questions) + len(reading_questions) + len(writing_questions)
    exams_collection.update_one(
        {"id": exam_id},
        {"$set": {"question_count": total_questions}}
    )
    
    print(f"\n🎉 QUESTION TYPE PREVIEW TEST CREATED SUCCESSFULLY!")
    print(f"   Total Questions: {total_questions}")
    print(f"   - Listening: {len(listening_questions)} questions (11 types)")
    print(f"   - Reading: {len(reading_questions)} questions (12 types)")
    print(f"   - Writing: {len(writing_questions)} questions (2 types)")
    print(f"   Total Question Types: 25")
    print(f"   Exam ID: {exam_id}")
    
    return exam_id


if __name__ == '__main__':
    try:
        exam_id = create_question_preview_test()
        print(f"\n✅ Success! Preview test accessible at: /exam/{exam_id}")
    except Exception as e:
        print(f"\n❌ Error creating preview test: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
