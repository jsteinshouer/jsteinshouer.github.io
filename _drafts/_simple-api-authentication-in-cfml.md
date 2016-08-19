---
layout: post
title:  "Simple API authentication in CFML"
subtitle: "Example using CF-JWT-Simple and Coldbox REST template for API Authentication"

categories: [CFML]
---

Awhile back I created a library for creating and verifying [JSON Web Tokens (JWT)](https://jwt.io/) in CFML. It was a port of a Node.js library to CFML. In this post I will give a example of using it to do authentication for an API built with the Coldbox framework.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Model Configuration](#model-components)

## Setup and Configuration

First I use [CommandBox] to scaffold a Coldbox application using the [Coldbox REST Template] by following the instructions from the [Ortus Solution's blog post]. 

{% highlight bash %}
box
mkdir MyAPI --cd
coldbox create app skeleton=rest name=MyAPI --installColdBox
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

[cf-jwt-simple] requires a secret key that is used to signing and verification. I will add the key as a setting in **config/Coldbox.cfc**. Remember to change the secret key to some something more secure than this i.e. +yN1i]~ofhD9[:iy(#}z$0r3[32o1TN2{Sn22y}ts,@NqLz199J~2-$y@8cJ as the key should be secure and unique to your application.

{% highlight cfscript %}
// custom settings
settings = {
	jwtSecretKey = "mys3cr3tkey"
};
{% endhighlight %}

I will add a wirebox mapping for the JWT in **config/Wirebox.cfc**. This will initialize the JWT library with the secret key that was setup in the previous step. See the [Wirebox Documentation](http://wirebox.ortusbooks.com/content/mapping_dsl/) for more info in setting up bindings.

{% highlight cfscript %}
// Map Bindings below
map("jwt").to("cf-jwt-simple.jwt").initWith(getProperty("jwtSecretKey")).asSingleton();
{% endhighlight %}

## Client Bean

{% highlight bash %}
coldbox create model name="clients/Client"  properties="clientID:string,clientKey:string,salt:string" accessors=true open=true tests=false
{% endhighlight %}

{% highlight cfscript %}
component accessors="true"{
	
    // Properties
    property name="clientID" type="string";
	property name="clientKey" type="string";
	property name="salt" type="string";
	

    /**
     * Constructor
     */
	Client function init(){
		
		return this;
	}
}
{% endhighlight %}



## Client Service

The client service is a model component that will be responsible for managing api clients and their credentials as a client id and passkey. Another option would be to authenticate using a username and password. 

{% highlight bash %}
coldbox create model name="clients/ClientService" accessors=true open=true tests=false
{% endhighlight %}

In ClientService.cfc I am creating a variable named apiClients. This is a structure that contains client ID and passkey. In a real world solution these would likley be stored securley in a database or other data store. They would also be retrieved using a Data Access Object but for simplicity of this demo I am hard coding them.

It also has a method named getClient that retrieves the client and credentials. Here is the full contents of ClientService.cfc.

{% highlight cfscript %}


{% endhighlight %}


## Authentication Service

Here I will use [CommandBox] to create a new model component named AuthenticationService. 

{% highlight bash %}
coldbox create model name="security/AuthenticationService" properties="clientService:clients.ClientService,jwt:any" accessors=true open=true tests=false
{% endhighlight %}

In **AuthenticationService.cfc** I will inject the JWT component using wirebox.

{% highlight cfscript %}
property name="jwt" type="any" inject="jwt";
{% endhighlight %}

For this tutorial they are simply hard coded in the `config/Coldbox.cfc` settings structure. This could also be a userid and password combination.

{% highlight cfscript %}
// custom settings
settings = {
	secretKey = "mys3cr3tkey",
	apiClients = {
		"myClientID" = "UqB?q0Wh2tx4q75wfNIL#Ll79V~u8F"
	}
};
{% endhighlight %}

{% highlight cfscript %}
property name="apiClients" type="struct" inject="coldbox:setting:apiClients";
{% endhighlight %}


[CommandBox]:	https://www.ortussolutions.com/products/commandbox
[cf-jwt-simple]:	https://github.com/jsteinshouer/cf-jwt-simple
[Coldbox REST Template]: https://github.com/coldbox-templates/rest
[Ortus Solution's blog post]: https://www.ortussolutions.com/blog/rest2016-coldbox-rest-template

