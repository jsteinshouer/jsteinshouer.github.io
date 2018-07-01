---
layout: post
title:  "Secure CFML: OWASP TOP 10 2017 A1-Injection"
date:   2018-05-18 13:40:00
disqus: true
excerpt: "In this post, I will focus on the #1 OWASP vulnerability which is Injection and how to prevent it in CFML applications."
tags: [Security,CFML,OWASP]
---

I am working on some training materials for my team on preventing the OWASP Top 10 vulnerabilities when using CFML to write applications. I thought it would be good to try and do some corresponding blog posts to go along with the training.

In this post, I will focus on the #1 OWASP vulnerability which is [Injection](https://www.owasp.org/index.php/Top_10-2017_A1-Injection) and how to prevent it in CFML applications. Injection is when an attacker can use input parameters to inject malicious code to be executed by the application. 

The most common and well-known type of injection vulnerability is SQL Injection but there are many others. If user input is not validated or sanitized it is a possible attack vector for injection.

### SQL Injection

This is a common weakness of data-driven web applications. It occurs when malicious SQL code is injected as an input parameter and then executed on the database. Here is an example of a query in CFML that it vulnerable to SQL injection.

```cfscript
userQuery = queryExecute("
	select 
		p_user,
		first_name,
		last_name,
		email,
		phone,
	from users
	where p_user = #url.userID#
");
```

An attacker could use a query string like this`?userid=1 or 1=1` see all records in a table. Also, someone could delete or modify data. In this example all data from the table named clients could be deleted by passing the url query string `?userid=1;delete from clients` 

#### Prevention

Use query parameterization to prevent these types of attacks. In CFML you can use the [`<cfqueryparam>`](http://cfdocs.org/cfqueryparam) tag to do this. Below is an example of using a query parameter with the [`queryExecute`](http://cfdocs.org/queryExecute) function. 

```cfscript
userQuery = queryExecute("
	select 
		p_user,
		first_name,
		last_name,
		email,
		phone,
	from users
	where p_user = :userID
",{ userID = url.userid });
```

This will throw an error if malicious parameters are passed in.

### ORM Injection

ORM queries are also vulnerable as to injection. Be sure to use sql parameters when filtering and searching in ORM as well.

```cfscript
ORMExecuteQuery("
	FROM accounts  
	WHERE customerID = :customerID
",{
	customerID = url.customerID
}, true);
```

### LDAP Injection

LDAP queries using [`cfldap`](http://cfdocs.org/cfldap) are also vulnerable to SQL injection. Use the built-in ESAPI [`encodeForDN()`](http://cfdocs.org/encodeForDN) method to sanitize parameters used in a cfldap queries like the example below.

<pre>
&lt;cfldap
	server="ServerName"
	port=636
	action="QUERY"
	name="qLDAP"
	secure="CFSSL_BASIC"
	username="mydomain\#ldapUsername#"
	password="#ldapPassword#"
	start="dc=MYDOMAIN,dc=MYTLD"
	attributes="cn,userPrincipalName,title,mail,thumbnailPhoto"
	filter="(sAMAccountName=<b>#encodeForDN(username)#</b>)"&gt;
</pre>

### XML/Xpath Injection

If your application performs searches in XML you can use [`encodeForXPath()`](http://cfdocs.org/encodeForXPath) to sanitize user input.

```cfscript
encodeForXPath("'or 1=1",false)
```

### Operating System (OS) Command Injection

Executing native operating system commands with user input is also vulnerable to attack. See example below. 

```cfscript
cfexecute(
	name="c:\windows\system32\cmd.exe",
	arguments="/c ping #url.host#",
	variable="output",
	timeout="10"
);
```

In this example, an attacker could append as many other OS commands to be executed. For example: 

`?host=localhost %26 echo you have been pwned > badscript.bat %26 badscript.bat` 

This would create a script named badscript.bat then execute it.

#### Prevention

- Avoid using OS commands and use native Java libraries instead when available which should cover most cases.
- Use ESAPI [`encodeForOS()`](https://static.javadoc.io/org.owasp.esapi/esapi/2.0.1/org/owasp/esapi/Encoder.html#encodeForOS(org.owasp.esapi.codecs.Codec,%20java.lang.String)) method to escape special characters
- Use strict validation by only allowing certain words or characters.

The ESAPI method is not available directly in Coldfusion at the time of this writing but you can access it with Java. See example below.

```cfscript
ESAPIEncoder = createObject("java", "org.owasp.esapi.ESAPI").encoder();
WINDOWS_CODEC = createObject("java", "org.owasp.esapi.codecs.WindowsCodec").init();

cfexecute(
	name="c:\windows\system32\cmd.exe",
	arguments="/c ping #ESAPIEncoder.encodeForOS(WINDOWS_CODEC,url.host)#",
	variable="output",
	timeout="10"
);
```

### Code Injection

This is when an attacker can inject language specific code that is then executed by the language interpreter. In CFML this is when `evaluate` or `iif` is used. **Avoid using these operators on untrusted input.**

<!-- 
EXAMPLE OF BAD THINGS
```markup
<cfset key_list = evaluate("key_list_" & url.key_list)>
```

```
?key_list_=xyz&key_list= eq 'abc' or setVariable("session.login_role", "Administrator") eq "Admi nistrator"
```
-->

### Summary

#### Perform proper input validation

- Whitelist validation
- Use functions such as <code>isValid()</code> to validate user input

#### Use a safe API

- SQL Parameters
- [ESAPI Functions (encodeFor*)](https://cfdocs.org/encodefor)

#### Contextually escape user data

- If library is not available use `replace()` or `reReplace()` to remove unwanted characters.

### Resources

- [Top 10-2017 A1-Injection](https://www.owasp.org/index.php/Top_10-2017_A1-Injection)
- [CFML Developer Security Guide](https://www.adobe.com/content/dam/acom/en/products/coldfusion/pdfs/cf11/cfml-developer-security-guide.pdf)
- [Localhost Podcast](https://localhost.fm/2018/05/04/owasp-top-10.html)
- [cfdocs.org](https://cfdocs.org/security)
- [www.petefreitag.com](https://www.petefreitag.com/)