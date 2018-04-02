---
layout: post
title:  "Linting Your CFML code with CFLint and Sublime Text Build Systems"
subtitle: ""
date:   2018-03-31 06:35:00
disqus: true
excerpt: "Here is an easy way to run CFLint on files from within ST2 or ST3 using build systems."
tags: [CFML,CFLint,Sublime Text]
---

I know there is a Sublime Text 3 package for CFLint but I am still using ST 2. Here is an easy way to run [CFLint](https://github.com/cflint/CFLint) on files from within ST2 or ST3 using [build systems](http://sublimetext.info/docs/en/reference/build_systems.html). 

A Sublime build system is configured using JSON. Here I am using a [CommandBox CFLint](https://www.forgebox.io/view/commandbox-cflint) module to run CFLint. 

```json
{
	"cmd": ["box.exe", "cflint", "$file_name"],
	"selector": "source.cfscript, text.html.cfm",
	"working_dir": "$file_path",
	"variants": []
}
```

Then save this to a file name `CFLint.sublime-build` in your Sublime Text user package directory. Mine is located here on Windows.

`C:\Users\<username>\AppData\Roaming\Sublime Text 2\Packages\User`

If you go to `Tools > Build System` you can select `Automatic` as your build system. Sublime Text will automatically detect when you are working in a `.cfm` or `.cfc` file and run the command when you press `Ctrl+B`. You can also select CFLint from the menu to explicitly say you want to use it as your build system.

When you press `Ctrl+B` to run it the console will open at the bottom, showing the output from the `cflint` CommandBox command. You can then press `Esc` to close it.

You can also call the CFLint jar directly without using the CommandBox module. Using this `sublime-build` configuration.

```json
{
	"cmd": ["java.exe", "-jar", "C:\\path\\to\\CFLint-1.3.0-all.jar", "-text", "-stdout", "-file", "$file_name"],
	"selector": "source.cfscript, text.html.cfm",
	"working_dir": "$file_path",
	"variants": []
}
```

You can also setup variants for different varations of the command. For example here this configuration has a variant that will run CFLint on all the files in the directory with the file you are working on. To run a variant press `Ctrl+Shift+P` then type `build` and you should see the variants listed. 

```json
{
	"cmd": ["java.exe", "-jar", "C:\\path\\to\\CFLint-1.3.0-all.jar", "-text", "-stdout", "-file", "$file_name"],
	"selector": "source.cfscript, text.html.cfm",
	"working_dir": "$file_path",
	"variants": [
		{
			"name": "CFLint: Current Directory",
			"cmd": [
				"java.exe",
				"-jar",
				"C:\\path\\to\\CFLint-1.3.0-all.jar",
				"-text",
				"-stdout",
				"-folder",
				"$file_path"
			]
		}
	]
}
```