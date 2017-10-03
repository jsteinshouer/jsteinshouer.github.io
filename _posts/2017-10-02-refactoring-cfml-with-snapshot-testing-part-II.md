---
layout: post
title:  "Refactoring Legacy CFML with Approval Tests: Part II"
subtitle: "How do I know if I broke it"
date:   2017-10-02 20:35:00
disqus: true
tags: [CFML,Testbox,Legacy Code,Refactoring]
---

In [part I](/2017/09/13/refactoring-cfml-with-snapshot-testing-part-I.html) of this blog series we walked through using [TestBox-Snapshots](https://www.forgebox.io//view/testbox-snapshots) to create some approval tests for refactoring a legacy CFML application. In this post, we will focus on setting our application up to use the [ColdBox MVC framework](https://www.ortussolutions.com/products/coldbox). Once it is setup we can start using the MVC pattern to separate concerns. We start by installing ColdBox.

#### Setup

{% highlight bash %}
box install coldbox
{% endhighlight %}

Now we will use the ColdBox scaffolding tools to get the ColdBox simple application template. I don't want to overwrite my existing application so I install it in a temporary directory so that I can get the things I want from it.

{% highlight bash %}
box mkdir .tmp
box coldbox create app directory=".tmp" name="ToDo" skeleton="simple" init=false installColdBox=false
{% endhighlight %}

#### Application.cfc

First I will replace my existing `Application.cfc` file with the one from the template.

{% highlight bash %}
box mv Application.cfc _Application.cfc
box cp .tmp/Application.cfc Application.cfc
{% endhighlight %}

We then add our datasource and table initialization query back into it. [Here is a link](https://gist.github.com/jsteinshouer/784e8ab5a6ef8bd8dcc99816fa55057f) to the full modified `Application.cfc` file.

#### Layouts

We will then create an empty default layout for our application.

{% highlight bash %}
box mkdir layouts
box touch layouts/Main.cfm --open
{% endhighlight %}

Then add the following content to `layouts/Main.cfm`.

{% highlight markup %}
<cfoutput>#renderView()#</cfoutput>
{% endhighlight %}


#### Views

Now we create our views directory and move our `index.cfm` file into it. We do this because ColdBox has implicit views which do not require a handler. Eventually we will refactor this but for now, we will just move it. We also move the includes file into our views directory as well. In a real life legacy application, you should be able to move your entire app under views to get it up and running. See [this blog post](https://compknowhow.com/blog/legacy-app-meet-coldbox) for more details.

{% highlight bash %}
box mkdir views
box mv index.cfm views/index.cfm
box mkdir views/includes
box cp includes/form.cfm views/includes/form.cfm
{% endhighlight %}

Once we move our application files into views we can copy the empty `index.cfm` file into the site root.

{% highlight bash %}
box cp .tmp/index.cfm index.cfm
{% endhighlight %}

#### Config

We will copy the entire config directory from the ColdBox template.

{% highlight bash %}
box cp .tmp/config config
{% endhighlight %}

#### Handlers

To start we will not need handlers but the template comes with some application lifecycle handlers so we will copy that directory as well.

{% highlight bash %}
box cp .tmp/handlers handlers
{% endhighlight %}

We should no longer need the ColdBox template that we downloaded to a temp directory so we can delete it.

{% highlight bash %}
box rm .tmp --force --recurse
{% endhighlight %}

#### Routing

In order to make our URLs behave the same, we need using URL rewrites and setup some application routes. So we will need to start the CommandBox server with rewrites enabled.

{% highlight bash %}
box server start rewritesEnable=true
{% endhighlight %}

In `config/Routes.cfm` we add a route for the default page. According to [this blog post](https://compknowhow.com/blog/legacy-app-meet-coldbox), you will need a route for any page in your application's root but anything in a sub-directory should work using the implicit views.

{% highlight cfscript %}
// Your Application Routes
addRoute(pattern="/", view="index");
addRoute(pattern=":handler/:action?");
{% endhighlight %}

#### Approval Tests

The application should now be running under ColdBox. You will notice however that if you run the approval tests now they fail. This is because our approval tests are not setup to use ColdBox. We could change our test to use `cfhttp` to get the page content or we can change our test so it is a ColdBox integration test. 

To convert our test to a ColdBox integration test we need to do a few things. First, our test needs to inherit from the ColdBox `BaseTestCase` instead of the TestBox `BaseSpec`. 

So this...

{% highlight cfscript %}
component extends="testbox.system.BaseSpec"{
{% endhighlight %} 

Should change to this.

{% highlight cfscript %}
component extends="coldbox.system.testing.BaseTestCase" appMapping="/root" {
{% endhighlight %} 

We also need to call `super.beforeAll()` and `super.afterAll()` like so.

{% highlight cfscript %}
// executes before all suites+specs in the run() method
function beforeAll(){
	super.beforeAll();
	addMatchers( "testbox-snapshots.SnapshotMatchers" );
}

// executes after all suites+specs in the run() method
function afterAll(){
	super.afterAll();
}
{% endhighlight %}

Then at the start of our `beforeEach` method we need to call `setup()` to setup the ColdBox request for each test.

{% highlight cfscript %}
beforeEach(function( currentSpec ){

	setup();
	...
{% endhighlight %}

In our tests, instead of using `cfinclude` we will use the `execute` method to execute the ColdBox event and get the rendered HTML from that.

{% highlight cfscript %}
it( "should display a list of to-do items", function(){

	var event = execute( event="index", renderResults=true );

	content = event.getValue( name="cbox_rendered_content" );

	expect(content).toMatchSnapshot();
});
{% endhighlight %}

After converted all the tests they should pass when ran. [Here](https://gist.github.com/jsteinshouer/25e1c988d9e5851c2191ee219593ca5e) is the fully coverted test suite.

Now that our application is running with Coldbox we can start using the MVC design pattern to refactor our application and continue to use the approval tests as a guide.