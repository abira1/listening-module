#!/usr/bin/env python3
"""
Migration script to fix malformed questions in the database

Issues fixed:
1. flow_chart_completion -> flowchart_completion (type name mismatch)
2. matching_draggable questions with missing questions/options arrays
"""

import sqlite3
import json
from datetime import datetime

def migrate_questions():
    """Migrate malformed questions to correct structure"""
    
    conn = sqlite3.connect('backend/data/ielts.db')
    cursor = conn.cursor()
    
    print("=" * 100)
    print("QUESTION MIGRATION - Fixing Malformed Questions")
    print("=" * 100)
    
    # ============================================
    # FIX 1: flow_chart_completion type name
    # ============================================
    print("\n" + "=" * 100)
    print("FIX 1: Updating flow_chart_completion -> flowchart_completion")
    print("=" * 100)
    
    cursor.execute('SELECT COUNT(*) FROM questions WHERE type = ?', ('flow_chart_completion',))
    count = cursor.fetchone()[0]
    
    if count > 0:
        print(f"\nFound {count} questions with type 'flow_chart_completion'")
        
        # Get affected questions
        cursor.execute('SELECT id, type FROM questions WHERE type = ?', ('flow_chart_completion',))
        affected = cursor.fetchall()
        
        for qid, qtype in affected:
            print(f"  - {qid}: {qtype}")
        
        # Update type
        cursor.execute('UPDATE questions SET type = ? WHERE type = ?', ('flowchart_completion', 'flow_chart_completion'))
        conn.commit()
        
        print(f"\n✅ Updated {count} questions to 'flowchart_completion'")
    else:
        print("\n✅ No questions with type 'flow_chart_completion' found")
    
    # ============================================
    # FIX 2: matching_draggable payload structure
    # ============================================
    print("\n" + "=" * 100)
    print("FIX 2: Fixing matching_draggable payload structure")
    print("=" * 100)
    
    cursor.execute('SELECT id, payload FROM questions WHERE type = ?', ('matching_draggable',))
    matching_questions = cursor.fetchall()
    
    print(f"\nFound {len(matching_questions)} matching_draggable questions")
    
    fixed_count = 0
    for qid, payload_str in matching_questions:
        try:
            payload = json.loads(payload_str)
            
            # Check if payload has required fields
            has_questions = 'questions' in payload and isinstance(payload['questions'], list)
            has_options = 'options' in payload and isinstance(payload['options'], list)
            
            if not has_questions or not has_options:
                print(f"\n  ⚠️  {qid}: Missing required fields")
                print(f"     - has_questions: {has_questions}")
                print(f"     - has_options: {has_options}")
                print(f"     - Current payload keys: {list(payload.keys())}")
                
                # Fix: Create minimal structure if missing
                if not has_questions:
                    # Create a single question from the prompt
                    prompt = payload.get('prompt', 'Question')
                    payload['questions'] = [
                        {
                            'label': prompt,
                            'answer_key': payload.get('answer_key', '')
                        }
                    ]
                    print(f"     - Created questions array with prompt as label")
                
                if not has_options:
                    # Create empty options array (will need manual population)
                    payload['options'] = []
                    print(f"     - Created empty options array (needs manual population)")
                
                # Add instructions if missing
                if 'instructions' not in payload:
                    payload['instructions'] = 'Match the items'
                    print(f"     - Added default instructions")
                
                # Update database
                cursor.execute(
                    'UPDATE questions SET payload = ? WHERE id = ?',
                    (json.dumps(payload), qid)
                )
                fixed_count += 1
                print(f"     ✅ Fixed")
            else:
                print(f"  ✅ {qid}: Payload structure is correct")
                
        except Exception as e:
            print(f"  ❌ {qid}: Error processing - {e}")
    
    conn.commit()
    
    if fixed_count > 0:
        print(f"\n✅ Fixed {fixed_count} matching_draggable questions")
    else:
        print(f"\n✅ All matching_draggable questions have correct structure")
    
    # ============================================
    # SUMMARY
    # ============================================
    print("\n" + "=" * 100)
    print("MIGRATION SUMMARY")
    print("=" * 100)
    
    # Get updated counts
    cursor.execute('SELECT COUNT(*) FROM questions WHERE type = ?', ('flowchart_completion',))
    flowchart_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM questions WHERE type = ?', ('matching_draggable',))
    matching_count = cursor.fetchone()[0]
    
    print(f"\n✅ flowchart_completion questions: {flowchart_count}")
    print(f"✅ matching_draggable questions: {matching_count}")
    print(f"✅ Total questions fixed: {count + fixed_count}")
    
    print("\n" + "=" * 100)
    print("MIGRATION COMPLETE")
    print("=" * 100)
    
    conn.close()

if __name__ == '__main__':
    migrate_questions()

