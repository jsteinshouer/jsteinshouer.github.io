---
layout: post
title:  "Refactoring Legacy CFML with Approval Tests: Part I"
subtitle: "How do I know if I broke it"
date:   2017-09-20 19:55:00
disqus: true
tags: [CFML,Testbox,Legacy Code,Refactoring]
---

In my [previous post](/2017/09/09/refactoring-legacy-code-with-approval-tests.html), I discussed the importance of refactoring and a general workflow for using Approval Tests to be sure your output is not changing. 

In this blog series, I hope to give some examples of how to use the [TestBox-Snapshots](https://www.forgebox.io//view/testbox-snapshots) package for refactoring legacy CFML. The first post will walk you through installing the package and setting up a test suite to capture an initial snapshot.

I created a legacy CFML style To-Do application to use as an example of refactoring CFML using Approval Tests. Feel free to [clone the repo](https://github.com/jsteinshouer/todo-legacy-cfml) and play along at home if you like. 

{% highlight bash %}
git clone https://github.com/jsteinshouer/todo-legacy-cfml.git
{% endhighlight %}

Then you run the application using CommandBox.

{% highlight bash %}
box start
{% endhighlight %}

First, we need to install [TestBox](https://www.forgebox.io/view/testbox) and the [TestBox-Snaphots](https://www.forgebox.io/view/testbox-snapshots) package so we can take an initial snapshot. 

{% highlight bash %}
box install testbox
box install testbox-snapshots
{% endhighlight %}

Now we copy the TestBox test harness and create the specs folder for my tests.

{% highlight bash %}
box cp ./testbox/test-harness ./tests
box mkdir ./tests/specs
{% endhighlight %}

I will create a folder in my specs directory specifically for my approval tests.

{% highlight bash %}
box mkdir ./tests/specs/approval
{% endhighlight %}

Next, we will generate a test suite that will contain our approval tests. You can run the tests by calling the `/tests/runner.cfm` from the browser.

{% highlight bash %}
box coldbox create bdd name="RefactorApproval" open=true directory="tests/specs/approval"
{% endhighlight %}

We then add the snapshot matchers to TestBox so we can use it for our Approval Tests. To do this we use the `addMatchers` method inside the `beforeAll` method;

{% highlight cfscript %}
// executes before all suites+specs in the run() method
function beforeAll(){
	addMatchers( "testbox-snapshots.SnapshotMatchers" );
}
{% endhighlight %}


Now we can start writing some approval tests to get our initial snapshots. First I will create a test suite named `RefactorApprovalTest` inside the `run()` method. I use the `beforeEach` method to execute a query that inserts some dummy data for testing. This will run prior to each test. It also resets the identity column on the todo table so the keys will match each time we run the test.

{% highlight cfscript %}
describe( "RefactorApprovalTest", function(){

	beforeEach(function( currentSpec ){
		content = "";

		/* Add some data for our tests */
		queryExecute("
			delete from todo;

			--reset the identity so the keys match
			ALTER TABLE todo ALTER COLUMN p_todo_id RESTART WITH 1;

			insert into todo(p_todo_id,description,completed_date)
			values
				(1,'Do This',NULL),
				(2,'And this',NULL),
				(3,'This is done','2017-09-01 01:45:00')
		");
	});
	
});
{% endhighlight %}

For our first approval test, I use the `it()` method inside my test suite. I include the index page with no parameters and capture the output using `cfsavecontent`. Then use the snapshot matcher to check that the snapshot matches. 

{% highlight cfscript %}
it( "should display a list of to-do items", function(){

	cfsavecontent(variable="content") {
		include '/index.cfm';
	}

	expect(content).toMatchSnapshot();
});
{% endhighlight %}

With legacy code you may not always know what the code is supposed to do so you could also use a generic description such as `it("should match previous output with not parameters",...`. 

When you run the test it will fail because it does not have a snapshot to compare to. Run the test and include `updateSnapshots=1` in the URL query string. Be sure to remove it when you start to refactor or it will create a new snapshot each time you run the tests.

I added more tests to cover the following three scenarios.

1. Adding a new to-do

{% highlight cfscript %}
it( "should add a new to-do item", function(){

	url.action = "add";
	form.description = "another thing to do";

	cfsavecontent(variable="content") {
		include '/index.cfm';
	}

	expect(content).toMatchSnapshot();
});
{% endhighlight %}

2. Completing to-do items

{% highlight cfscript %}
it( "should complete a to-do item", function(){

	url.action = "complete-todo";
	form.id = 1;

	cfsavecontent(variable="content") {
		include '/index.cfm';
	}

	expect(content).toMatchSnapshot();
});
{% endhighlight %}

3. View completed to-do items

{% highlight cfscript %}
it( "should display a list of completed to-do items", function(){

	url.action = "completed";

	cfsavecontent(variable="content") {
		include '/index.cfm';
	}

	expect(content).toMatchSnapshot();
});
{% endhighlight %}

We now have a suite of approval tests that will fail if the output changes. This will allow us to start refactoring the code with confidence. You can view the full test suite [here](https://gist.github.com/jsteinshouer/2d42eda57b50af901b56bb5dc31555f1). The next post we will start to refactor the code and use the test suite to verify that things have not changed.