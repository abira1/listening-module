# Listening Tracks Directory

This directory stores all uploaded audio files for IELTS Listening tests.

## Storage Information

- **Purpose:** Local storage for audio files uploaded through the admin panel
- **Access:** Files are served via `/listening_tracks/{filename}` endpoint
- **Formats:** MP3, WAV, M4A, OGG, FLAC
- **Naming:** Files are automatically renamed with unique UUIDs to prevent conflicts

## Directory Structure

```
/app/listening_tracks/
├── {uuid-1}.mp3
├── {uuid-2}.wav
├── {uuid-3}.m4a
└── ...
```

## File Management

### Viewing Files
```bash
ls -lh /app/listening_tracks/
```

### Checking Disk Usage
```bash
du -sh /app/listening_tracks/
```

### Backing Up
```bash
tar -czf listening_tracks_backup_$(date +%Y%m%d).tar.gz /app/listening_tracks/
```

### Restoring from Backup
```bash
tar -xzf listening_tracks_backup_YYYYMMDD.tar.gz -C /
```

## Important Notes

- **Do not manually delete files** unless you're certain they're not referenced by any exam
- Files are referenced in the database by their URL path
- Orphaned files (not referenced by any exam) can accumulate over time
- Consider implementing a cleanup script for production use

## Security

- Files are publicly accessible via URL
- No authentication required for playback
- Ensure proper file permissions (644 or 755)
- Validate file types on upload to prevent abuse

## Maintenance

Recommended maintenance tasks:

1. **Regular backups** - Daily or weekly depending on upload frequency
2. **Disk space monitoring** - Alert when reaching 80% capacity
3. **Orphan cleanup** - Monthly removal of unreferenced files
4. **Access logs** - Monitor for unusual download patterns

## Troubleshooting

### File not found (404)
- Verify file exists: `ls /app/listening_tracks/{filename}`
- Check file permissions: `chmod 644 /app/listening_tracks/{filename}`
- Verify static file mounting in server.py

### Upload fails
- Check disk space: `df -h /app`
- Verify directory permissions: `chmod 755 /app/listening_tracks`
- Check backend logs: `tail -f /var/log/supervisor/backend.*.log`

### Cannot play audio
- Verify file format is supported
- Test file directly: `curl http://localhost:8001/listening_tracks/{filename} -o test.mp3`
- Check CORS settings in backend

## Git

This directory is included in version control, but audio files are ignored via `.gitignore`.
Only this README and .gitignore are tracked.
