---
layout: post
title:  "Parsing XML with Node.js Streams Part II"
date:   2016-07-18 23:56:45
categories: [javascript]
tags: [nodejs,streams]
---

In my previous post [Processing Large XML Data Feeds With Node.js](/javascript/2016/07/05/xml-to-csv-using-node-streams.html) I gave an example of calling a SOAP webservice then writing the response XML to file. I then used the [xml-stream] module to parse through the xml and create a CSV/TSV file. At the time I originally tried streaming directly from the http request to [xml-stream] but was getting an error.

I have been going through the [stream-adventure] workshop from [NodeSchool.io]. I recomend it as a great introduction into using streams in Node.js. I feel I now have a better understanding of streams in Node.js. I thought I would take another crack at piping the http response directly to [xml-stream]. As it turns out it was much simpler than I thought. Since the the request module itself returns a node stream, all I had to do was pass it into the [xml-stream] module. It worked great and was much faster than my previous program. See the full example below. 

{% highlight javascript %}
var request = require('request');
var XmlStream = require('xml-stream');
var fs = require("fs");

console.log("Sending Request...");

var fields = ['ID','FirstName','LastName','Address','City','State'];

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

var xml = new XmlStream(request(options));
var writeStream = fs.createWriteStream('./data.txt');
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
{% endhighlight %}


[NodeSchool.io]: http://nodeschool.io/
[stream-adventure]: https://github.com/substack/stream-adventure
[xml-stream]: 	https://github.com/assistunion/xml-stream