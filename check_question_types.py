import sqlite3
import json
from collections import defaultdict

conn = sqlite3.connect('backend/data/ielts.db')
cursor = conn.cursor()

# Get all question types
cursor.execute('SELECT DISTINCT type FROM questions ORDER BY type')
types = cursor.fetchall()

print("=" * 100)
print("ALL QUESTION TYPES IN DATABASE")
print("=" * 100)

type_counts = defaultdict(int)
type_examples = {}

for (qtype,) in types:
    cursor.execute('SELECT COUNT(*) FROM questions WHERE type = ?', (qtype,))
    count = cursor.fetchone()[0]
    type_counts[qtype] = count
    
    # Get one example
    cursor.execute('SELECT id, payload FROM questions WHERE type = ? LIMIT 1', (qtype,))
    result = cursor.fetchone()
    if result:
        qid, payload_str = result
        try:
            payload = json.loads(payload_str)
            type_examples[qtype] = {
                'id': qid,
                'payload_keys': list(payload.keys()) if isinstance(payload, dict) else 'NOT_DICT'
            }
        except:
            type_examples[qtype] = {'id': qid, 'payload_keys': 'PARSE_ERROR'}

print(f"\nTotal unique types: {len(type_counts)}\n")

for qtype in sorted(type_counts.keys()):
    count = type_counts[qtype]
    example = type_examples.get(qtype, {})
    print(f"{qtype:30} | Count: {count:3} | Example ID: {example.get('id', 'N/A'):20} | Keys: {example.get('payload_keys', 'N/A')}")

print("\n" + "=" * 100)
print(f"TOTAL QUESTIONS: {sum(type_counts.values())}")
print("=" * 100)

conn.close()

