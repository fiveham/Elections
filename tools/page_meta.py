#Given a starting point in a repo on Github, recurse through the repo, checking
#every html file in the repo by calling page_check.
def from_github(start_url, manual_url=None):
    import requests
    from bs4 import BeautifulSoup
    result = []
    if ('.' not in start_url[start_url.rfind("/")+1:] #page represents file
        or start_url.endswith(".html")): #file is not html page
        
        start_resp = requests.get(start_url)
        start_page = BeautifulSoup(start_resp.text, 'html.parser')
        
        if start_url.endswith(".html"): #html file page
            t = start_page.find(lambda tag:(tag.name == 'td' and
                                            'data-line-number' in tag.attrs and
                                            tag['data-line-number'] == '1'))
            table = t.parent.parent
            html_text = table.get_text()
            soup = BeautifulSoup(html_text, 'html.parser')
            issues = page_check(soup, manual_url)
            put_in = {'url':start_url, 'issues':issues}
            result.append(put_in)
        else: #page represents directory
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
    return result

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
    #Note whether there are too many
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
            issues.append("twitter:description is longer than a tweet")
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
