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
  get_share_buttons(names, url).forEach(function(a){
    parent.appendChild(a);
  });
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
    var err = "Button name '" + btn + "' not found";
    btn = share_buttons[btn];
    if(!btn){
      throw err;
    }
  }
  
  var a = document.createElement('a');
  
  a.id = 'share-' + btn.name;
  a.href = btn.get_href(url);
  a.target = "_blank";

  var ft = btn.forTitle 
      ? btn.forTitle 
      : (btn.name.charAt(0).toUpperCase() + btn.name.slice(1));
  a.title = "Share this map on " + ft;

  if(btn.initStyle){
    a.style = btn.initStyle;
  }
  a.style.backgroundColor = btn.bgc;
  a.style.backgroundImage = btn.bgimgs.map(function(x){return "url('" + x + "')"}).join(', ');
  
  return a;
}

var share_buttons = {
  facebook: {
    name:'facebook',
    bgc: 'rgb(59,87,157)', 
    bgimgs: ['/Elections/images/social/Facebook/600px-Facebook_logo_square.png'],  
    get_href:function(url){
      var params = [['u', url]];
      return as_url('https://www.facebook.com/sharer/sharer.php', params);
    }
  },
  twitter: {
    name:'twitter',
    bgc: 'rgb(29,161,242)', 
    bgimgs: ['/Elections/images/social/Twitter/Twitter_Logo_WhiteOnBlue.png'], 
    get_href:function(url){
      var params = [
        ['text', "Testing sharing body text and whatnot"], 
        ['url', url]
      ];
      return as_url('https://twitter.com/intent/tweet/', params);
    }
  },
  reddit: {
    name:'reddit',
    bgc: 'rgb(255,69,0)', 
    bgimgs: ['/Elections/images/social/Reddit/Artboard 1_48.png'], 
    get_href:function(url){
      var params = [
        ['title', 'Testing sharing title text, doo-dah, doo-dah'], 
        ['url', url]
      ];
      return as_url('https://www.reddit.com/submit', params);
    }
  },
  tumblr: {
    name:'tumblr',
    bgc: 'rgb(0,25,53)', 
    bgimgs: ['/Elections/images/social/Tumblr/Tumblr_Logos_2018.03.06_t Icon White.png'], 
    initStyle: "background-size: 35.5% 62.5%; background-position: center center;", 
    get_href:function(url){
      var params = [
        ['canonicalUrl', get_meta('og:url')],
        ['url',          url],
        ['posttype',     'link'],
        ['tags',         'testing,experiment'],
        ['title',        'This is the post title. Expeeeeeerimeeeeent.'],      //og:title overrides, followed by og:description
        ['content',      url],                                                 //content is url for link posts
        ['caption',      "closed captions provided by: ...uh, I don't know."], //Your own personal reblogging remarks.
        ['show-via',     'Sorry_not_via_anything']                             //Not showing up
      ];
      return as_url('https://www.tumblr.com/widgets/share/tool', params);
    }
  },
  pinterest: {
    name:'pinterest',
    bgc: 'rgb(206,40,44)', 
    bgimgs: ['/Elections/images/social/Pinterest/icon_64x64.png'],   
    get_href:function(url){
      var params = [
        ['url',         url],
        ['media',       get_meta('og:image:secure_url')],
        ['description', get_meta('og:description')]];
      return as_url('https://pinterest.com/pin/create/button/', params);
    }
  },
  linkedin: {
    name:'linkedin',
    bgc: 'rgb(10,102,194)', 
    bgimgs: [
      '/Elections/images/social/LinkedIn/In-Blue-72.png', 
      '/Elections/images/social/LinkedIn/linkedin-uncornerer.png'
    ], 
    forTitle: 'LinkedIn',   
    get_href:function(url){
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
  googleplus: {
    name:'googleplus',
    bgc: 'rgb(221,78,65)', 
    bgimgs: ['https://www.gstatic.com/images/icons/gplus-64.png'], 
    forTitle: 'Google+', 
    get_href:function(url){
      var params = [['url', url]];
      return as_url('https://plus.google.com/share', params);
    }
  },
  mix: {
    name:'mix',
    bgc:'rgb(244, 129, 44)', 
    bgimgs: ['/Elections/images/social/Mix/mix-manual.png'], 
    get_href:function(url){
      var params = [['url', url]];
      return as_url('https://mix.com/mixit', params); //Or /add instead of /mixit
    }
  },
  myspace: {
    name:'myspace',
    bgc:'rgb(39,39,39)', 
    forTitle:'MySpace', 
    initStyle: "background-size: 66.7% 40.6%; background-position: center center;", 
    bgimgs:['/Elections/images/social/MySpace/37c71da0f463cb268b47fb9118992bd9fd9bdc6b.png'],  
    get_href:function(url){
      var params = [
        ['u', url],
        ['t', get_meta('og:title')],
        ['c', get_meta('og:description')]
      ];
      return as_url('https://myspace.com/post', params);
    }
  },
  hackernews: {
    name:'hackernews',
    bgc:'rgb(241,102,36)', 
    forTitle:'HackerNews', 
    bgimgs:['/Elections/images/social/HackerNews/hacker-y.png'], 
    get_href:function(url){
      var params = [
        ['u', url],
        ['t', get_meta('og:title')]
      ];
      return as_url('https://news.ycombinator.com/submitlink', params);
    }
  },
  diaspora: {
    name:'diaspora',
    bgc:'rgb(100,100,100)', 
    forTitle:'diaspora*', 
    initStyle: "background-size: 66.7% 66.7%; background-position: center center;", 
    bgimgs:['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAABkklEQVQoUwXBPUhUAQAA4O/de5737qfS89AoEsEhFIciiiYjCAohCNrbWtpLcM1ojaCgVYcGJyGoLcekP4IGQbKUrqQ0z5877873Xt8XDIBQr1I+nsyP0FltLrWStkSGiECPSlib7puOyyESrcbO87+zjf2uTDAgrzpy8mX1YlGmJVOQc2h7pX7jy1pNMKgvP/x+cKJXYNd9mXkNoY7N1fUL241crDbTPxFJpA6dc14olYlUR2sPC3Llof6ZXrFBW5qga1dLQeTE3XJ/rng9DhNjHnnqqg1k7pk3qSvOx9ei/JlQoIxTHoAnYBSh/EgUxIEebyw4645xNLywZktZW5CPuj8TobLAoXFw3Hf/HJPT1F3PNV+3pRKpWTwzh8dIpTpaS7n91Z2FtsQVFXVvLaqrmJLq2H11sBYMqdWGv1ZrbcNCGzitalnBTuPHpT8rYeyomX2ObpYKTQd6RPZsCjX267c/LReERanVb4W5bCw3SipxpGVr6detj+8oCgYQiJRULpemohrd383FvQ9NXRn+A1iPlomQUIqjAAAAAElFTkSuQmCC'], 
    get_href:function(url){
      var params = [
        ['title', get_meta('og:title')],
        ['url',   url]
      ];
      return as_url('https://share.diasporafoundation.org/', params);
    }
  },
  buffer: {
    name:'buffer',
    bgc:'rgb(25,37,52)', 
    initStyle: "background-size: 66.7% 66.7%; background-position: center center;", 
    bgimgs:['/Elections/images/social/Buffer/buffer-logo.png'], 
    get_href:function(url){
      var params = [
        ['text', get_meta('og:title')], //Maybe should be description instead
        ['url',   url]
      ];
      return as_url('https://buffer.com/add', params);
    }
  },
  skype: {
    name:'skype',
    bgc:'rgb(0,175,240)', 
    initStyle: "background-size: 23px 23px; background-position: center center;", 
    bgimgs:['/Elections/images/social/Skype/s_logo.svg'], 
    get_href:function(url){
      var params = [
        ['title', get_meta('og:title')], //Maybe should be description instead
        ['url',   url]
      ];
      return as_url('https://web.skype.com/share', params);
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
