---
layout: post
title:  "Using JSON Web Tokens for Authentication in CFML"
subtitle: "Example using CF-JWT-Simple"
date:   2016-08-18 21:24:00
tags: [cfml,jwt,coldbox]
categories: [CFML]
disqus: true
---

[JSON Web Tokens (JWT)](https://jwt.io/) are commonly used in single-sign-on solutions. They can also be used to authenticate single-page front-end applications with a back-end API. The benefit is that they are lightweight and can be sent with every request so they are stateless. That means server side sessions are not necessary. This makes scaling an application easier as well.

Awhile back I created a CFML component named [cf-jwt-simple] that creates and verify's JSON Web Tokens. It was a port of a Node.js library to CFML. In this post I will give a example of using it to do authentication to a back-end api.

## Setup and Configuration

First I use [CommandBox] to scaffold a Coldbox application using the [Coldbox REST Template] by following the instructions from the [Ortus Solution's blog post]. 

{% highlight bash %}
box
mkdir MyAPI --cd
coldbox create app skeleton=rest name=MyAPI --installColdBox --installTestBox
{% endhighlight %}

I then start the server with [CommandBox].

{% highlight bash %}
server start --rewritesEnable
{% endhighlight %}

The browser should open and you should see a JSON response with "Welcome to my ColdBox RESTFul Service".

Next use [CommandBox] to install the [cf-jwt-simple] package. 

{% highlight bash %}
install cf-jwt-simple
{% endhighlight %}

[cf-jwt-simple] requires a secret key that is used to signing and verification. I will add the key as a setting in `config/Coldbox.cfc`. Remember to change the secret key to some something more secure than this. Use something random and long as the key should be secure and unique to your application.

**config/Coldbox.cfc**

{% highlight cfscript %}
// custom settings
settings = {
	jwtSecretKey = "mys3cr3tkey"
};
{% endhighlight %}

I will also add a setting the token expiration time.

{% highlight cfscript %}
// custom settings
settings = {
	jwtSecretKey = "mys3cr3tkey",
	/* An access token is valid this many minutes */
	accessTokenExpiration = "30"
};
{% endhighlight %}

I add a wirebox mapping for the JWT in `config/Wirebox.cfc`. This will initialize the JWT library with the secret key that was setup in the previous step. See the [Wirebox Documentation](http://wirebox.ortusbooks.com/content/mapping_dsl/) for more info in setting up bindings.

**config/Wirebox.cfc**

{% highlight cfscript %}
// Map Bindings below
map("jwt").to("cf-jwt-simple.jwt").initWith(getProperty("jwtSecretKey")).asSingleton();
{% endhighlight %}

## Model

Here I will use [CommandBox] to create a new model component named AuthenticationService.cfc 

{% highlight bash %}
coldbox create model name="security/AuthenticationService" properties="jwt:any" accessors=true open=true tests=false
{% endhighlight %}

**models/AuthenticationService.cfc**

I then inject the JWT component into AuthenticationService using wirebox.

{% highlight cfscript %}
property name="jwt" type="any" inject="jwt";
{% endhighlight %}

I also inject the expiration setting. 

{% highlight cfscript %}
property name="tokenExpiration" type="numeric" inject="coldbox:setting:accessTokenExpiration";
{% endhighlight %}

I then implement a method named validateUser that takes a username and password. It should lookup the username and use a password hashing algorithm to check that the hashed password matches the one stored in your database. Secure credential storage and password hashing is out of the scope of this tutorial. Here is a couple good reasources on doing this in CFML.

*  [Secure Password Storage](http://www.learncfinaweek.com/week1/Secure_Password_Storage/) 
*  [Hashing passwords with bcrypt in ColdFusion](http://blog.mxunit.org/2011/02/hashing-passwords-with-bcrypt-in.html?m=1) 


{% highlight cfscript %}
public boolean function validateUser(required string username,required string password) {

	var isValid = false;
	
	/* Implement your user or client authentication here */
	
	return isValid;
}
{% endhighlight %}

Next I create the grantToken method. It will return a fresh JWT with the userid as the subject. First I create a structure named payload that contains three reserved JWT claims. One of the goals of JWT is to be compact so they use three letter designation for the claims. "iss" stands for issuer. It is used to identify who issued the token. The "exp" claim stands for expiration. Here I use the `tokenExpiration` setting to set the expiration timestamp. The "sub" claim stands for subject. I am assigning the userid as the subject but it could be some other data as well. You can also add our own custom claims as well that can be accessed with every request. Be careful not to store any sensitive information unless you plan to use an encrypted JWT. [cf-jwt-simple] does not handle encryption. If you need encryption it may be better to use one of the [Java libraries listed here](https://jwt.io/#libraries). Finally the token is encoded and signed using the HmacSHA512 algorithm. 

{% highlight cfscript %}
public string function grantToken(required string userID) {

	var payload = {
		"iss" = "https://myapi",
		"exp" = dateAdd("n",tokenExpiration,now()),
		"sub" = userID
	};

	/* Encode the data structure as a json web token */
	return jwt.encode(payload,"HS512");
}
{% endhighlight %}

Then I create a method to validate our token when recieved from the client. First I try to decode the token. This will return the payload as a structure. If the signature is invalid it will throw an error which is why it is wrapped in a try-catch block. If the data structure exists we know the token signature was valid. Next I check the expiration to see if it is still within its validity period. 

{% highlight cfscript %}
public boolean function validateToken(required string accessToken) {

	var validToken = false;

	try {
		var data = jwt.decode(accessToken);
		validToken = true;
	}
	catch(any e) { }

	if (structKeyExists(local, "data")) {
		/* Check if token has expired. */
		if (now() > data.exp) {
			validToken = false;
		}
	}
	
	return validToken;
}
{% endhighlight %}

I also add a method to decode the token and return the data encoded within the token

{% highlight cfscript %}
public struct function decodeToken(accessToken) {		
	return jwt.decode(accessToken);
}
{% endhighlight %}

## Handlers

Here I use [CommandBox] to create a new handler component named `Authenticate.cfc`. It will be responsible for handling authentication requests.

{% highlight bash %}
coldbox create handler actions="index" name="Authenticate" views=false integrationTests=false open=true
{% endhighlight %}

I then modify the handler to extend `BaseHandler`. I also restrict the request to the http POST method by setting the `this.allowedMethods` property. Finally I modify the index action to validate the username and password using the authService. It will return an access token if the authentication is successful. I inject the authService into the BaseHandler next so no need to do it here. 

**handlers/Authenticate.cfc**

{% highlight cfscript %}
component extends="BaseHandler" {
	
	// OPTIONAL HANDLER PROPERTIES
	this.prehandler_only 	= "";
	this.prehandler_except 	= "";
	this.posthandler_only 	= "";
	this.posthandler_except = "";
	this.aroundHandler_only = "";
	this.aroundHandler_except = "";		

	// REST Allowed HTTP Methods Ex: this.allowedMethods = 
	this.allowedMethods = {index="POST"};

	/**
	* Get an api access token
	*/
	any function index( event, rc, prc ){

		event.paramValue("username","");
		event.paramValue("password","");

		if (authService.validateUser(rc.username,rc.password)) {
			prc.response.setData({"token" = authService.grantToken(rc.username)});
		}
		else {
			prc.response
				.setError( true )
				.setErrorCode( 401 )
				.addMessage( "User validation failed!" )
				.setStatusCode( 401 )
				.setStatusText( "Unauthorized" );
		}
		
	}
}
{% endhighlight %}

**handlers/BaseHandler.cfc**

Then I modify `handlers/BaseHandler.cfc` and inject the AuthenticationService. 

{% highlight cfscript %}
property name="authService" type="any" inject="security.AuthenticationService";
{% endhighlight %}

Before the action is executed in the `aroundHandler` method I add the following code snippet to check the authentication token for each request. 

{% highlight cfscript %}
/* Do not check authentication for the authenticate handler */
if (event.getCurrentEvent() != "authenticate.index") {
event.paramValue("token","");

/* Extract the token from the authorization header */
if (!len(rc.token) && structKeyExists(getHTTPRequestData().headers, "authorization")) {
	rc.token = listLast(getHTTPRequestData().headers.authorization," ");
}

if (authService.validateToken(rc.token)) {

	/* Validate token and store token data in prc scope */
	prc.token = authService.decodeToken(rc.token);

}
else {
	/* token invalid */
	prc.response
		.setError( true )
		.setErrorCode( 401 )
		.addMessage( "The access token is not valid!" )
		.setStatusCode( 401 )
		.setStatusText( "Unauthorized" );
}

}
// Execute action
if (!prc.response.getError()) {
arguments.targetAction( argumentCollection=args );
}
{% endhighlight %}

Before the authentication code I also add some code to enforce JSON content for POST and PUT methods. It will deserialize the JSON and merge it into the rc scope.

{% highlight cfscript %}
/* Only accept application/json for content body on posts */
if (!prc.response.getError() && event.getHTTPMethod() == "POST" || event.getHTTPMethod() == "PUT") {
	if (event.getHTTPHeader("Content-Type") != "application/json") {
		prc.response
			.setError( true )
			.setErrorCode( 400 )
			.addMessage( "Content-Type application/json is required!" )
			.setStatusCode( 400 )
			.setStatusText( "Bad Request" );
	}

	try {
		structAppend(rc, event.getHTTPContent( json=true ));
	}
	catch(Any e) {
		prc.response
			.setError( true )
			.setErrorCode( 400 )
			.addMessage( "Invalid JSON Format!" )
			.setStatusCode( 400 )
			.setStatusText( "Bad Request" );
	}
}
{% endhighlight %}

## Tests

Last I create some tests to verify that it is working. In [CommandBox] run the following.

{% highlight bash %}
coldbox create bdd name=integration/AuthenticationTests open=true
{% endhighlight %}

Here is the test suite I used verify that it is working.

**tests/specs/integration/AuthenticationTests.cfc**

{% highlight cfscript %}
// all your suites go here.
describe("Authentication Test Suite", function() {

	it( "Requests should return Unauthorized without an access token", function(){

		cfhttp(url="http://#cgi.server_name#:#cgi.server_port#/");

		expect(	cfhttp.status_code ).toBe(401);
		expect(	cfhttp.status_text ).toBe("Unauthorized");
	
	});


	it( "Authenticate should grant an access token with valid credentials", function(){

		var jwt = createObject("cf-jwt-simple.jwt").init("mys3cr3tkey");

		var credentials = {
			"username" = "fakeuser",
			"password" = "mypassword"
		};

		cfhttp(
			url="http://#cgi.server_name#:#cgi.server_port#/authenticate",
			method="post",
			charset="utf-8"
		) {
			cfhttpparam(type="header",name="Content-Type",value="application/json");
			cfhttpparam(type="body",value="#serializeJSON(credentials)#")
		};

		expect(	cfhttp.status_code ).toBe(200);
		expect(	cfhttp.status_text ).toBe("OK");
		var result = deserializeJSON(cfhttp.fileContent);

		expect(	result.error ).toBeFalse();
		expect(	jwt.verify(result.data.token) ).toBe(true);
	
	});

	it( "Request should return OK with valid token", function(){

		var jwt = createObject("cf-jwt-simple.jwt").init("mys3cr3tkey");

		var payload = {
			"iss" = "https://myapi",
			"exp" = dateAdd("n",30,now()),
			"sub" = "fakeuser"
		};

		/* Encode the data structure as a json web token */
		var token = jwt.encode(payload,"HS512");

		cfhttp(url="http://#cgi.server_name#:#cgi.server_port#/") {
			cfhttpparam(type="header",name="Authorization",value="Bearer #token#");
		};

		var result = deserializeJSON(cfhttp.fileContent);

		expect(	cfhttp.status_code ).toBe(200);
		expect(	cfhttp.status_text ).toBe("OK");
		expect(	result.data ).toBe("Welcome to my Coldbox RESTFul SErvice");
	});

});
{% endhighlight %}


[CommandBox]:	https://www.ortussolutions.com/products/commandbox
[cf-jwt-simple]:	https://github.com/jsteinshouer/cf-jwt-simple
[Coldbox REST Template]: https://github.com/coldbox-templates/rest
[Ortus Solution's blog post]: https://www.ortussolutions.com/blog/rest2016-coldbox-rest-template

