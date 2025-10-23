#!/usr/bin/env python3
"""Check question types in database"""

import sqlite3
import json

conn = sqlite3.connect('backend/data/ielts.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get all tracks
cursor.execute('SELECT id, title, type FROM tracks LIMIT 5')
tracks = cursor.fetchall()
print('=== TRACKS ===')
for track in tracks:
    print(f'Track: {track["id"]} - {track["title"]} ({track["type"]})')
    
    # Get questions for this track
    cursor.execute('SELECT id, type, payload FROM questions WHERE track_id = ? LIMIT 5', (track['id'],))
    questions = cursor.fetchall()
    print(f'  Questions: {len(questions)}')
    for q in questions:
        print(f'    - {q["id"]}: {q["type"]}')

# Get all unique question types
cursor.execute('SELECT DISTINCT type FROM questions ORDER BY type')
types = cursor.fetchall()
print('\n=== UNIQUE QUESTION TYPES ===')
for t in types:
    cursor.execute('SELECT COUNT(*) as cnt FROM questions WHERE type = ?', (t['type'],))
    count = cursor.fetchone()['cnt']
    print(f'  {t["type"]}: {count} questions')

conn.close()

