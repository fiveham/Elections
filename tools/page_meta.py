"""Module to scan interactive map webpages in a Github repo and report problems
with those html files' <meta> tags for social media sharing and a few other
potential problems."""

import io, requests
from bs4 import BeautifulSoup
from PIL import Image

#Given a starting point in a repo on Github, recurse through the repo, checking
#every html file in the repo by calling page_check.
def from_github(start_url, manual_url=None, print=False):
    """Scan a Github repo for issues starting from the page at `start_url`.

       Get (request) the Github page at `start_url`. Look for the <table> in
       which files and subdirectories in a directory are placed. If there is one,
       then recursively call `from_github` on each Github page linked in that
       table. If there is not one, then the page is a document. If the document
       is not html, ignore it; otherwise, grab the text content of a specific
       part of the page where the document is presented, parse it with
       BeautifulSoup, and send it to `page_check`.

       Return a list of url-issues pairs describing the issues with each html
       document at each url.

       :param start_url: Scan this page and any pages it links to as files or
       subdirectories within the repo.

       :param manual_url: If specified, the canonical url read from an html file
       in the repo is checked for equality with this url."""
    
    start_page = read_html_doc(start_url)
    
    result = []
    if start_url.endswith('.html'): #html file
        t = start_page.find(
                lambda tag:(tag.name == 'td' and
                            'data-line-number' in tag.attrs and
                            tag['data-line-number'] == '1'))
        table = t.parent.parent
        html_text = table.get_text()
        soup = BeautifulSoup(html_text, 'html.parser')
        issues = page_check(soup, manual_url)
        put_in = {'url':start_url, 'issues':issues}
        result.append(put_in)
    elif '.' not in start_url[start_url.rfind("/")+1:]: #directory
        table = start_page.find(
                lambda tag : (tag.name == 'table' and
                              'class' in tag.attrs and
                              all(x in tag['class'] 
                                  for x in ('files','js-navigation-container'))))
        tbody = table.tbody
        trs = tbody(lambda tag : (tag.name=="tr" and
                                  'class' in tag.attrs and
                                  'js-navigation-item' in tag['class']))
        for tr in trs:
            path = tr.a['href']
            result.extend(from_github('https://github.com'+path))

    if print:
        pretty_print_issues(result)
    
    return result

def read_html_doc(github_url):
    #assert github_url.endswith('.html')
    start_resp = requests.get(github_url)
    return BeautifulSoup(start_resp.text, 'html.parser')

std_tags = [
    "title"]
std_links = [
    "canonical",
    "shortcut", #favicon icon beside title in tab
    "icon"]     #favicon icon beside title in tab
std_metas = [
    "robots",
    "description",
    "og:image",
    "og:image:url",
    "og:image:secure_url",
    "og:image:alt",
    "og:image:type",
    "og:image:width",
    "og:image:height",
    "og:url",
    "og:type",
    "og:determiner",
    "og:title",
    "og:description",
    "og:locale",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
    "twitter:url"] #A list for consistent order
known_nonstd_metas = [
    "og:site_name",
    "twitter:site", #Twitter handle for the website
    "twitter:creator"] #Twitter handle for the creator as a person

_HOST = 'https://fiveham.github.io'

def image_issues(page, metas):
    """Fetch the images mentioned on the page and check that they match criteria
       for them specified on the page or specified in this script.

       :param page: an html document (bs4.BeautifulSoup)."""
    
    
    
    img_issues = []

    # Check the favicon
    favicon = page.find('link', rel='shortcut icon')
    favicon_url = _HOST + favicon['href']
    favicon_response = requests.get(favicon_url)

    #Check that the file exists
    if favicon_response.status_code != 200:
        img_issues.append('Favicon not found (status ' +
                          f'{favicon_response.status_code})')
    else: # the file does exist
        # check that it is square (ideal for favicons)
        i = Image.open(io.BytesIO(favicon_response.content))
        x, y = i.size
        if x != y:
            img_issues.append(f'Favicon not square ({x} wide by {y} high)')

        # check that the Content-Type header for the image response matches the
        # extension on the file name as requested
        filetype = favicon_url[favicon_url.rfind('.')+1:]
        try:
            content_type = favicon_response.headers['Content-Type']
        except KeyError:
            # If there isn't even a Content-Type header, that's weird
            img_issues.apppend('Favicon file response has no Content-Type')
        else:
            file_content_type = 'image/' + filetype.lower()
            if content_type != 'image/' + filetype.lower():
                img_issues.append(
                        'Favicon file response: content-type ' +
                        f'mismatch: {content_type} != {file_content_type}')
    # Done checking favicon
    
    # Check the og and twitter image(s)
    width = int(metas['og:image:width'])
    height = int(metas['og:image:height'])
    for meta in ('og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image'):
        url = metas[meta]
        response = requests.get(url)
        if response.status_code != 200:
            img_issues.append(f'{meta} file not found')
        else:
            i = Image.open(io.BytesIO(response.content))
            w, h = i.size
            if not (w == width and h == height):
                img_issues.append(f'{meta} dimension mismatch: ' +
                                  f'{width}x{height} promised; ' +
                                  f'{w}x{h} received')
    return img_issues

#given a BeautifulSoup of an html page and (preferably) the url of the page,
#return a list of problems with the page's meta tags
#For the meta tags to not have any problems, they just need to provide adequate
#Open Graph and Twitter Card information and meet all appropriate constraints
#for each feature pertaining to og or twitter.
def page_check(page, url=None):
    issues = []
    if not url:
        issues.append("Not even sure what the current URL is.")
    
    metas = {(meta['name']
              if meta.has_attr('name')
              else meta['property']):" ".join(meta['content'].split())
             for meta in page.head('meta')
             if meta.has_attr('content')}
    
    #isses based on actually loading images
    issues.extend(image_issues(page, metas))
    
    links = {}
    for link in page.head('link'):
        if ('rel' in link.attrs and
            'href' in link.attrs and
            any(x in std_links for x in link['rel'])):
            for r in link['rel']:
                links[r] = link['href']
    tags = {tag.name:tag.string
            for tag in (page.head.find(name)
                        for name in std_tags)}
    del page
    
    #Collect canonical urls
    urls = {d[key]
            for d,key in [[metas, 'og:url'],
                          [metas, 'twitter:url'],
                          [links, 'canonical']]
            if key in d}
    #Note whether there are too many canonical urls
    if len(urls) != 1:
        issues.append("Multiple canonical urls: " + str(urls))
    del urls
    
    #Note any missing standard metas to remind me to add them
    for std_meta in std_metas:
        if std_meta not in metas:
            issues.append("Missing std meta "+std_meta)
    
    #Note any missing standard links
    for std_link in std_links:
        if std_link not in links:
            issues.append("Missing std link "+std_link)
    
    #Note any missing standard tags
    for std_tag in std_tags:
        if std_tag not in tags:
            issues.append("Missing std tag "+std_tag)
    
    #Note any weird extra metas
    for meta in sorted(metas):
        if meta not in std_metas:
            issues.append(("Known but nonstandard "
                           if meta in known_nonstd_metas
                           else "Unexpected meta ") + meta)
    
    #Constraint-checks
    
    #og:image:secure_url should use https
    if 'og:image:secure_url' in metas:
        if not metas['og:image:secure_url'].startswith("https:"):
            issues.append("Insecure og:image:secure_url")
    
    #og:image:width and :height should be ints, preferably 1200x630px
    for dim in (('width',1200), ('height',630)):
        key = 'og:image:' + dim[0]
        if key in metas:
            x = None
            try:
                x = int(metas[key])
            except ValueError:
                issues.append(key + " not int")
            else:
                if x != dim[1]:
                    issues.append("%s is %d but %d is best" % (key,x,dim[1]))
    
    #twitter:image has many constraints, but only one can
    #be assessed without loading the file
    if 'twitter:image' in metas:
        ti = metas['twitter:image']
        ext = ti[ti.rfind('.')+1:].upper()
        if ext not in ('JPG','PNG','WEBP','GIF'): #what about JPEG?
            issues.append("twitter:image type not supported")
    
    #twitter image alt text max length 420 characters
    if 'twitter:image:alt' in metas:
        if len(metas['twitter:image:alt']) > 420:
            issues.append("twitter:image:alt longer than 420 chars (%d)" %
                          len(metas['twitter:image:alt']))
    #End of Unary Tests
    
    #Multi-ary Tests:

    #og:image:width and :height should have a ratio between 1 and 2
    if 'og:image:width' in metas and 'og:image:height' in metas:
        x,y = None,None
        try:
            x = int(metas['og:image:width'])
            y = int(metas['og:image:height'])
        except ValueError:
            pass
        else:
            r = x/y
            if r > 2:
                issues.append('og:image:width more than double og:image:height')
            elif r < 1:
                issues.append('O.G. image is taller than it is wide.')
    
    #image:url is the same as image
    tested = {'og:image', 'og:image:url'}
    if all(t in metas for t in tested):
        if metas['og:image'] != metas['og:image:url']:
            issues.append("og:image and og:image:url mismatch")
    
    #img:url and secure_url should be the same except for the s in https
    tested = {'og:image:secure_url', 'og:image:url'}
    if all(t in metas for t in tested):
        if (metas['og:image:secure_url'] !=
            metas['og:image:url'][:4] + 's' + metas['og:image:url'][4:]):
            issues.append("og:image url/secure_url mismatch")
    
    #the file extension for image/url/secure_url corresponds to og:img:type
    tested = {'og:image:type'}
    if all(t in metas for t in tested):
        t = metas['og:image:type'][len('image/'):]
        for thing in ('',':url',':secure_url'):
            thing = 'og:image' + thing
            if thing not in metas:
                continue
            m = metas[thing]
            if t.lower() != m[m.rfind('.')+1:].lower():
                issues.append("og:image:type mismatch with %s extension"%thing)
    
    #og:image and twitter:image need alt text
    for thing in ('og','twitter'):
        thing = thing + ":image"
        if thing in metas and thing+":alt" not in metas:
            issues.append("Need alt text to go with that "+thing)
    
    #twitter:description should fit inside a tweet along with the url
    if 'twitter:description' in metas:
        d = metas['twitter:description']
        if len(d) > 280:
            issues.append("twitter:description is longer than a tweet "+
                          f"({len(d)} > 280)")
        if url:
            if len(d) + 1 + len(url) > 280:
                issues.append(
                    "twitter:description and url are too long together")
            if len(url) > 280:
                issues.append("url too long to fit in a tweet")
    
    #og:desc == tw:desc and tw:title == og:title
    for thing in ('description','title'):
        tested = {'og:'+thing, 'twitter:'+thing}
        if all(t in metas for t in tested):
            if metas['og:'+thing] != metas['twitter:'+thing]:
                issues.append(thing+" mismatch og/twitter")
    
    #twitter:img should be the same as og:img
    #alt text should be the same if imgs are the same
    if 'twitter:image' in metas:
        if not any(metas['twitter:image'] == metas['og:image'+x]
                   for x in ('',':secure_url')
                   if 'og:image'+x in metas):
            issues.append("Image mismatch og/twitter")
        elif metas['twitter:image:alt'] != metas['og:image:alt']:
            issues.append("Image alt text mismatch og/twitter")
    
    return issues

def pretty_print_issues(issues_by_url, ignore=[]):
    if ignore:
        print("Ignoring these issues:")
        print()
        for i in ignore:
            print(i)
    for issues_for_url in issues_by_url:
        printables = [issue
                      for issue in issues_for_url['issues']
                      if issue not in ignore]
        if printables:
            print('='*60)
            print(issues_for_url['url'])
            print()
            for issue in printables:
                print(issue)
