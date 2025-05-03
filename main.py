import asyncio
import os
import re
import json
import datetime
import random
import time
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from pymongo import MongoClient

async def fetch_search_results_html(linkedin_url: str, cookies: list, page_count: int = 2, headless: bool = True) -> list:
    """
    Fetch HTML content from LinkedIn search results with improved pagination support
    
    Args:
        linkedin_url: URL of the LinkedIn search results page
        cookies: List of cookies in Playwright format
        page_count: Number of pages to scrape (pagination)
        headless: Whether to run browser in headless mode
        
    Returns:
        List of HTML content strings, one for each page
    """
    # Prepare cookies for Playwright - ensure each cookie has required fields
    playwright_cookies = []
    for cookie in cookies:
        # Create a clean cookie with only the fields Playwright expects
        clean_cookie = {
            'name': cookie.get('name', ''),
            'value': cookie.get('value', ''),
            'domain': cookie.get('domain', '.linkedin.com'),
            'path': cookie.get('path', '/'),
            'expires': cookie.get('expires', -1),
            'secure': cookie.get('secure', True),
            'httpOnly': cookie.get('httpOnly', False),
            'sameSite': 'Lax'  # Always set to Lax as default
        }
        playwright_cookies.append(clean_cookie)
        
    html_results = []
    
    async with async_playwright() as p:
        # Launch browser with enhanced stealth mode to avoid detection
        browser = await p.chromium.launch(
            headless=headless,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
                '--disable-web-security',
                '--disable-setuid-sandbox',
                '--no-sandbox'
            ]
        )
        
        # Create context with advanced options to avoid detection
        context = await browser.new_context(
            viewport={'width': random.randint(1280, 1920), 'height': random.randint(800, 1080)},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            locale='en-US',
            timezone_id='America/New_York',
            geolocation={'longitude': -73.935242, 'latitude': 40.730610},
            permissions=['geolocation', 'notifications'],
            has_touch=False,
            is_mobile=False,
            color_scheme='light',
            reduced_motion='no-preference',
            forced_colors='none',
            accept_downloads=True
        )
        
        # Enhanced anti-detection scripts
        await context.add_init_script("""
            // Override webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false
            });
            
            // Override chrome property
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {},
                webstore: {}
            };
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
            );
            
            // Override plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    {
                        0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: {}},
                        description: "Portable Document Format",
                        filename: "internal-pdf-viewer",
                        length: 1,
                        name: "Chrome PDF Plugin"
                    },
                    {
                        0: {type: "application/pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: {}},
                        description: "Portable Document Format",
                        filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                        length: 1,
                        name: "Chrome PDF Viewer"
                    },
                    {
                        0: {type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: {}},
                        1: {type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: {}},
                        description: "",
                        filename: "internal-nacl-plugin",
                        length: 2,
                        name: "Native Client"
                    }
                ]
            });
            
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
            
            // Override platform
            Object.defineProperty(navigator, 'platform', {
                get: () => 'Win32'
            });
        """)

        # Set cookies for authenticated session
        try:
            await context.add_cookies(playwright_cookies)
            print("Cookies added successfully")
        except Exception as e:
            print(f"Error adding cookies: {e}")
            await browser.close()
            return []

        # Create page with stealth settings
        page = await context.new_page()
        
        # Set default navigation timeout to 2 minutes
        page.set_default_navigation_timeout(120000)
        
        # Go to LinkedIn homepage first to establish session
        try:
            print("Navigating to LinkedIn homepage first...")
            await page.goto('https://www.linkedin.com/', wait_until="networkidle")
            await page.wait_for_timeout(3000)  # Wait a bit
            
            # Check if logged in properly
            if "feed" in page.url:
                print("Successfully logged into LinkedIn!")
            else:
                print("WARNING: Not redirected to feed. Session may not be valid.")
                await page.screenshot(path=f'linkedin_homepage_check.png')
        except Exception as e:
            print(f"Error navigating to homepage: {e}")
            await page.screenshot(path=f'linkedin_homepage_error.png')
            await browser.close()
            return []
        
        # Parse the search URL to handle pagination properly
        parsed_url = urlparse(linkedin_url)
        
        # Process each page up to page_count
        for current_page in range(1, page_count + 1):
            # Properly construct URL with pagination parameters
            query_params = parse_qs(parsed_url.query)
            query_params['page'] = [str(current_page)]
            
            # LinkedIn often uses a "start" parameter for pagination (results per page * page number)
            if current_page > 1:
                # LinkedIn typically shows 10 results per page
                start_index = (current_page - 1) * 10
                query_params['start'] = [str(start_index)]
            
            # Rebuild the URL
            new_query = urlencode(query_params, doseq=True)
            new_url = urlunparse((
                parsed_url.scheme,
                parsed_url.netloc,
                parsed_url.path,
                parsed_url.params,
                new_query,
                parsed_url.fragment
            ))
                    
            print(f"Navigating to page {current_page}: {new_url}")
            
            # Add randomized delays between requests to appear more human-like
            if current_page > 1:
                delay = random.uniform(5, 8)
                print(f"Waiting {delay:.2f} seconds before navigating to next page...")
                await page.wait_for_timeout(delay * 1000)
            
            try:
                # Navigate to the search results page with retry mechanism
                max_retries = 3
                for attempt in range(1, max_retries + 1):
                    try:
                        response = await page.goto(
                            new_url, 
                            wait_until="networkidle",
                            timeout=60000  # 60 seconds timeout
                        )
                        break  # Exit retry loop if successful
                    except Exception as e:
                        if attempt == max_retries:
                            raise e
                        print(f"Navigation attempt {attempt} failed: {e}. Retrying...")
                        await page.wait_for_timeout(5000)  # Wait 5 seconds before retry
            
                # Check for login page and warn if detected
                if "login" in page.url or "signin" in page.url or await page.title() == "LinkedIn Login":
                    print("WARNING: Redirected to login page. Your cookies might be invalid or expired.")
                    await page.screenshot(path=f'linkedin_login_redirect_page{current_page}.png')
                    print(f"Screenshot saved as 'linkedin_login_redirect_page{current_page}.png'")
                    break
                
                # IMPORTANT: Wait for the page to fully load and search results to appear
                # Try multiple selectors that might indicate search results
                selectors = [
                    'div.reusable-search__result-container',
                    'div.lMypdfcjUtfJtdoPGRBhqTmWVQeCY',
                    'div[data-chameleon-result-urn]',
                    'li.reusable-search__result-container',
                    'ul.reusable-search__entity-result-list',
                    'div.search-results-container'
                ]
                
                print(f"Waiting for search results to load on page {current_page}...")
                selector_found = False
                
                for selector in selectors:
                    try:
                        print(f"Trying selector: {selector}")
                        await page.wait_for_selector(selector, timeout=20000)
                        print(f"Found selector: {selector}")
                        selector_found = True
                        break
                    except Exception as e:
                        print(f"Selector {selector} not found: {e}")
                
                if not selector_found:
                    print("WARNING: Could not find any search results with known selectors")
                    await page.screenshot(path=f'linkedin_no_results_page{current_page}.png')
                    print(f"Screenshot saved as 'linkedin_no_results_page{current_page}.png'")
                
                # Enhanced scrolling with random pauses to mimic human behavior
                print(f"Performing human-like scrolling on page {current_page}...")
                
                # Get page height
                page_height = await page.evaluate("document.body.scrollHeight")
                viewport_height = await page.evaluate("window.innerHeight")
                
                # Scroll in smaller increments with random pauses
                current_scroll = 0
                while current_scroll < page_height:
                    # Random scroll distance between 300-700 pixels
                    scroll_distance = random.randint(300, 700)
                    current_scroll += scroll_distance
                    
                    # Scroll to position
                    await page.evaluate(f"window.scrollTo(0, {current_scroll})")
                    
                    # Random pause between scrolls (350-750ms)
                    await page.wait_for_timeout(random.randint(350, 750))
                    
                    # Occasionally longer pause (10% chance)
                    if random.random() < 0.1:
                        await page.wait_for_timeout(random.randint(1000, 2000))
                
                # Scroll back to top with random speed
                print("Scrolling back to top...")
                await page.evaluate("""
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                """)
                await page.wait_for_timeout(1000)  # Wait for smooth scroll to complete
                
                # Save screenshot and HTML for debugging
                print(f"Taking screenshot and saving HTML for page {current_page}...")
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                await page.screenshot(path=f'linkedin_screenshot_page{current_page}_{timestamp}.png')
                html = await page.content()
                with open(f'linkedin_page{current_page}_{timestamp}.html', 'w', encoding='utf-8') as f:
                    f.write(html)
                
                # Add the HTML to our results
                html_results.append(html)
                
                # Check if we need to navigate to next page
                if current_page < page_count:
                    # Look for next page button
                    next_page_selectors = [
                        'button[aria-label="Next"]',
                        'li.artdeco-pagination__indicator--number.active + li a',
                        'button.artdeco-pagination__button--next'
                    ]
                    
                    found_next = False
                    for selector in next_page_selectors:
                        try:
                            if await page.query_selector(selector):
                                print(f"Found next page button with selector: {selector}")
                                found_next = True
                                break
                        except:
                            pass
                    
                    if not found_next:
                        print("WARNING: Could not find next page button. This might be the last page.")
                
            except Exception as e:
                print(f"Error processing LinkedIn page {current_page}: {e}")
                await page.screenshot(path=f'linkedin_error_page{current_page}.png')
                print(f"Error screenshot saved as 'linkedin_error_page{current_page}.png'")
                break
        
        # Close the browser
        await browser.close()
        return html_results

def parse_search_results(html: str):
    """
    Parse LinkedIn search results and extract profile information
    with improved robustness to handle LinkedIn's dynamic HTML structure
    """
    soup = BeautifulSoup(html, 'html.parser')
    profiles = []
    profile_urls_seen = set()  # Track unique profile URLs

    # Try multiple selectors for profile cards to handle LinkedIn's variations
    all_profile_cards = []
    
    # Try different selectors for profile cards
    selectors = [
        'div.lMypdfcjUtfJtdoPGRBhqTmWVQeCY',
        'div.reusable-search__result-container',
        'li.reusable-search__result-container',
        'div[data-chameleon-result-urn]',
        'div.entity-result'
    ]
    
    for selector in selectors:
        cards = soup.select(selector)
        if cards:
            print(f"Found {len(cards)} profile cards with selector: {selector}")
            all_profile_cards.extend(cards)
    
    # Deduplicate cards based on profile URL
    unique_cards = []
    seen_urls = set()
    
    for card in all_profile_cards:
        # Try to find a profile link with various selectors
        link = None
        link_selectors = [
            'a[data-test-app-aware-link]',
            'a.app-aware-link',
            'a[href*="/in/"]'
        ]
        
        for selector in link_selectors:
            link_elem = card.select_one(selector)
            if link_elem and link_elem.get('href'):
                link = link_elem.get('href')
                break
        
        if link and link not in seen_urls:
            seen_urls.add(link)
            unique_cards.append(card)
    
    print(f"Found {len(unique_cards)} unique profile cards after deduplication")
    
    for card in unique_cards:
        # Extract profile link with multiple selector attempts
        profile_url = None
        for selector in ['a[data-test-app-aware-link]', 'a.app-aware-link', 'a[href*="/in/"]']:
            link_tag = card.select_one(selector)
            if link_tag and link_tag.get('href'):
                profile_url = link_tag.get('href')
                if profile_url and '/in/' in profile_url:
                    break
        
        if not profile_url or '/in/' not in profile_url:
            continue
        
        # Clean up profile URL if needed
        if '?' in profile_url:
            profile_url = profile_url.split('?')[0]
            
        # Make sure we have absolute URL
        if not profile_url.startswith('http'):
            profile_url = f'https://www.linkedin.com{profile_url}'
        
        # Extract profile ID from the URL
        profile_id = None
        if "miniProfileUrn=" in profile_url:
            try:
                profile_id = profile_url.split("miniProfileUrn=")[1].split("&")[0]
            except (IndexError, ValueError):
                pass
        elif "/in/" in profile_url:
            try:
                # Extract username from URL as fallback ID
                profile_id = "in:" + profile_url.split("/in/")[1].split("?")[0].split("/")[0]
            except (IndexError, ValueError):
                pass
                
        # Use either the ID or the full URL as the unique identifier
        unique_id = profile_id if profile_id else profile_url
        
        if unique_id in profile_urls_seen:
            continue
            
        profile_urls_seen.add(unique_id)

        # Extract profile image with multiple selector attempts
        profile_img = None
        for img_selector in ['img.presence-entity__image', 'img.ivm-view-attr__img--centered', 'img.artdeco-entity-image']:
            img_tag = card.select_one(img_selector)
            if img_tag and img_tag.get('src'):
                profile_img = img_tag.get('src')
                break

        # Extract name with improved robustness
        name = None
        # Try multiple name selectors
        name_selectors = [
            'span.entity-result__title-text',
            'span.entity-result__title-line',
            'span.artdeco-entity-lockup__title',
            'span.app-aware-link',
            'span[aria-hidden="true"]',
            '.artdeco-entity-lockup__title',
            '.entity-result__title-text',
            'a .nuXDIvMbeMYWApPugutCOKmVhZzvTYUM'
        ]
        
        for selector in name_selectors:
            name_elem = card.select_one(selector)
            if name_elem:
                raw_text = name_elem.get_text(strip=True)
                # Filter out status indicators
                if raw_text and not any(status in raw_text.lower() for status in ["status is", "premium", "• "]):
                    name = raw_text
                    break
        
        # If name extraction failed, try to get from URL
        if not name and '/in/' in profile_url:
            try:
                # Extract username from profile URL
                username = profile_url.split('/in/')[1].split('?')[0].split('/')[0]
                # Convert username to a more readable format (e.g., john-doe -> John Doe)
                if username:
                    name = ' '.join(word.capitalize() for word in username.split('-') 
                                  if word and not word.isdigit())
            except:
                pass

        # Extract headline with multiple selector attempts
        headline = None
        headline_selectors = [
            'div.entity-result__primary-subtitle',
            'div.artdeco-entity-lockup__subtitle',
            'div.QmHtvHCBOiVUdutUPDZihOIsguJlXpIDOWlyM',
            '.entity-result__primary-subtitle'
        ]
        
        for selector in headline_selectors:
            headline_elem = card.select_one(selector)
            if headline_elem:
                headline = headline_elem.get_text(strip=True)
                break

        # Extract location with multiple selector attempts
        location = None
        location_selectors = [
            'div.entity-result__secondary-subtitle',
            'div.artdeco-entity-lockup__caption',
            'div.DbgAxgMCMeLqXAmIGwDoxglkpoIEUQClYZqk',
            '.entity-result__secondary-subtitle'
        ]
        
        for selector in location_selectors:
            location_elem = card.select_one(selector)
            if location_elem:
                location = location_elem.get_text(strip=True)
                break

        # Extract summary with multiple selector attempts
        summary = None
        summary_selectors = [
            'p.entity-result__summary',
            'p.artdeco-entity-lockup__summary',
            'p.CHpjKodTFmcxnHVPBHSawvwXwVHKzXMWfpzTZI',
            '.entity-result__summary'
        ]
        
        for selector in summary_selectors:
            summary_elem = card.select_one(selector)
            if summary_elem:
                summary = summary_elem.get_text(strip=True)
                break

        # Extract connection degree with multiple selector attempts
        connection_degree = None
        connection_selectors = [
            'div.entity-result__badge-text',
            'span.artdeco-entity-lockup__degree',
            'span.distance-badge',
            '.entity-result__badge-text'
        ]
        
        for selector in connection_selectors:
            connection_elem = card.select_one(selector)
            if connection_elem:
                connection_degree = connection_elem.get_text(strip=True)
                break

        profiles.append({
            'profile_id': profile_id,
            'profile_url': profile_url,
            'name': name,
            'profile_img': profile_img,
            'headline': headline,
            'location': location,
            'summary': summary,
            'connection_degree': connection_degree
        })

    return profiles

def merge_profile_data(existing_profile, new_profile):
    """
    Merge data from two profile entries, keeping the most complete information
    """
    merged_profile = existing_profile.copy()
    
    # For each field in the new profile, update the merged profile if the new data is more complete
    for field in ['name', 'profile_img', 'headline', 'location', 'summary', 'connection_degree']:
        if new_profile.get(field) and (field not in existing_profile or not existing_profile.get(field)):
            merged_profile[field] = new_profile[field]
    
    return merged_profile

def consolidate_profiles(profiles):
    """
    Consolidate duplicate profiles into a single profile with the most complete information
    """
    consolidated = {}
    
    for profile in profiles:
        # Use profile_id as the key if available, otherwise use profile_url
        key = profile.get('profile_id') if profile.get('profile_id') else profile.get('profile_url')
        
        if not key:
            continue  # Skip profiles without an identifier
            
        if key not in consolidated:
            consolidated[key] = profile
        else:
            # Merge with existing profile
            consolidated[key] = merge_profile_data(consolidated[key], profile)
    
    return list(consolidated.values())

def clean_profile_data(profile):
    """
    Clean profile data to replace None values with appropriate defaults
    """
    defaults = {
        'name': 'Unknown',
        'profile_img': 'Not provided',
        'headline': 'No headline',
        'location': 'Not provided',
        'summary': 'Not provided',
        'connection_degree': 'Not provided'
    }
    
    for field, default in defaults.items():
        if field not in profile or profile[field] is None:
            profile[field] = default
    
    return profile

def save_to_mongo(profiles):
    """
    Save consolidated profile data to MongoDB
    """
    try:
        # Connect to MongoDB - use environment variable if available
        mongo_uri = os.environ.get('MONGO_URI', '')
        client = MongoClient(mongo_uri)
        db = client['linkedin_db']
        collection = db['profiles']
        
        inserted_count = 0
        updated_count = 0
        
        # Insert profiles into MongoDB
        for profile in profiles:
            # Clean data before saving
            clean_profile = clean_profile_data(profile)
            
            # Add timestamp
            clean_profile['scraped_at'] = datetime.datetime.now()
            
            # Use profile_id as the primary identifier if available
            query = {'profile_id': profile['profile_id']} if profile.get('profile_id') else {'profile_url': profile['profile_url']}
            
            result = collection.update_one(
                query,
                {'$set': clean_profile},
                upsert=True
            )
            
            if result.upserted_id:
                inserted_count += 1
            else:
                updated_count += 1

        print(f"Inserted {inserted_count} new profiles and updated {updated_count} existing profiles in MongoDB.")
        return inserted_count, updated_count
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
        return 0, 0

def parse_cookies(cookie_input, domain=None):
    """
    Parse cookies from various formats and convert to Playwright format
    
    Supported formats:
    - JSON array (Playwright format)
    - Netscape cookie file format
    - Browser DevTools copy-paste format (Name=Value; pairs)
    - Raw Cookie header value
    
    Args:
        cookie_input: String containing cookies or path to a cookie file
        domain: Optional domain to apply to cookies without domain specified
        
    Returns:
        List of cookie dictionaries in Playwright format
    """
    cookies = []
    default_domain = domain or '.linkedin.com'
    
    # Check if input is a file path
    if os.path.exists(cookie_input):
        with open(cookie_input, 'r', encoding='utf-8') as f:
            content = f.read().strip()
    else:
        content = cookie_input.strip()
    
    # Try to parse as JSON first
    try:
        parsed_cookies = json.loads(content)
        if isinstance(parsed_cookies, list):
            return parsed_cookies  # We'll normalize these later
    except json.JSONDecodeError:
        pass
    
    # Try to parse as Netscape cookie file format
    # Example: .example.com TRUE / FALSE 1698749069 name value
    if re.search(r'^\S+\s+(TRUE|FALSE)\s+\/\S*\s+(TRUE|FALSE)\s+\d+\s+\S+\s+\S+', content, re.MULTILINE):
        for line in content.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            parts = line.split()
            if len(parts) >= 7:
                domain_str = parts[0]
                path = parts[2]
                secure = parts[3].upper() == 'TRUE'
                expires = int(parts[4])
                name = parts[5]
                value = parts[6]
                
                cookie = {
                    'name': name,
                    'value': value,
                    'domain': domain_str,
                    'path': path,
                    'expires': expires,
                    'secure': secure,
                    'httpOnly': False
                }
                cookies.append(cookie)
        
        if cookies:
            return cookies
    
    # Try to parse as DevTools copy format or raw Cookie header
    # Example: name1=value1; name2=value2; name3=value3
    if ';' in content:
        pairs = re.split(r';\s*', content)
        
        for pair in pairs:
            if '=' not in pair:
                continue
                
            name, value = pair.split('=', 1)
            name = name.strip()
            value = value.strip()
            
            if name and value:
                cookie = {
                    'name': name,
                    'value': value,
                    'domain': default_domain,
                    'path': '/',
                    'expires': int((datetime.datetime.now() + datetime.timedelta(days=30)).timestamp()),
                    'secure': True,
                    'httpOnly': False
                }
                cookies.append(cookie)
        
        if cookies:
            return cookies
    
    # If we get here, we couldn't parse the cookies
    raise ValueError("Cookie format not recognized. Please provide cookies in a supported format.")

# ---- MAIN USAGE ----
if __name__ == '__main__':
    # Set default values
    cookie_source = 'cookies.json'  # Default file path
    retries = 2  # Number of times to retry the entire process if it fails
    
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser(description='LinkedIn Profile Scraper with improved pagination')
    parser.add_argument('--url', type=str, help='LinkedIn search URL to scrape', 
                       default='https://www.linkedin.com/search/results/people/?geoUrn=%5B%22103644278%22%5D&industry=%5B%221594%22%2C%221862%22%2C%2280%22%5D&keywords=%22lead%20generation%20agency%22&origin=GLOBAL_SEARCH_HEADER&sid=z%40k&titleFreeText=Founder')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode', default=False)
    parser.add_argument('--pages', type=int, help='Number of pages to scrape', default=2)
    parser.add_argument('--cookies', type=str, help='Path to cookies file or raw cookies', default=cookie_source)
    parser.add_argument('--retries', type=int, help='Number of retries for failed scraping', default=retries)
    args = parser.parse_args()
    
    linkedin_search_url = args.url
    cookie_source = args.cookies
    retries = args.retries
    
    # Try to load cookies from file or environment
    try:
        # First try to load as a file
        if os.path.exists(cookie_source):
            with open(cookie_source, 'r', encoding='utf-8') as f:
                cookie_content = f.read()
        else:
            # If no file, check if there's raw cookie content in an env var
            cookie_content = os.environ.get('LINKEDIN_COOKIES', '')
            if not cookie_content:
                raise FileNotFoundError("No cookie file or environment variable found")
        
        # Parse the cookies
        cookies = parse_cookies(cookie_content, domain='.linkedin.com')
        
        if not cookies:
            raise ValueError("No valid cookies found")
                
        print(f"Successfully loaded {len(cookies)} cookies")
        
    except (FileNotFoundError, ValueError) as e:
        print(f"Error loading cookies: {e}")
        print("Please provide valid LinkedIn cookies in cookies.json file or LINKEDIN_COOKIES environment variable.")
        exit(1)

    # Execute the main scraping function with retry logic
    success = False
    all_profiles = []
    
    for attempt in range(1, retries + 1):
        if success:
            break
            
        print(f"\n--- Scraping attempt {attempt}/{retries} ---")
        
        try:
            # Fetch HTML content from LinkedIn
            html_pages = asyncio.run(fetch_search_results_html(
                linkedin_url=linkedin_search_url, 
                cookies=cookies,
                page_count=args.pages,
                headless=args.headless
            ))
            
            if not html_pages:
                print(f"Attempt {attempt}: Failed to fetch HTML content.")
                if attempt < retries:
                    delay = random.uniform(10, 20)
                    print(f"Waiting {delay:.2f} seconds before retry...")
                    time.sleep(delay)
                continue
            
            # Parse profiles from all pages
            for i, html_content in enumerate(html_pages, 1):
                print(f"\nParsing results from page {i}...")
                page_profiles = parse_search_results(html_content)
                print(f"Found {len(page_profiles)} profiles on page {i}")
                
                # Save HTML for debugging if needed
                with open(f'parsed_page_{i}_results.json', 'w', encoding='utf-8') as f:
                    json.dump(page_profiles, f, indent=2)
                    
                all_profiles.extend(page_profiles)
                
            if all_profiles:
                success = True
            else:
                print(f"Attempt {attempt}: No profiles were extracted.")
                if attempt < retries:
                    delay = random.uniform(15, 30)
                    print(f"Waiting {delay:.2f} seconds before retry...")
                    time.sleep(delay)
        
        except Exception as e:
            print(f"Attempt {attempt} failed with error: {e}")
            if attempt < retries:
                delay = random.uniform(15, 30)
                print(f"Waiting {delay:.2f} seconds before retry...")
                time.sleep(delay)
    
    if not success:
        print("All scraping attempts failed. Please check your cookies and try again.")
        exit(1)
        
    # Consolidate duplicate profiles across all pages
    consolidated_profiles = consolidate_profiles(all_profiles)
    
    # Print summary stats
    print(f"\n=== SCRAPING RESULTS ===")
    print(f"Total raw profiles found: {len(all_profiles)}")
    print(f"Total consolidated profiles: {len(consolidated_profiles)}")
    
    # Save the consolidated profiles to MongoDB
    inserted, updated = save_to_mongo(consolidated_profiles)
    print(f"MongoDB results: {inserted} new profiles, {updated} updated profiles")

    # Print some sample profiles
    print("\n=== SAMPLE PROFILES ===")
    sample_size = min(5, len(consolidated_profiles))
    for i, profile in enumerate(consolidated_profiles[:sample_size], 1):
        print(f"\nProfile {i}:")
        print(f"  Name: {profile.get('name', 'Unknown')}")
        print(f"  Profile URL: {profile.get('profile_url', 'Unknown')}")
        print(f"  Headline: {profile.get('headline', 'No headline')}")
        print(f"  Location: {profile.get('location', 'Not provided')}")
        
    print(f"\nScraping completed successfully. {len(consolidated_profiles)} profiles extracted.")