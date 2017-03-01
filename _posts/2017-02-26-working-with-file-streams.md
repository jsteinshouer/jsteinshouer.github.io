---
layout: post
title:  "Working with File Streams in CFML/Java"
subtitle: ""
date:   2017-02-28 19:56:00
tags: [cfml,java,streams]
disqus: true
---

In my previous [blog posts](/tags/#streams) I talked about working with streams in Node.js. I assumed I could do something similar working in CFML by using Java but had never attempted it. At my company we process many different data feeds in various formats. So we sometimes need to read and write some large data files. This can be a very memory intensive task with large data sets. So using streams is usually a more efficient solution. 

### File Input Stream Example

Create a Java File object by passing in the file path of the file to read.

```cfscript
	var inputFile = createObject("java", "java.io.File").init(myInputFilePath);
```

Then create a FileInputStream Java object and pass the File object.

```cfscript
	var inputStream = createObject("java", "java.io.FileInputStream").init(inputFile);
```
I can then use the Java Scanner utility to loop over each line of the file as it becomes available.

```cfscript
var sc = createObject("java", "java.util.Scanner").init(inputStream);
while(sc.hasNextLine()) {
	var line = sc.nextLine();
	/* process line here */

}
```

### File Output Stream Example

Here is a method that reads a file using an input stream and applies a closure to each line and writes the result to a file output stream.

```cfscript
/**
*
* @source.hint file path to the input file
* @destination.hint file path for the output file
* @transform.hint function to process each line of the file
*
*/
function transformFile(
	required string source,
	required string destination,
	required any transform
)
{

	/* Create input stream */
	var inputFile = createObject("java", "java.io.File").init(arguments.source);
	var inputStream = createObject("java", "java.io.FileInputStream").init(inputFile);

	/* Create input stream */
	var sc = createObject("java", "java.util.Scanner").init(inputStream);

	/* Create output stream */
	var outputFile = CreateObject("java", "java.io.File").init(arguments.destination);
	var outputStream = CreateObject("java", "java.io.FileOutputStream").init(outputFile);

	/* Process each line of the input stream */
	while(sc.hasNextLine()) {
		var line = sc.nextLine();
		/* Write results to output stream */
		var newLine = transform(line);
		outputStream.write(charsetDecode( newLine, "utf-8" ));
		outputStream.flush();

	}
	/* Close files and cleanup */
	outputStream.close();
	inputStream.close();
	sc.close();
	outputStream = "";
	inputStream = "";
	inputFile = "";
	outputFile = "";
	sc = "";
}
```

I was able to scrub quotes out of a 300+ MB csv file quickly using this method. I ran out of memory when trying to do it using the cfml fileRead and fileWrite methods.

```cfscript
transformFile(
	source = sourceFilePath,
	destination = destinationFilePath,
	transform = function(line) {
		return replace(arguments.line,"""","","all") & Chr(13) & Chr(10);
	}
);
```

