import sqlite3

conn = sqlite3.connect('backend/data/ielts.db')
cursor = conn.cursor()

# Check questions table schema
cursor.execute("PRAGMA table_info(questions)")
columns = cursor.fetchall()
print('Questions table columns:')
for col in columns:
    print(f'  {col[1]} ({col[2]})')

print()

# Get sample question
cursor.execute('SELECT * FROM questions LIMIT 1')
sample = cursor.fetchone()
if sample:
    print('Sample question:')
    print(f'  Columns: {[description[0] for description in cursor.description]}')
    print(f'  Values: {sample}')

conn.close()

