/* ====================================================================== */
/* This script provides easy access to some social-media sharing buttons. */
/* Just ask for the ones you want by name (in lowercase, alphabetic       */
/* characters only) using get_share_button or get_share_buttons, and the  */
/* function will return an <a> tag with all the appropriate attributes.   */
/* If no url is specified, it defaults to document.location.href.         */
/* add_share_button and add_share_buttons are also available to not only  */
/* generate the <a> tags but also append them to a specified DOM element. */
/* ====================================================================== */

function ensure_url(url){
  return url ? url : document.location.href;
}

function add_share_buttons(parent, names, url){
  url = ensure_url(url);
  var btns = get_share_buttons(names, url);
  for(var i=0; i<btns.length; i++){
    parent.appendChild(btns[i]);
  }
}

function add_share_button(parent, name, url){
  parent.appendChild(get_share_button(name, url));
}

function get_share_buttons(names, url){
  url = ensure_url(url);
  return names.map(function(name){return get_share_button(share_buttons[name], url);});
}

function get_share_button(btn, url){
  url = ensure_url(url);
  if(typeof btn === "string"){
    btn = share_buttons[btn];
    if(!btn){
      throw "Button name '" + btn + "' not found";
    }
  }
  
  var a = document.createElement('a');
  
  a.id = 'share-' + btn.name;
  a.rel = 'nofollow';
  a.href = btn.get_href(url);
  a.target = "_blank";

  var ft = btn.forTitle 
      ? btn.forTitle 
      : (btn.name.charAt(0).toUpperCase() + btn.name.slice(1));
  a.title = "Share this map on " + ft;

  var baseStyle = [
    "display: inline-block;",
    "height: 40px;",
    "width: 40px;",
    "margin: 5px;",
    "background-color: gray;",
    "background-repeat: no-repeat;",
    "background-size: contain;",
    "border-radius: 2px;"
  ];
  var newStyle = baseStyle.join(' ');
  if(btn.initStyle){
    newStyle += btn.initStyle;
  }
  a.style = newStyle;
  
  a.style.backgroundColor = btn.bgc;
  a.style.backgroundImage = btn.bgimgs.map(function(x){return "url('" + x + "')"}).join(', ');
  
  return a;
}

var share_buttons = {
  blogger: {
    name:     'blogger',
    bgc:      'rgb(240,106,53)',
    bgimgs:   ['/Elections/images/sociall/Blogger/Blogger.png'],
    get_href: function(url){
      var params = [
        ['u', url],
        ['n', get_meta('og:title')],
        ['t', get_meta('og:description')]
      ];
      return as_url('https://www.blogger.com/blog-this.g', params);
    }
  },
  buffer: {
    name:      'buffer',
    bgc:       'rgb(25,37,52)', 
    initStyle: 'background-size: 65%; background-position: center center;', 
    bgimgs:    ['/Elections/images/social/Buffer/buffer-logo.png'], 
    get_href:  function(url){
      var params = [
        ['text', get_meta('og:description')], //Maybe should be title instead
        ['url',  url]
      ];
      return as_url('https://buffer.com/add', params);
    }
  },
  /*delicious: { //The site was acquired and then discontinued
  *  name:     'delicious',
  *  bgc:      'rgb()',
  *  forTitle: 'del.icio.us', 
  *  bgimgs:   [''],
  *  get_href: function(url){
  *    var params = [
  *      ['','']
  *    ];
  *    return as_url('', params);
  *  }
  *},*/
  diaspora: {
    name:      'diaspora',
    bgc:       'rgb(34,34,34)', 
    forTitle:  'diaspora*', 
    initStyle: 'background-size: 70%; background-position: center center;', 
    bgimgs:    ['/Elections/images/social/diaspora/00e35d93c8dd77363bff3d52908cd44aa71739e7.png'], 
    get_href:  function(url){
      var params = [
        ['title', get_meta('og:title')], //Maybe should be description instead
        ['url',   url]
      ];
      return as_url('https://share.diasporafoundation.org/', params);
    }
  },
  facebook: {
    name:     'facebook',
    bgc:      'rgb(59,87,157)', 
    bgimgs:   ['/Elections/images/social/Facebook/600px-Facebook_logo_square.png'],  
    get_href: function(url){
      var params = [['u', url]];
      return as_url('https://www.facebook.com/sharer/sharer.php', params);
    }
  },
  googleplus: {
    name:     'googleplus',
    bgc:      'rgb(221,78,65)', 
    bgimgs:   ['https://www.gstatic.com/images/icons/gplus-64.png'], 
    forTitle: 'Google+', 
    get_href: function(url){
      var params = [['url', url]];
      return as_url('https://plus.google.com/share', params);
    }
  },
  hackernews: {
    name:     'hackernews',
    bgc:      'rgb(241,102,36)', 
    forTitle: 'Hacker News', 
    bgimgs:   ['/Elections/images/social/HackerNews/hacker-y.png'], 
    get_href: function(url){
      var params = [
        ['u', url],
        ['t', get_meta('og:title')]
      ];
      return as_url('https://news.ycombinator.com/submitlink', params);
    }
  },
  linkedin: {
    name:   'linkedin',
    bgc:    'rgb(10,102,194)', 
    bgimgs: [
      '/Elections/images/social/LinkedIn/In-Blue-72.png', 
      '/Elections/images/social/LinkedIn/linkedin-uncornerer.png'
    ], 
    forTitle: 'LinkedIn',   
    get_href: function(url){
      var params = [
        ['mini',    'true'],
        ['url',     url],
        ['title',   get_meta('og:title')],
        ['summary', get_meta('og:description')],
        ['source',  'fiveham.github.io']
      ];
      return as_url('https://www.linkedin.com/shareArticle', params);
    }
  },
  mix: {
    name:     'mix',
    bgc:      'rgb(244, 129, 44)', 
    bgimgs:   ['/Elections/images/social/Mix/mix-manual.png'], 
    get_href: function(url){
      var params = [['url', url]];
      return as_url('https://mix.com/mixit', params); //Or /add instead of /mixit
    }
  },
  myspace: {
    name:      'myspace',
    bgc:       'rgb(39,39,39)', 
    forTitle:  'MySpace', 
    initStyle: 'background-size: 66.7%; background-position: center center;', 
    bgimgs:    ['/Elections/images/social/MySpace/37c71da0f463cb268b47fb9118992bd9fd9bdc6b.png'],  
    get_href:  function(url){
      var params = [
        ['u', url],
        ['t', get_meta('og:title')],
        ['c', get_meta('og:description')]
      ];
      return as_url('https://myspace.com/post', params);
    }
  },
  pinterest: {
    name:     'pinterest',
    bgc:      'rgb(206,40,44)', 
    bgimgs:   ['/Elections/images/social/Pinterest/icon_64x64.png'],   
    get_href: function(url){
      var params = [
        ['url',         url],
        ['media',       get_meta('og:image:secure_url')],
        ['description', get_meta('og:description')]];
      return as_url('https://pinterest.com/pin/create/button/', params);
    }
  },
  quora: {
    name: 'quora',
    bgc:  'rgb(185,43,39)',
    bgimgs: ['/Elections/images/social/Quora/quora.png'],
    get_href: function(url){
      var params = [
        ['url', url],
        ['title', get_meta('og:title')] // maybe should use og:description instead
      ];
      return as_url('https://www.quora.com/share', params)
    }
  },
  reddit: {
    name:     'reddit',
    bgc:      'rgb(255,69,0)', 
    bgimgs:   ['/Elections/images/social/Reddit/Artboard 1_48.png'], 
    get_href: function(url){
      var params = [
        ['title', get_meta('og:description')], 
        ['url',   url]
      ];
      return as_url('https://www.reddit.com/submit', params);
    }
  },
  skype: {
    name:      'skype',
    bgc:       'rgb(0,175,240)', 
    initStyle: 'background-size: 23px 23px; background-position: center center;', 
    bgimgs:    ['/Elections/images/social/Skype/s_logo.svg'], 
    get_href:  function(url){
      var params = [
        ['title', get_meta('og:title')], //Maybe should be description instead
        ['url',   url]
      ];
      return as_url('https://web.skype.com/share', params);
    }
  },
  tumblr: {
    name:      'tumblr',
    bgc:       'rgb(0,25,53)', 
    bgimgs:    ['/Elections/images/social/Tumblr/Tumblr_Logos_2018.03.06_t Icon White.png'], 
    initStyle: 'background-size: 35.47297%; background-position: center center;', 
    get_href:  function(url){
      var params = [
        ['canonicalUrl', get_meta('og:url')],
        ['url',          url],
        ['posttype',     'link'],
        ['tags',         get_meta('tumblr:tags')],
        ['title',        get_meta('og:title')],      //og:title overrides, followed by og:description
        ['content',      url],                       //content is url for link posts
        ['caption',      get_meta('og:description')] //Your own personal reblogging remarks.
      ];
      var via = get_meta('og:site_name');
      if(via){
        params.push(['show-via', via]);
      }
      return as_url('https://www.tumblr.com/widgets/share/tool', params);
    }
  },
  twitter: {
    name:     'twitter',
    bgc:      'rgb(29,161,242)', 
    bgimgs:   ['/Elections/images/social/Twitter/Twitter_Logo_WhiteOnBlue.png'], 
    get_href: function(url){
      var params = [
        ['text', get_meta('twitter:description')], 
        ['url', url]
      ];
      return as_url('https://twitter.com/intent/tweet/', params);
    }
  },
  wordpress: {
    name:     'wordpress',
    bgc:      'rgb(70,70,70)',
    bgimgs:   ['/Elections/images/social/Wordpress/WordPress_blue_logo.png'],
    forTitle: 'WordPress', 
    get_href: function(url){
      var title = get_meta('og:title');
      var params = [
        ['u', url],
        ['t', title],
        ['s', title]
      ];
      return as_url('https://wordpress.com/wp-admin/press-this.php', params);
    }
  }
};

function get_meta(property){
  var metas = document.getElementsByTagName('meta');
  for(var i = 0; i<metas.length; i++){
    if(metas[i].getAttribute('property') === property){
      return metas[i].getAttribute("content");
    }
  }
  console.log("No meta found with property "+property);
  return '';
}

function for_url(text){
  //Multiple whitespaces into single space
  text = text.split(/(\s+)/).filter(function(e){
    return e.trim().length > 0;
  }).join(' ');
  //Convert problem characters
  var result = encodeURIComponent(text);
  //Revert encodeable friendly characters
  var replacements = [
    ['%20', '+'],
    ['%2C', ','],
    ['%2F', '/'],
    ['%3A', ':']
  ];
  for(var i = 0; i<replacements.length; i++){
    var r = replacements[i];
    result = result.replace(new RegExp(r[0], 'g'), r[1]);
  }
  return result;
}
      
function as_url(base_url, params){
  var result = base_url;
  for(var i = 0; i<params.length; i++){
    var glue = i > 0 ? '&' : '?';
    var pair = params[i];
    result += glue + pair[0] + '=' + for_url(pair[1]);
  }
  return result;
}
