#!/usr/bin/env python3
"""
Test script to verify that imported tracks appear in Track Management
"""

import requests
import json
import time

BASE_URL = 'http://localhost:8000/api'

def wait_for_server():
    """Wait for server to start"""
    for i in range(30):
        try:
            requests.get(f"{BASE_URL}/exams", timeout=2)
            print("✅ Server is ready")
            return True
        except:
            if i % 5 == 0:
                print(f"⏳ Waiting for server... ({i}s)")
            time.sleep(1)
    return False

def test_track_visibility():
    """Test that imported tracks are visible in Track Management"""
    
    print("\n" + "="*60)
    print("TRACK VISIBILITY TEST")
    print("="*60)
    
    # Step 1: Get initial track count
    print("\n[Step 1] Getting initial track count...")
    try:
        response = requests.get(f"{BASE_URL}/tracks", timeout=10)
        if response.status_code == 200:
            initial_tracks = response.json()
            print(f"✅ Initial tracks: {len(initial_tracks)}")
            for track in initial_tracks[:3]:
                print(f"   - {track.get('title')} (type: {track.get('track_type', 'N/A')})")
        else:
            print(f"❌ Failed to get tracks: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Step 2: Create a test track via AI import
    print("\n[Step 2] Creating test track via AI import...")
    
    test_json = {
        "test_type": "listening",
        "title": "Test Track Visibility - Listening",
        "description": "Test track to verify visibility in Track Management",
        "duration_seconds": 2400,
        "audio_url": "https://example.com/audio.mp3",
        "sections": [
            {
                "index": 1,
                "title": "Section 1",
                "instructions": "Listen and answer",
                "questions": [
                    {
                        "index": i,
                        "type": "multiple_choice" if i % 2 == 0 else "short_answer",
                        "prompt": f"Question {i}",
                        "answer_key": "A" if i % 2 == 0 else "answer"
                    }
                    for i in range(1, 11)
                ]
            },
            {
                "index": 2,
                "title": "Section 2",
                "instructions": "Listen and answer",
                "questions": [
                    {
                        "index": i,
                        "type": "multiple_choice" if i % 2 == 0 else "short_answer",
                        "prompt": f"Question {i}",
                        "answer_key": "B" if i % 2 == 0 else "answer"
                    }
                    for i in range(11, 21)
                ]
            },
            {
                "index": 3,
                "title": "Section 3",
                "instructions": "Listen and answer",
                "questions": [
                    {
                        "index": i,
                        "type": "multiple_choice" if i % 2 == 0 else "short_answer",
                        "prompt": f"Question {i}",
                        "answer_key": "C" if i % 2 == 0 else "answer"
                    }
                    for i in range(21, 31)
                ]
            },
            {
                "index": 4,
                "title": "Section 4",
                "instructions": "Listen and answer",
                "questions": [
                    {
                        "index": i,
                        "type": "multiple_choice" if i % 2 == 0 else "short_answer",
                        "prompt": f"Question {i}",
                        "answer_key": "D" if i % 2 == 0 else "answer"
                    }
                    for i in range(31, 41)
                ]
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/tracks/import-from-ai",
            json=test_json,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            track_id = result.get('track_id')
            print(f"✅ Track created: {track_id}")
            print(f"   Questions: {result.get('questions_created')}")
            print(f"   Sections: {result.get('sections_created')}")
        else:
            print(f"❌ Failed to create track: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Step 3: Wait a moment for database to sync
    print("\n[Step 3] Waiting for database sync...")
    time.sleep(2)
    
    # Step 4: Get updated track list
    print("\n[Step 4] Getting updated track list...")
    try:
        response = requests.get(f"{BASE_URL}/tracks", timeout=10)
        if response.status_code == 200:
            updated_tracks = response.json()
            print(f"✅ Updated tracks: {len(updated_tracks)}")
            
            # Check if new track is in the list
            new_track = None
            for track in updated_tracks:
                if track.get('id') == track_id:
                    new_track = track
                    break
            
            if new_track:
                print(f"\n✅ NEW TRACK FOUND IN LIST!")
                print(f"   ID: {new_track.get('id')}")
                print(f"   Title: {new_track.get('title')}")
                print(f"   Type: {new_track.get('track_type')}")
                print(f"   Status: {new_track.get('status')}")
                print(f"   Questions: {new_track.get('total_questions')}")
                print(f"   Source: {new_track.get('source')}")
                
                # Verify field names
                if 'track_type' in new_track:
                    print(f"   ✅ Field 'track_type' present (correct)")
                else:
                    print(f"   ❌ Field 'track_type' missing (should be present)")
                    return False
                
                return True
            else:
                print(f"❌ NEW TRACK NOT FOUND IN LIST!")
                print(f"   Looking for ID: {track_id}")
                print(f"   Available tracks:")
                for track in updated_tracks:
                    print(f"     - {track.get('id')}: {track.get('title')}")
                return False
        else:
            print(f"❌ Failed to get tracks: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == '__main__':
    if not wait_for_server():
        print("❌ Server failed to start")
        exit(1)
    
    success = test_track_visibility()
    
    print("\n" + "="*60)
    if success:
        print("✅ TEST PASSED - Imported tracks are visible!")
    else:
        print("❌ TEST FAILED - Imported tracks not visible")
    print("="*60)
    
    exit(0 if success else 1)

