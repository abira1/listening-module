import sqlite3
import json

conn = sqlite3.connect('backend/data/ielts.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get all unique question types
cursor.execute('SELECT DISTINCT type FROM questions ORDER BY type')
types = cursor.fetchall()

print('=== ALL QUESTION TYPES IN DATABASE ===\n')
for row in types:
    qtype = row['type']
    cursor.execute('SELECT COUNT(*) as count FROM questions WHERE type = ?', (qtype,))
    count = cursor.fetchone()['count']
    
    # Get sample question
    cursor.execute('SELECT id, payload FROM questions WHERE type = ? LIMIT 1', (qtype,))
    sample = cursor.fetchone()
    
    print(f'{qtype}: {count} questions')
    if sample:
        try:
            payload = json.loads(sample['payload'])
            print(f'  Sample ID: {sample["id"]}')
            print(f'  Payload keys: {list(payload.keys())}')
            print(f'  Full Payload:')
            print(json.dumps(payload, indent=4))
        except Exception as e:
            print(f'  Error parsing payload: {e}')
    print()

conn.close()

