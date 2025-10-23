#!/usr/bin/env python3
"""
Test script to validate listening test JSON
"""

import json
import sys
sys.path.insert(0, 'backend')

from question_validator import TrackValidator

# Your listening test JSON
listening_json = {
    "test_type": "listening",
    "title": "IELTS Listening Practice Test",
    "description": "Complete IELTS Listening test with 4 sections and 40 questions",
    "duration_seconds": 2400,
    "audio_url": "PASTE_YOUR_AUDIO_URL_HERE",
    "sections": [
        {
            "index": 1,
            "title": "Section 1",
            "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
            "questions": [
                {
                    "index": 1,
                    "type": "short_answer",
                    "prompt": "Type of company: __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 2,
                    "type": "short_answer",
                    "prompt": "Position: __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 3,
                    "type": "short_answer",
                    "prompt": "Location: near the __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 4,
                    "type": "short_answer",
                    "prompt": "Preferred size of the area: __________ ft2",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 5,
                    "type": "short_answer",
                    "prompt": "Requirements: 24-hour __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 6,
                    "type": "short_answer",
                    "prompt": "__________ on ground floor",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 7,
                    "type": "short_answer",
                    "prompt": "Preferred facilities: a (an) __________ to cook in",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 8,
                    "type": "short_answer",
                    "prompt": "a (an) __________ away from the workspace",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 9,
                    "type": "short_answer",
                    "prompt": "Daily exercise: a (an) __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 10,
                    "type": "short_answer",
                    "prompt": "Unnecessary: __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                }
            ]
        },
        {
            "index": 2,
            "title": "Section 2",
            "instructions": "Choose the correct letter, A, B or C.",
            "questions": [
                {
                    "index": 11,
                    "type": "multiple_choice",
                    "prompt": "The reason why this island attracts so many tourists is that",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A it's a good place to relax.", "B the transport is very convenient.", "C the ticket price is relatively low."],
                    "image_url": None
                },
                {
                    "index": 12,
                    "type": "multiple_choice",
                    "prompt": "What is recommended to bring when you visit the island?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A a raincoat", "B a sun umbrella", "C a helmet"],
                    "image_url": None
                },
                {
                    "index": 13,
                    "type": "multiple_choice",
                    "prompt": "What is the most popular attraction at the resort?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A the rose garden", "B the sunset", "C the freshwater pond"],
                    "image_url": None
                },
                {
                    "index": 14,
                    "type": "multiple_choice",
                    "prompt": "What could possibly surprise visitors to the island?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A the size of the island", "B a wide range of wildlife", "C making new friends"],
                    "image_url": None
                },
                {
                    "index": 15,
                    "type": "matching_draggable",
                    "prompt": "tourist centre",
                    "answer_key": "",
                    "payload": {
                        "instructions": "Choose SIX answers from the box and write the correct letter, A-H, next to questions",
                        "questions": [
                            {"label": "tourist centre", "answer_key": ""},
                            {"label": "mountain", "answer_key": ""},
                            {"label": "small theatre", "answer_key": ""},
                            {"label": "art museum", "answer_key": ""},
                            {"label": "pond", "answer_key": ""},
                            {"label": "ancient building", "answer_key": ""}
                        ],
                        "options": [
                            {"key": "A", "text": "old prison"},
                            {"key": "B", "text": "stunning view"},
                            {"key": "C", "text": "street art"},
                            {"key": "D", "text": "gallery"},
                            {"key": "E", "text": "gift shopping"},
                            {"key": "F", "text": "bird watching"},
                            {"key": "G", "text": "cycling"},
                            {"key": "H", "text": "maritime museum"}
                        ]
                    }
                }
            ]
        },
        {
            "index": 3,
            "title": "Section 3",
            "instructions": "Choose the correct answers for questions 21-30",
            "questions": [
                {
                    "index": 21,
                    "type": "matching_draggable",
                    "prompt": "What feature is there for each character in the novels?",
                    "answer_key": "",
                    "payload": {
                        "instructions": "Choose FOUR answers from the box and write the correct letter, A-F, next to questions",
                        "questions": [
                            {"label": "Rosy", "answer_key": ""},
                            {"label": "Flory", "answer_key": ""},
                            {"label": "Lizzie", "answer_key": ""},
                            {"label": "Estelle", "answer_key": ""}
                        ],
                        "options": [
                            {"key": "A", "text": "is deliberately cruel to other people."},
                            {"key": "B", "text": "acts with childish innocence."},
                            {"key": "C", "text": "resents previous events."},
                            {"key": "D", "text": "pays attention to appearance."},
                            {"key": "E", "text": "acts in a foolish way."},
                            {"key": "F", "text": "has insight into human nature."}
                        ]
                    }
                },
                {
                    "index": 25,
                    "type": "multiple_choice",
                    "prompt": "What are the speakers' opinions about the literature lectures?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A They are too noisy for virtual learning.", "B They are well structured.", "C There is insufficient time for discussion.", "D They always start punctually.", "E They are too shy to take part in discussions."],
                    "image_url": None
                },
                {
                    "index": 26,
                    "type": "multiple_choice",
                    "prompt": "What are the speakers' opinions about the literature lectures?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A They are too noisy for virtual learning.", "B They are well structured.", "C There is insufficient time for discussion.", "D They always start punctually.", "E They are too shy to take part in discussions."],
                    "image_url": None
                },
                {
                    "index": 27,
                    "type": "multiple_choice",
                    "prompt": "What improvements can be made in the near future?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A enhancing IT support", "B providing more computers", "C finding a good librarian", "D buying some new photocopying machines", "E becoming a good group leader"],
                    "image_url": None
                },
                {
                    "index": 28,
                    "type": "multiple_choice",
                    "prompt": "What improvements can be made in the near future?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A enhancing IT support", "B providing more computers", "C finding a good librarian", "D buying some new photocopying machines", "E becoming a good group leader"],
                    "image_url": None
                },
                {
                    "index": 29,
                    "type": "multiple_choice",
                    "prompt": "What do the speakers think of the group discussions?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A The class is too large.", "B It's easy to find time to meet.", "C Group sizes are suitable.", "D The class time is properly managed.", "E They find that the class is very effective."],
                    "image_url": None
                },
                {
                    "index": 30,
                    "type": "multiple_choice",
                    "prompt": "What do the speakers think of the group discussions?",
                    "answer_key": "",
                    "max_words": None,
                    "options": ["A The class is too large.", "B It's easy to find time to meet.", "C Group sizes are suitable.", "D The class time is properly managed.", "E They find that the class is very effective."],
                    "image_url": None
                }
            ]
        },
        {
            "index": 4,
            "title": "Section 4",
            "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
            "questions": [
                {
                    "index": 31,
                    "type": "short_answer",
                    "prompt": "During the Industrial Revolution people moved to cities to work in the __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 32,
                    "type": "short_answer",
                    "prompt": "In the 1850s, the culture was influenced greatly by __________ from different countries.",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 33,
                    "type": "short_answer",
                    "prompt": "Originally music reflected the work life of different __________ in those days.",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 34,
                    "type": "short_answer",
                    "prompt": "Different songs were created in the same __________ although people were from a variety of nations.",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 35,
                    "type": "short_answer",
                    "prompt": "The songs written by the workers during this period mainly came from their feelings about harsh __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 36,
                    "type": "short_answer",
                    "prompt": "The musical trends were led by __________ performers.",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 37,
                    "type": "short_answer",
                    "prompt": "During this period, some musical groups had expanded their popularity among __________",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 38,
                    "type": "short_answer",
                    "prompt": "In the late 1870s, the __________ came into contact with these flourishing musical traditions.",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 39,
                    "type": "short_answer",
                    "prompt": "These musical genres still exert an influence on __________ culture.",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                },
                {
                    "index": 40,
                    "type": "short_answer",
                    "prompt": "Enthusiastic fans are still collecting and keeping the __________ of music from those days.",
                    "answer_key": "",
                    "max_words": 2,
                    "options": None,
                    "image_url": None
                }
            ]
        }
    ]
}

print("=" * 70)
print("LISTENING TEST JSON VALIDATION")
print("=" * 70)

# Validate the JSON
result = TrackValidator.validate_complete_track(listening_json)

print(f"\n✅ Is Valid: {result['is_valid']}")
print(f"📊 Total Questions: {result['total_questions']}")
print(f"📚 Total Sections: {result['total_sections']}")
print(f"📋 Questions by Type: {result['questions_by_type']}")

if result['errors']:
    print(f"\n❌ ERRORS ({len(result['errors'])}):")
    for i, error in enumerate(result['errors'], 1):
        print(f"  {i}. {error}")
else:
    print("\n✅ No errors found!")

if result['warnings']:
    print(f"\n⚠️  WARNINGS ({len(result['warnings'])}):")
    for i, warning in enumerate(result['warnings'], 1):
        print(f"  {i}. {warning}")
else:
    print("\n✅ No warnings found!")

print("\n" + "=" * 70)

