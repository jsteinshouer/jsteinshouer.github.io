---
layout: post
title:  "Refactoring Legacy Code with Approval Tests"
subtitle: "How do I know if I broke it"
date:   2017-09-09 10:26:01
disqus: true
tags: [CFML,Testbox,Legacy Code,Refactoring]
---

[Legacycode.rocks][legacy-code-rocks] is a great resource for anyone working with legacy code. Aside from a ton of useful information, it is also motivational because they really try to take away the stigma of working with legacy code and frame it as something to really be proud of. If you work with legacy code, you know it can be frustrating and difficult however it can also be very satisfying to figure out how a piece of code works and be able to improve it.

One point they make, that is often overlooked, is that with a legacy application it is being maintained because it has proved to be valuable. The challenge of the maintainer is to improve it and keep it in a state where it continues to provide value.

I was listening to an [episode][legacy-code-rocks-podcast] of the [legacycode.rocks][legacy-code-rocks] podcast with guest [Llewellyn Falco][llewellyn-falco]. In that episode they were talking about [Approval Tests][llewellyn-falco-approval-tests]. 

This particular episode really got me thinking about how I am currently developing. Refactoring should be something that we do frequently as programmers. I realized that this I am not doing this a much as I should for a few reasons that I will get into.

### Why Should I Refactor?

A legacy application is generally defined as a system with little or no tests. It is usually something that was built by someone else that has slowly evolved over a long period of time. Chances are that it may have a considerable amount of technical debt associated with it. If we are not actively refactoring our code to make the code better then over time it will degrade and eventually get to a point where making changes to the application become very difficult and expensive.

### What is Refactoring?

I think that sometimes refactoring can get confused for rewriting. Refactoring is for cleaning up the code to make it easier to understand and maintain but it should not change its behavior.

There will be times that you need to change some code that was written by someone else or maybe yourself. You usually need to understand what the code is currently doing before modifying it. The harder the code is to understand the longer it will take to make those changes. An effective technique to try to understand the code may be to first refactor it or at least part of it.

>Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior. --Refactoring.com (Martin Fowler)

I think that part of the reason for that fear is that I was looking at the amount of code in the application I work on. But refactoring is something that should be done in small increments. It does not seem as daunting of a task if done it small pieces over time. 

### Why I Don’t Refactor

One reason may be that we feel like we don’t have enough time. I won’t get too deep into this but probably boils down to poor planning or organizational issues. For legacy systems, it is important to allocate time for this.

Another reason is that the code is complicated and we don’t understand it. I already touched on this. We can use refactoring as a technique to learn what the code is doing and to help our team and future self to better understand it.

The next reason is that the code is fragile and has no test coverage. So we fear that we may break it and not know if it is broken. This is a legitimate fear because if you break the system from refactoring then eventually you will be told to stop doing it.

### Approval Tests Can Help

The concept of approval tests seems simple and obvious but it had never occurred to me. It can help to give me confidence that the output has not changed when refactoring a legacy application.

The general concept is that you take a snapshot of the output of the code you are refactoring then verify that the output does not change.

#### Workflow For Using It

##### Take a Snapshot
This could be serialized data such as JSON, HTML, or even a screenshot.

##### Refactor
Refactor in small increments so it is easy to rollback.

##### Compare Snapshots
Take another snapshot and if the output is the same you can be fairly confident that the behavior has not changed. If they don’t match, rollback and figure out what went wrong.

##### Repeat
Repeat the process in small increments.

I started looking into ways to do this in CFML and found that [Eric Peterson](http://dev.elpete.com/) already built a [TestBox matcher](https://www.forgebox.io//view/testbox-snapshots) that does this very same thing. Here is his [blog post](http://dev.elpete.com/2017/05/09/snapshot-testing-in-testbox/) introducing it and how to use it. In an upcoming series, I will show examples of refactoring legacy CFML code using the TestBox-Snapshots matcher for approval tests.

Eric's blog refers to Snapshot testing. I have also seen it referred to Golden Master but the concept seems to be the same to me. Here are some resources I used while looking into this subject. I also gave a talk to my team at work on this subject. [Here are the slides](https://www.dropbox.com/s/ob4bulgl64125aq/Refactoring%20with%20Approval%20Tests.pdf?dl=0) if you are interested.


### Resources

- [Snapshot Testing - dev.elpete.com](http://dev.elpete.com/2017/05/09/snapshot-testing-in-testbox/)
- [Approval Tests](http://approvaltests.com/)
- [Surviving Legacy Code - blog.thecodewhisperer.com](http://blog.thecodewhisperer.com/permalink/surviving-legacy-code-with-golden-master-and-sampling/)
- [Refacoring Legacy Code - randycoulman.com](http://randycoulman.com/blog/2014/09/30/refactoring-legacy-code/)

[legacy-code-rocks-podcast]:      https://www.stitcher.com/podcast/corgibytes-2/legacy-code-rocks/e/48729728
[legacy-code-rocks]:     http://legacycode.rocks
[testbox-snapshots]:	https://www.forgebox.io//view/testbox-snapshots
[llewellyn-falco]: http://llewellynfalco.blogspot.com/
[llewellyn-falco-approval-tests]: http://llewellynfalco.blogspot.com/2008/10/approval-tests.html
