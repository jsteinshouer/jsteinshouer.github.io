---
layout: post
title:  "Refactoring Legacy CFML with Approval Tests: Part III"
subtitle: "How do I know if I broke it"
date:   2017-10-01 21:35:00
disqus: true
tags: [CFML,Testbox,Legacy Code,Refactoring]
---

In [part I](/2017/09/13/refactoring-cfml-with-snapshot-testing-part-I.html) of this blog series we walked through using [TestBox-Snapshots](https://www.forgebox.io//view/testbox-snapshots) to create some approval tests for refactoring a legacy CFML application. Then in [part II](/2017/09/21/refactoring-cfml-with-snapshot-testing-part-II.html) we setup the application up to run under the [ColdBox MVC framework](https://www.ortussolutions.com/products/coldbox). Now we can start refactoring the legacy code using the Model View Controller design pattern and use our Approval test to verify our output is not changing.

#### Layout

Currently all of the logic and display code is contained in a single view named `views/index.cfm`. To start refactoring that lets take out the common html elements and put them into the Coldbox layout. Currently our layout only contains a call to the `renderView` function.

{% highlight markup %}
<cfoutput>#renderView()#</cfoutput>
{% endhighlight %}

First I move everything from line 1 to the `<cfoutput>` tag on line 78 from `views/index.cfm` into our layout by putting it above the `renderView` statement in `layouts/Main.cfm`.

Then run our approval tests to make sure they all still pass. If they fail then see what changed and rever the changes to get back to where the tests pass. 

Next we will move the move the code after the `</cfoutput>` tag on line 24 to the end of the `views/index.cfm` into `layouts/Main.cfm` after the `renderView` statement. Again, run the tests to make sure they still pass. 

The only thing that should be left in the view is the diplay code to list the to-do items and the form include to create new to-do items. Everything else including the logic has been moved into the Layout. 




 