import sqlite3
from datetime import datetime

conn = sqlite3.connect('data/ielts.db')
cursor = conn.cursor()

print("=" * 70)
print("[*] ACTIVATING COMPREHENSIVE TEST")
print("=" * 70)

# Get the comprehensive test track (most recent listening track)
cursor.execute("SELECT id, title, status FROM tracks WHERE type='listening' ORDER BY created_at DESC LIMIT 1")
track = cursor.fetchone()

if track:
    track_id, title, status = track
    print(f"\n[INFO] Found Track:")
    print(f"   ID: {track_id}")
    print(f"   Title: {title}")
    print(f"   Current Status: {status}")

    # Activate it
    cursor.execute(
        "UPDATE tracks SET status='active', updated_at=? WHERE id=?",
        (datetime.now().isoformat(), track_id)
    )
    conn.commit()

    print(f"\n[OK] Track activated!")
    print(f"   New Status: active")

    # Get question count
    cursor.execute("SELECT COUNT(*) FROM questions WHERE track_id=?", (track_id,))
    q_count = cursor.fetchone()[0]

    # Get questions by type
    cursor.execute("SELECT type, COUNT(*) FROM questions WHERE track_id=? GROUP BY type ORDER BY type", (track_id,))
    type_counts = cursor.fetchall()

    print(f"\n[INFO] Track Details:")
    print(f"   Total Questions: {q_count}")
    print(f"   Question Types: {len(type_counts)}")
    print(f"\n   Questions by Type:")
    for qtype, count in type_counts:
        print(f"      [OK] {qtype}: {count}")

    print(f"\n[SUCCESS] Track is ready to use!")
    print(f"   Track ID: {track_id}")
else:
    print("\n[ERROR] No listening track found!")

conn.close()

