---
layout: post
title:  "Example of Using a CommandBox Task Runner to Run CFLint"
subtitle: ""
date:   2017-12-27 20:35:00
disqus: true
tags: [CFML]
---

I have been looking into [CFLint](https://github.com/cflint/CFLint) as a tool to help improve the quality of our teams CFML. Also, to aid in code reviews. 

I created this [gist](https://gist.github.com/jsteinshouer/9e3556e5940f86388f9ecd91d129b78d) that is a [CommandBox Task Runner](https://commandbox.ortusbooks.com/content/task-runners.html) that takes a glob pattern and runs CFLint on any files that match.

```bash
box task run taskFile=cflint pattern=**.cfc
```

By default, it will display the results in the console.

![Console Output](https://www.dropbox.com/s/q9b10tbxe3ggrp0/cflint-console-output.PNG?dl=1)

It can also generate an HTML report based on Bootstrap. See example below.

```bash
box task run taskFile=cflint pattern=**.cfc --html
```

![HTML Report](https://www.dropbox.com/s/thq7ftu33ebaov6/cflint-html-results.PNG?dl=1)

You could also use it as part of an automatic build process. This will code will cause CommandBox to return an exit code of 1 if an error exists and thus cause build tools such as Jenkins to fail.

```cfscript
if ( reportData.errorExists ) {
	/* Flush any output to the console */
	print.line().toConsole();
	error("Please fix errors found by CFLint!");
}
```

CFLint can already output results to html and the console out of the box. The main reason I wrote this is that I wanted to only run CFLint on files that changed in an SVN development branch. Here is [a version](https://gist.github.com/jsteinshouer/8a21d1445a4f24be050946bb85c86136) that uses SVN to get files for linting. It could be adapted for GIT as well which I may attempt at some point. 