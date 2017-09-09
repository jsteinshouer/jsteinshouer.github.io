---
layout: post
title:  "Refactoring Legacy CFML with Approval Tests: Part I"
subtitle: "How do I know if I broke it"
date:   2017-09-99 11:34:00
disqus: true
tags: [CFML,Testbox,Legacy Code,Refactoring]
---

In my [previous post](/2017/09/08/refactoring-legacy-code-with-approval-tests.html) I discussed the importance of refactoring and a general workflow for using Approval Tests to do it. In this blog series I hope to give some examples of how to do it in CFML.

I created a legacy CFML style To-Do application to use as an example of refactoring CFML using Approval Tests. Feel free to [clone the repo](https://github.com/jsteinshouer/todo-legacy-cfml) and play along at home if you like. 

{% highlight bash %}
git clone https://github.com/jsteinshouer/todo-legacy-cfml.git
{% endhighlight %}


Then run it using CommandBox. Feel free to add a some To Do items.

{% highlight bash %}
box start
{% endhighlight %}

First we need to install [TestBox](https://www.forgebox.io/view/testbox) and the [TestBox-Snaphots](https://www.forgebox.io/view/testbox-snapshots) package so we can take an initial snapshot. 

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

Next we will generate a test suite that will contain our approval tests. You can run the tests by calling the `/tests/runner.cfm` from the browser.

{% highlight bash %}
box coldbox create bdd name="RefactorApproval" open=true directory="tests/specs/approval"
{% endhighlight %}

We then add the snapshot matchers to TestBox that we will use to do the approval tests. To do this we use the `addMatchers` method inside the `beforeAll` method;

{% highlight cfscript %}
// executes before all suites+specs in the run() method
function beforeAll(){
	addMatchers( "testbox-snapshots.SnapshotMatchers" );
}
{% endhighlight %}


Now we can start writing some approval tests to get our initial snapshots. First I will create a test suite named `RefactorApprovalTest` inside the `run()` method. I use the `beforeEach` method to execute a query that inserts some dummy data for testing. This will run prior to each test. It also resets the idenity column on the todo table so the keys will match each time we run the test.

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

For our first approval test I use the `it` method inside my test suite. For the first approval test I include the index page with no parameters and capture the output using `cfsavecontent`. Then use the snapshot matcher to check that the snapshot matches. 

{% highlight cfscript %}
it( "should display a list of to-do items", function(){

	cfsavecontent(variable="content") {
		include '/index.cfm';
	}

	expect(content).toMatchSnapshot();
});
{% endhighlight %}

With legacy code you may not always know what the code is supposed to do so you could also use a generic description like `it("should match previous output with not parameters",...`. 

When you run the test it will fail becuase it does not have a snapshot to compare to. Run the test and include `updateSnapshots=1` in the url query string. Be sure to remove it when you start to refactor or it will create new snapshot each time you run the tests.

I added more tests to cover the following three scenerios.

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

We now have a suite of approval tests that will fail if the output changes. This will allow us to start refactoring the code with confidence. You can view the full test suite [here](https://gist.github.com/jsteinshouer/2d42eda57b50af901b56bb5dc31555f1).






[legacy-code-rocks-podcast]:      https://www.stitcher.com/podcast/corgibytes-2/legacy-code-rocks/e/48729728
[legacy-code-rocks]:     legacycode.rocks
[testbox-snapshots]:	https://www.forgebox.io//view/testbox-snapshots
[llewellyn-falco]: http://llewellynfalco.blogspot.com/
[llewellyn-falco-approval-tests]: http://llewellynfalco.blogspot.com/2008/10/approval-tests.html

### Resources

https://docs.google.com/presentation/d/1OLmYFCI3oKqbm7XgnwJ3m3Ne1QO-a4XMsiH8ZbwDFgA/edit#slide=id.g23b1d68d68_0_107

http://dev.elpete.com/2017/05/09/snapshot-testing-in-testbox/

http://approvaltests.com/

http://blog.thecodewhisperer.com/permalink/surviving-legacy-code-with-golden-master-and-sampling/

http://randycoulman.com/blog/2014/09/30/refactoring-legacy-code/
