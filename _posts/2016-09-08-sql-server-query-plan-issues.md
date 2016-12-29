---
layout: post
title:  "Performance Issues with SQL Server Query Plans"
subtitle: ""
date:   2016-09-08 15:34:01
categories: [tools]
tags: [sql,sql server]
disqus: true
---

I was recently tasked with building a complex report. I wrote a SQL Server stored procedure to return the data. It accepts 5 parameters and has complicated logic. It seemed to run fine at first but I started noticing performance issues when certain parameters were used. The issues seemed to go away if the sql service was restarted. Also, when I executed it in the SQL Server Management Studio it ran fine but would never finish when the same stored procedure was executed from the application. 

After some googling I came across [this article](http://www.sommarskog.se/query-plan-mysteries.html) that described the problem I was having. I knew that SQL Server cached the query execution plans but I did not consider that the plan maybe optimized for one set of parameters and not for another set. 

My quick solution was to use `sp_recompile` to clear the cached query execution plan for the stored procedure before each execution.

{% highlight sql %}
SP_RECOMPILE spu_my_complex_report;

EXEC spu_my_complex_report @param1, @param2,...;
{% endhighlight %}

This solves the problem but a possibly better solution may be to compare execution plans using the different parameters and write a seperate stored procedure for the combination that is causing the execution plan to differ from the others. This may cause duplication of some of the logic but would probably increase the efficiency of the report. 

## UPDATE: 

Using `sp_recompile` was throwing the folling error when more than one instance of the report was ran at the same time:

{% highlight bash %}
Msg 2801, The definition of object 'spu_my_complex_report' has changed since it was compiled.
{% endhighlight %}

So I went ended up spliting the logic into two different stored procedures which was a better solution anyway. It seems to be working well.

