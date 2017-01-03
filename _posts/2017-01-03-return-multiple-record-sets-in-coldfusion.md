---
layout: post
title:  "Return Multiple Record Sets from a Query in Coldfusion"
subtitle: ""
date:   2017-01-03 00:00:00
tags: [cfml,sql server]
disqus: true
---

In Adobe Coldfusion you can only return one record set from using [cfquery](http://cfdocs.org/cfquery) or [queryExecute](http://cfdocs.org/cfquery). If you need to write a stored procedure and use [cfstoredproc](http://cfdocs.org/cfstoredproc) to get back multiple record sets.

### Why is this needed? 

Recently my team has started using [Table-Valued Prameters](https://msdn.microsoft.com/en-us/library/bb675163(v=vs.110).aspx) which is a pre-defined table type in SQL Server that you can pass as a parameter. Here is an example where we use dynamic sql to populate a table-valued prameter and pass it to the stored procedure. 

```cfscript
var sql = createObject("java","java.lang.StringBuffer").init("
	DECLARE @employee_list udt_list_integer;
");

for (var employeeID in arguments.employees) {
	sql.append("INSERT INTO @employee_list VALUES(#employeeID#);");
}

sql.append("
	EXEC spu_my_stored_proc
		@start_date = :startDate,
		@end_date = :endDate,
		@employee_list = @employee_list
");

var results = queryExecute(sql,{
	startDate = {cfsqltype="cf_sql_timestamp",value=arguments.startDate},
	endDate = {cfsqltype="cf_sql_timestamp",value=arguments.endDate}
}, datasource="MyDSN");
```

This works great if your stored procedures only return one record set. However recently we built one that needed to return mutiple result sets. 

I do realize I could also do the dynamic sql inside the stored procedure but I perfer using CFML for this.

### Solution

After spending some time playing with the underlying Coldusion java libraries I was able to come up with a component that would allow me to execute a query and have it return mutiple result sets. I thought I would throw this out there in case this is useful for someone else. 

**Disclaimer: This has only been testing using Adobe Coldfusion 11 and MS SQL Server 2008. Also, currently it does not support all the same features as queryExecute. For example, it doesn't support lists at the moment but that could be added.** 

#### MutliRecordSetQuery.cfc

<script src="https://gist.github.com/jsteinshouer/596397a5e8a527c72831dbd5f07118ff.js"></script>

The previous example would now look like this.

```cfscript
var multiRecordSetQuery = new MultiRecordSetQuery();

var sql = createObject("java","java.lang.StringBuffer").init("
	DECLARE @employee_list udt_list_integer;
");

for (var employeeID in arguments.employees) {
	sql.append("INSERT INTO @employee_list VALUES(#employeeID#);");
}

sql.append("
	EXEC spu_my_stored_proc
		@start_date = :startDate,
		@end_date = :endDate,
		@employee_list = @employee_list
");

var results = multiRecordSetQuery.execute(sql,{
	startDate = {cfsqltype="cf_sql_timestamp",value=arguments.startDate},
	endDate = {cfsqltype="cf_sql_timestamp",value=arguments.endDate}
}, "MyDSN");
```



