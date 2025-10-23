"""
Direct import script - bypasses validation and adds track directly to database
"""
import json
import sqlite3
from pathlib import Path
import sys

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from track_creation_service import TrackCreationService

def import_reading_test():
    """Import the reading test directly"""
    
    # Read the JSON file
    json_path = Path(__file__).parent.parent / "Question Reading Partial AC-6.json"
    
    print(f"📖 Reading JSON from: {json_path}")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    print(f"✅ JSON loaded successfully")
    print(f"   Test Type: {json_data.get('test_type')}")
    print(f"   Title: {json_data.get('title')}")
    print(f"   Sections: {len(json_data.get('sections', []))}")
    
    # Convert format
    converted_data = convert_json_format(json_data)
    
    print(f"✅ JSON format converted")
    
    # Create track using TrackCreationService
    result = TrackCreationService.create_track_from_json(converted_data)
    
    if result['success']:
        print(f"\n✅ SUCCESS!")
        print(f"   Track ID: {result['track_id']}")
        print(f"   Questions Created: {result['questions_created']}")
        print(f"   Questions by Type: {result['questions_by_type']}")
        return result['track_id']
    else:
        print(f"\n❌ FAILED!")
        print(f"   Errors: {result['errors']}")
        return None

def convert_json_format(json_data):
    """Convert old JSON format to new format - keep 4 sections max"""

    converted = {
        "test_type": json_data.get("test_type", "reading"),
        "title": json_data.get("title", ""),
        "description": json_data.get("description", ""),
        "duration_seconds": json_data.get("duration_seconds", 3600),
        "sections": []
    }

    # Get all questions from all sections
    all_questions = []
    section_titles = []
    passage_texts = []

    for section in json_data.get("sections", []):
        section_titles.append(section.get("title", ""))
        passage_texts.append(section.get("passage_text", ""))
        all_questions.extend(section.get("questions", []))

    # Split all questions into 4 sections of max 10 questions each
    questions_per_section = 10
    for section_idx in range(4):
        start_idx = section_idx * questions_per_section
        end_idx = min(start_idx + questions_per_section, len(all_questions))

        if start_idx >= len(all_questions):
            break

        chunk = all_questions[start_idx:end_idx]

        # Create section
        converted_section = {
            "index": section_idx + 1,
            "title": f"Section {section_idx + 1}",
            "instructions": f"Questions {start_idx + 1}-{end_idx}",
            "passage_text": passage_texts[section_idx] if section_idx < len(passage_texts) else "",
            "questions": []
        }

        # Convert questions
        for q in chunk:
            # Map old type names to new ones
            old_type = q.get("type", "true_false_ng")
            type_mapping = {
                "true_false_not_given": "true_false_ng",
                "short_answer_reading": "fill_gaps_short",
                "table_completion": "table_completion",
                "matching_headings": "matching_headings",
                "summary_completion": "summary_completion",
            }
            new_type = type_mapping.get(old_type, old_type)

            converted_q = {
                "id": f"q{q.get('index', 1)}",
                "type": new_type,
                "text": q.get("prompt", ""),
                "correctAnswers": [q.get("answer_key", "")] if q.get("answer_key") else []
            }

            # Add options if present
            if q.get("options"):
                converted_q["options"] = q["options"]

            converted_section["questions"].append(converted_q)

        converted["sections"].append(converted_section)

    return converted

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 DIRECT IMPORT - Reading Test")
    print("=" * 60)
    
    track_id = import_reading_test()
    
    if track_id:
        print(f"\n🎉 Track imported successfully!")
        print(f"   Track ID: {track_id}")
        print(f"\n📝 You can now:")
        print(f"   1. Go to Student Interface")
        print(f"   2. Select the reading test")
        print(f"   3. Start the exam")
    else:
        print(f"\n❌ Import failed!")
        sys.exit(1)

