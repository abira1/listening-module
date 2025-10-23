import sqlite3

conn = sqlite3.connect('data/ielts.db')
cursor = conn.cursor()

# Check reading tracks
print("=" * 60)
print("READING TRACKS IN DATABASE")
print("=" * 60)

cursor.execute("SELECT id, title, type, status FROM tracks WHERE type='reading' ORDER BY created_at DESC LIMIT 10")
rows = cursor.fetchall()

if rows:
    for r in rows:
        print(f"\n✅ Track Found:")
        print(f"   ID: {r[0]}")
        print(f"   Title: {r[1]}")
        print(f"   Type: {r[2]}")
        print(f"   Status: {r[3]}")
else:
    print("\n❌ No reading tracks found!")

# Check total tracks
cursor.execute("SELECT COUNT(*) FROM tracks")
total = cursor.fetchone()[0]
print(f"\n📊 Total tracks in database: {total}")

# Check sections for the reading track
if rows:
    track_id = rows[0][0]
    cursor.execute("SELECT COUNT(*) FROM sections WHERE track_id=?", (track_id,))
    section_count = cursor.fetchone()[0]
    print(f"\n📋 Sections in latest reading track: {section_count}")
    
    # Check questions
    cursor.execute("SELECT COUNT(*) FROM questions WHERE track_id=?", (track_id,))
    question_count = cursor.fetchone()[0]
    print(f"❓ Questions in latest reading track: {question_count}")

conn.close()

