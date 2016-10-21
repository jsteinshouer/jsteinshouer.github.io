
var themeCookieName = "__theme" ;
var themeCookieExp = 30 ;
//var themeCookieDomain = "jasonsteinshouer.com" ;


var switchTheme = function ( theme ) {
	document.body.className = theme;
    setCookie( themeCookieName, theme, themeCookieExp );
}

var setThemeFromCookie = function() {
  var theme = getCookie();
  if (theme.length) {
    switchTheme( theme );
  }
}

var setCookie = function( name, value, exp, domain ) {
    var str = domain ?
                       ("; domain=" + domain) : '' ;
    document.cookie = name +
                       "=" + encodeURIComponent( value ) +
                       "; max-age=" + 60 * 60 *
                       24 * exp +
                       "; path=/" + str ;
}

var getCookie = function() {
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)__theme\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieValue;
}

setThemeFromCookie();

// window.onload = function() {
// 	setThemeFromCookie();
// }

window.onload = function() {
	document.getElementById("theme-switcher").addEventListener("click", function( event ) {
	    var current = document.body.className;
	    if (current === "solarized") {
	    	switchTheme("default");
	    }
	    else {
	    	switchTheme("solarized");
	    }
	}, false);
}
