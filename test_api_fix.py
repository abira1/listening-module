#!/usr/bin/env python3
"""Test the fixed /api/tracks endpoint"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_get_tracks():
    """Test GET /api/tracks"""
    print("\n" + "="*60)
    print("TEST 1: GET /api/tracks")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/tracks")
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            tracks = response.json()
            print(f"✓ Tracks returned: {len(tracks)}")
            
            if tracks:
                print(f"\nFirst track:")
                print(f"  - ID: {tracks[0].get('id')}")
                print(f"  - Title: {tracks[0].get('title')}")
                print(f"  - Type: {tracks[0].get('type')}")
                print(f"  - Status: {tracks[0].get('status')}")
                print(f"  - Created: {tracks[0].get('created_at')}")
            
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Exception: {e}")
        return False

def test_get_tracks_by_type():
    """Test GET /api/tracks?track_type=listening"""
    print("\n" + "="*60)
    print("TEST 2: GET /api/tracks?track_type=listening")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/tracks", params={"track_type": "listening"})
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            tracks = response.json()
            print(f"✓ Listening tracks returned: {len(tracks)}")
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Exception: {e}")
        return False

def test_get_single_track():
    """Test GET /api/tracks/{track_id}"""
    print("\n" + "="*60)
    print("TEST 3: GET /api/tracks/{track_id}")
    print("="*60)
    
    try:
        # First get all tracks
        response = requests.get(f"{BASE_URL}/api/tracks")
        if response.status_code != 200:
            print("✗ Could not get tracks list")
            return False
        
        tracks = response.json()
        if not tracks:
            print("✗ No tracks available")
            return False
        
        track_id = tracks[0]['id']
        print(f"Testing with track ID: {track_id}")
        
        # Get single track
        response = requests.get(f"{BASE_URL}/api/tracks/{track_id}")
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            track = response.json()
            print(f"✓ Track retrieved successfully")
            print(f"  - Title: {track.get('title')}")
            print(f"  - Type: {track.get('type')}")
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Exception: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("IELTS PLATFORM - API ENDPOINT TESTS")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    
    # Wait for server to be ready
    print("\nWaiting for server to be ready...")
    for i in range(10):
        try:
            requests.get(f"{BASE_URL}/api/tracks")
            print("✓ Server is ready!")
            break
        except:
            if i < 9:
                time.sleep(1)
            else:
                print("✗ Server not responding")
                return
    
    # Run tests
    results = []
    results.append(("GET /api/tracks", test_get_tracks()))
    results.append(("GET /api/tracks?track_type=listening", test_get_tracks_by_type()))
    results.append(("GET /api/tracks/{track_id}", test_get_single_track()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! The API is working correctly.")
    else:
        print(f"\n✗ {total - passed} test(s) failed.")

if __name__ == "__main__":
    main()

