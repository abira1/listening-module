import sqlite3
from datetime import datetime

conn = sqlite3.connect('data/ielts.db')
cursor = conn.cursor()

print("=" * 60)
print("ACTIVATING READING TRACK")
print("=" * 60)

# Get the reading track
cursor.execute("SELECT id, title, status FROM tracks WHERE type='reading' ORDER BY created_at DESC LIMIT 1")
track = cursor.fetchone()

if track:
    track_id, title, status = track
    print(f"\n📖 Found Track:")
    print(f"   ID: {track_id}")
    print(f"   Title: {title}")
    print(f"   Current Status: {status}")
    
    # Activate it
    cursor.execute(
        "UPDATE tracks SET status='active', updated_at=? WHERE id=?",
        (datetime.now().isoformat(), track_id)
    )
    conn.commit()
    
    print(f"\n✅ Track activated!")
    print(f"   New Status: active")
    
    # Verify
    cursor.execute("SELECT status FROM tracks WHERE id=?", (track_id,))
    new_status = cursor.fetchone()[0]
    print(f"   Verified Status: {new_status}")
else:
    print("\n❌ No reading track found!")

conn.close()

