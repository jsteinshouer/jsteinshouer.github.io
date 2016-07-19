---
layout: post
title:  "Processing Large XML Data Feeds With Node.js"
subtitle: "Convert XML to CSV or TSV using Node.js streams"
categories: [javascript]
date:   2016-07-05 11:00:01
tags: [nodejs,streams]
---
 
At work we have a job that process a large data feed that involves consuming a SOAP webservice that returns 150MB+ of data. The job runs in Coldfusion which reads all the data into RAM and depending on how much RAM is available can cause Coldfusion to throw an out of memory error.

We discussed the concept of using streams to do this so that only a small chunk of data is processed at a time rather than loading everything into RAM at once. Rather than trying to use Java we decided it would be easier to use Node.js to handle it. For my first attempt at it I thought I would just try to convert the data into a CSV/TSV format which can easily be imported into our database for further processing.

For this project I installed the request and xml-stream packages from NPM. The [request][request] module is used to make http requests easier to work with. The [xml-stream][xml-stream] module is used to parse through XML as a stream.

{% highlight bash %}
npm install request xml-stream
{% endhighlight %}

First I import the modules I will be using.

{% highlight javascript %}
var request = require('request');
var XmlStream = require('xml-stream');
var fs = require("fs");
{% endhighlight %}

Then I created an object for the request options which includes the url and options to send as a SOAP webservice request.

{% highlight javascript %}
var options = {
  method: 'POST',
  url: 'https://www.yourserver.com/webservice/endpoint,
  headers: {
      'Content-Type': 'text/xml',
      'SOAPAction': 'https://www.yourserver.com/GetSomeData',
      'Content-Length': Buffer.byteLength(soap),
      'charset': 'utf-8'
  },
  body: 'Put your SOAP Request XML here'
};
{% endhighlight %}

I initially tried to stream directly from the http request to xml-stream but has some issues and did not spend much time troubleshooting it. I decided to write the XML to file first then process it.

{% highlight javascript %}
var reqStream = request(options).pipe(fs.createWriteStream("./everything.xml"));
{% endhighlight %}

Here I defined a handler to listen for the event that's called when the create file stream is finished. This is the function that reads the file parses out the XML and writes the data to a tab delimited file.

{% highlight javascript %}
reqStream.on("finish", function() {

	var fields = ['ID','FirstName','LastName','Address','City','State'];

	console.log("download done...");
	console.log("creating csv...");
	var readStream = fs.createReadStream("./everything.xml");
	var xml = new XmlStream(readStream);
	var writeStream = fs.createWriteStream('./everything.txt');
	writeStream.write(fields.join("\t") + "\n");
	xml.on('endElement: GetSomeDataResult', function(item) {
		var line = [];
		fields.forEach(function(field) {
			line.push(item[field]);
		});
		writeStream.write(line.join("\t") + "\n");
	});

	xml.on("end", function() {
		writeStream.end();
		console.log("finished");
	});
});
{% endhighlight %}

Here I define an array that contains a list of fields from the XML data that I will transform into a tab seperated txt file.

{% highlight javascript %}

var fields = ['ID','FirstName','LastName','Address','City','State'];

{% endhighlight %}

Then I create stream to read in the XML file and use it to create a new XmlStream. I also create a stream to write the new TXT file to.

{% highlight javascript %}
var readStream = fs.createReadStream("./everything.xml");
var xml = new XmlStream(readStream);
var writeStream = fs.createWriteStream('./everything.txt');
{% endhighlight %}

This line writes the header row of the txt file.

{% highlight javascript %}
writeStream.write(fields.join("\t") + "\n");
{% endhighlight %}

I then define a handler that is called everytime the XML stream parses an element named GetSomeDataResult. It grabs the data for each field and then writes a line to the txt file.

{% highlight javascript %}
xml.on('endElement: GetSomeDataResult', function(item) {
	var line = [];
	fields.forEach(function(field) {
		line.push(item[field]);
	});
	writeStream.write(line.join("\t") + "\n");
});
{% endhighlight %}

The last part is a handler that is called when the XML stream is finished parsing. It closes the txt file stream.

{% highlight javascript %}
xml.on("end", function() {
	writeStream.end();
	console.log("finished");
});
{% endhighlight %}

Hopefully this approach will scale better than some other methods we have used to process data feeds.

[xml-stream]: 	https://github.com/assistunion/xml-stream
[request]:      https://github.com/request/request




