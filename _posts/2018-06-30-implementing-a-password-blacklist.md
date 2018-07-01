---
layout: post
title:  "Implementing a Password Blacklist in CFML"
date:   2018-06-30 10:17:00
disqus: true
excerpt: "Continuing the series on the OWASP Top 10 now we look at the #2 OWASP vulnerability which is Broken Authentication"
tags: [Security,CFML,OWASP]
---

As mentioned in [OWASP TOP 10 2017 A2-Broken Authentication: Password Requirements](/2018/06/30/owasp-top-10-broken-authentication-password-requirements.html) the new guidelines for password requirements say to drop all the complexity rules and to create a blacklist of weak, common, and compromised passwords that cannot be used when a user creates a new account. Here is a quick example of one way this could be implemented in CFML. 

This [Github Repository](https://github.com/danielmiessler/SecLists/tree/master/Passwords) contains many lists of weak, common, and leaked passwords. The [OWASP Broken Authentication article](https://www.owasp.org/index.php/Top_10-2017_A2-Broken_Authentication) refers to it as a source for creating such a list. I chose the following list of 10,000 common passwords for this example.

[GitHub · danielmiessler/SecLists/Common-Credentials/10k-most-common.txt](https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt)

I started off by creating a component named `PasswordService.cfc` that takes the file path to the file downloaded from Github. In this example, I am using Wirebox to inject a setting that contains the file path. The file is read and the contents are loaded into an array. You could also load these into a database table and load them in from there.

```cfscript
component singleton {

	property name="PASSWORD_BLACKLIST";
	property name="wirebox" inject="wirebox";

	/**
	 * Constructor
	 * 
	 * @passwordBlacklistFile.inject coldbox:setting:PASSWORD_BLACKLIST_FILE
	 */ 
	public PasswordService function init( required string passwordBlacklistFile ) {

		PASSWORD_BLACKLIST = listToArray( 
			fileRead( arguments.passwordBlacklistFile ), 
			chr(10) & chr(13) 
		);

		return this;
	}
	
```

I then created a method to check a password against the blacklist. 

```cfscript
public boolean function isBlacklisted( required string password ) {

	return PASSWORD_BLACKLIST.find( lcase( arguments.password ) );
}
```

I can then use that in my `validatePassword` method.

```cfscript
public models.util.ValidationResult function validatePassword( required string password ) {

	var validationResult = wirebox.getInstance("util.ValidationResult");

	/* Must be at least 8 characters long */
	if ( arguments.password.len() < 8 ) {
		validationResult.addError("The password must be at least 8 characters.");
	}

	/* Not on the blacklist */
	if ( isBlacklisted( arguments.password ) ) {
		validationResult.addError("Your password is not allowed because it is too common!");
	}

	return validationResult;
}
```