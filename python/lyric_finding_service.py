import asyncio
import requests
from bs4 import BeautifulSoup
from shazamio import Shazam
from mutagen.id3 import ID3
from mutagen.mp3 import MP3
from lyricsgenius import Genius

# User provided constants
GENIUS_TOKEN = "s2suIFNrg8eTLm-6UGm5SHyXWsDcdE0517ahKBd-mysrN-klE1Q5hRkAQYugYpbS"
genius = Genius(GENIUS_TOKEN, verbose=False, remove_section_headers=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
}


def get_embedded_lyrics(file_path):
    try:
        audio = ID3(file_path)
        # Look for the 'USLT' (Unsynchronised lyrics/text transcription) tag
        lyrics = audio.getall('USLT')[0].text
        return lyrics
    except Exception as e:
        print(f"No embedded lyrics found: {e}")
        return None


def extract_metadata(file_path):
    """
    Extracts basic metadata (artist, title, album) from the file directly.
    """
    metadata = {
        "title": None,
        "artist": None,
        "album": None
    }
    try:
        audio = ID3(file_path)
        if 'TIT2' in audio:
            metadata['title'] = str(audio['TIT2'])
        if 'TPE1' in audio:
            metadata['artist'] = str(audio['TPE1'])
        if 'TALB' in audio:
            metadata['album'] = str(audio['TALB'])
    except Exception as e:
        print(f"Error extracting metadata: {e}")
    
    return metadata


# search_genius_lyrics() helper
def scrape_lyrics_from_url(song_url):
    """
    Scrapes lyrics from a Genius URL using BeautifulSoup.
    """
    try:
        r = requests.get(song_url, headers=HEADERS, timeout=10)
        r.raise_for_status()
        
        soup = BeautifulSoup(r.text, "html.parser")

        # New Genius layout (2023+)
        containers = soup.select("div[data-lyrics-container='true']")
        if not containers:
            return None

        # === Check ===
        print("Lyrics scraped: ")
        for c in containers:
            print(c)
        # =============

        lyrics = "\n".join(c.get_text(separator="\n") for c in containers)
        return lyrics.split("Read More", 1)[-1].strip()
    
    except Exception as e:
        print(f"Error scraping lyric: { e }")
        return None


def search_genius_lyrics(title, artist):
    """
    Searches Genius for the song and returns the lyrics safely.
    """
    try:
        results = genius.search_songs(f"{title} {artist}")
        if not results or not results.get("hits"):
            return None

        song_url = None

        # Safely loop through however many hits we actually got
        for hit_item in results["hits"]:
            hit = hit_item["result"]
            current_url = str(hit["url"])

            # Skip 'annotated' URLs and grab the first actual song URL
            if "annotated" not in current_url:
                song_url = current_url
                break  # We found a good URL, exit the loop!

        # Fallback: if somehow every single result was annotated (very rare),
        # just use the very first result we got.
        if not song_url:
            song_url = results["hits"][0]["result"]["url"]

        print(f"Scraping from: {song_url}")

        # Use your custom, working scraper
        return scrape_lyrics_from_url(song_url)

    except Exception as e:
        print(f"Genius search error: {e}")
        return None


async def _recognize_song_async(file_path):
    """
    Async function to recognize a song from an MP3 file using Shazam.
    """
    shazam = Shazam()
    try:
        out = await shazam.recognize(file_path)
        return out
    except Exception as e:
        print(f"Shazam error: {e}")
        return None


def recognize_song(file_path):
    """
    Synchronous wrapper to recognize a song from an MP3 file.
    Returns the full Shazam response dictionary.
    """
    try:
        return asyncio.run(_recognize_song_async(file_path))
    except Exception as e:
        print(f"Error recognizing song: {e}")
        return None


def find_song_info(file_path):
    """
    Main function to analyze a music file.
    1. Extract metadata.
    2. Run Shazam to identify/verify.
    3. Get Lyrics (Embedded -> Genius).
    """
    result = {
        "title": None,
        "artist": None,
        "album": None,
        "cover_art": None,
        "lyrics": None,
        "source": "Process"
    }

    # 1. Extract Metadata
    meta = extract_metadata(file_path)
    result.update({k: v for k, v in meta.items() if v})

    # 2. Run Shazam
    shazam_data = recognize_song(file_path)
    if shazam_data and 'track' in shazam_data:
        track = shazam_data['track']
        result['title'] = track.get('title', result['title'])
        result['artist'] = track.get('subtitle', result['artist']) # Shazam uses subtitle for artist
        if 'images' in track and 'coverart' in track['images']:
            result['cover_art'] = track['images']['coverart']
        
        # Sections often contain lyrics or other info
        # But we will use Genius for lyrics mainly
    
    # 3. Get Lyrics
    # Try embedded first
    embedded_lyrics = get_embedded_lyrics(file_path)
    if embedded_lyrics:
        result['lyrics'] = embedded_lyrics
        result['lyrics_source'] = "Embedded"
    
    # If no embedded lyrics, or we want to verify/overwrite (optional logic here)
    # Let's verify if we still need lyrics
    if not result['lyrics'] and result['title'] and result['artist']:
        print(f"Searching Genius for: {result['title']} by {result['artist']}")
        genius_lyrics = search_genius_lyrics(result['title'], result['artist'])
        if genius_lyrics:
            result['lyrics'] = genius_lyrics
            result['lyrics_source'] = "Genius"
            
    return result


# Test get lyric from the song Chandelier by Sia
if __name__ == "__main__":
    import sys
    import json
    
    mp3_file = '../dataset/test_shazam_chandelier.mp3'
    if len(sys.argv) > 1:
        mp3_file = sys.argv[1]

    if mp3_file:
        print(f"Analyzing: {mp3_file}")
        
        # Create a dummy file if it doesn't exist for quick local testing (optional)
        # But assuming file exists for now
        try:
            analysis_result = find_song_info(mp3_file)
            print(json.dumps(analysis_result, indent=4))
        except Exception as e:
            print(f"Execution error: {e}")
            
    else:
        print("Usage: python lyric_finding_service.py <path_to_mp3>")
