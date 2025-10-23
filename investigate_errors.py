import sqlite3
import json

conn = sqlite3.connect('backend/data/ielts.db')
cursor = conn.cursor()

print("=" * 100)
print("DATABASE INVESTIGATION - Affected Questions Analysis")
print("=" * 100)

# Get the affected questions
affected_ids = [
    'track-listening-dbe3507b-q37', 'track-listening-dbe3507b-q38', 'track-listening-dbe3507b-q39', 'track-listening-dbe3507b-q40',
    'track-listening-dbe3507b-q12', 'track-listening-dbe3507b-q13', 'track-listening-dbe3507b-q14', 'track-listening-dbe3507b-q15',
    'track-listening-dbe3507b-q17', 'track-listening-dbe3507b-q18', 'track-listening-dbe3507b-q19', 'track-listening-dbe3507b-q20'
]

print("\n" + "=" * 100)
print("FLOW_CHART_COMPLETION QUESTIONS (q37-q40)")
print("=" * 100)

for qid in affected_ids[:4]:
    cursor.execute('SELECT id, type, payload FROM questions WHERE id = ?', (qid,))
    result = cursor.fetchone()
    if result:
        qid, qtype, payload_str = result
        print(f"\nQuestion ID: {qid}")
        print(f"Type: {qtype}")
        try:
            payload = json.loads(payload_str)
            print(f"Payload Keys: {list(payload.keys())}")
            print(f"Payload Structure:")
            for key, value in payload.items():
                if isinstance(value, str):
                    preview = value[:60] + '...' if len(value) > 60 else value
                    print(f"  - {key}: {preview}")
                elif isinstance(value, list):
                    print(f"  - {key}: [{len(value)} items]")
                else:
                    print(f"  - {key}: {value}")
        except Exception as e:
            print(f"ERROR parsing payload: {e}")
            print(f"Raw payload: {payload_str[:200]}")

print("\n" + "=" * 100)
print("MATCHING_DRAGGABLE QUESTIONS (q12-q20)")
print("=" * 100)

for qid in affected_ids[4:]:
    cursor.execute('SELECT id, type, payload FROM questions WHERE id = ?', (qid,))
    result = cursor.fetchone()
    if result:
        qid, qtype, payload_str = result
        print(f"\nQuestion ID: {qid}")
        print(f"Type: {qtype}")
        try:
            payload = json.loads(payload_str)
            print(f"Payload Keys: {list(payload.keys())}")
            print(f"Payload Structure:")
            for key, value in payload.items():
                if isinstance(value, str):
                    preview = value[:60] + '...' if len(value) > 60 else value
                    print(f"  - {key}: {preview}")
                elif isinstance(value, list):
                    print(f"  - {key}: [{len(value)} items]")
                    if key == 'questions' and len(value) > 0:
                        print(f"    First item: {value[0]}")
                else:
                    print(f"  - {key}: {value}")
        except Exception as e:
            print(f"ERROR parsing payload: {e}")
            print(f"Raw payload: {payload_str[:200]}")

conn.close()

