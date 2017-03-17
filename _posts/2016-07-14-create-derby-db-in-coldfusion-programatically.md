---
layout: post
title:  "Programatically Create an Apache Derby Database in Adobe Coldfusion"
subtitle: ""
categories: [CFML]
date:   2016-07-14 11:56:01
disqus: true
tags: [CFML,Coldfusion,Derby]
---

With [Lucee] you can add a datasource for the [H2] embedded database and if the database doesnt exist it will be created automatically. This can be handy if you have some automated setup routine for your application.

{% highlight cfscript %}
this.datasources["myDsn"] = {
	  class: 'org.h2.Driver'
	, connectionString: 'jdbc:h2:#getDirectoryFromPath( getCurrentTemplatePath() )#/db/myDatabase;MODE=MSSQLServer'
};
{% endhighlight %}

However, if you want to use an embedded [Apache Derby] database with Adobe Coldfusion the database must exist or it will throw an error. You can use the Java JDBC driver for Apache Derby to create the database if it does not exist. 

{% highlight cfscript %}

//Create a derby database if it does not already exist
if (!fileExists("#getDirectoryFromPath( getCurrentTemplatePath() )#db/myDerbyDatabase/README_DO_NOT_TOUCH_FILES.txt")) {
	//Get the apached derby JDBC class
	var Class = createObject("java","java.lang.Class");
	Class.forName("org.apache.derby.jdbc.EmbeddedDriver");
	// Use the DriverManager to connect
	DriverManager = createObject("java", "java.sql.DriverManager");
	//Path the the database
	var dbLocation = replace(getDirectoryFromPath( getCurrentTemplatePath() ),"\","/","all") & "db/myDerbyDatabase";
	//Connect and pass the create=true parameter
	con = DriverManager.getConnection("jdbc:derby:#dbLocation#;create=true;");
	con.close();
}

//setup CF datasource
this.datasources["myDsn"] = {
	  driver: 'Apache Derby Embedded'
	, database: '#getDirectoryFromPath( getCurrentTemplatePath() )#db/myDerbyDatabase'
};
{% endhighlight %}

This opens a connection with the Apache Derby JDBC driver and passed `create=true` to create the database.


[H2]: http://www.h2database.com/html/main.html
[Lucee]: http://lucee.org/
[Apache Derby]: https://db.apache.org/derby/

