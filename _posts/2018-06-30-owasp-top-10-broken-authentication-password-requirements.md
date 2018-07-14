---
layout: post
title:  "OWASP TOP 10 2017 A2-Broken Authentication: Password Requirements"
date:   2018-06-30 09:30:00
disqus: true
excerpt: "Continuing the series on the OWASP Top 10 now we look at the #2 OWASP vulnerability which is Broken Authentication"
tags: [Security,OWASP]
---

Continuing the series on the OWASP Top 10 now we look at the #2 OWASP vulnerability which is [Broken Authentication](https://www.owasp.org/index.php/Top_10-2017_A2-Broken_Authentication). One of the things that have been a problem with authentication is weak passwords. In this post, we will look at how best practices for user password creation have changed.

For a long time, it has been considered best practice for applications to implement password complexity rules that require a combination of upper case, lower case, numbers, and special character. Users would end up using a less secure password because these requirements were not user-friendly. These rules made passwords hard for people to remember and easy for computers to guess, as the following [xkcd.com](https://xkcd.com) cartoon illustrates. 

![xkcd.com](https://imgs.xkcd.com/comics/password_strength.png)

## New NIST Password Guidelines

The industry has recognized that current industry practices have problems  when it comes to security. Also, the best practices will continue to evolve and change with time. The National Institute for Standards and Technology (NIST) recently published (June 2017) new recommendations to try to address some of the issues as well as factor in new technology and best practices.

**Length > Complexity**

The old complexity requirements have made it very difficult for people to remember passwords. This encourages people to reuse the same password across all the services they use which is bad for security. The new guidelines say to drop the complexity requirements stick to length requirements. See 

**Password Length**

The new guidelines say to require a minimum of 8 characters. The maximum allowed should be at least 64 characters. This is to support generated passwords from password managers.


**Allow all ASCII and UNICODE characters**

All ASCII and UNICODE characters should be allowed. This includes spaces, emoji, etc.

**Eliminate any other complexity requirements**

Any other complexity requirements should be removed.

**Password Guidance**

Offer guidance to the user on creating a strong passphrase. This includes some examples of what a passphase is and how to create one that is strong and easy for them to remember. There is also mention of using meters to show the user how strong their password is.

**Remove password change requirements**

The new guidelines say that enforcing periodic password changes is not beneficial to online security and should be removed as well.

**Allow copy and paste**

This recommendation is to support password managers as there are seen as a tool that generally makes online security better. 

**Allow users to see passwords**

To make it more user-friendly allow the user to see the password as they are entering it in a registration form.

**Implement a password blacklist**

Dropping the password complexity requirements doesn't mean you should allow weak passwords. The new guidelines prescribe implementing a blacklist of weak passwords that cannot be used. This may also contain passwords that have been leaked from other services that have been hacked.

### Resources

- [Top 10-2017 A2-Broken Authentication - OWASP](https://www.owasp.org/index.php/Top_10-2017_A2-Broken_Authentication)
- [NIST Special Publication 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#memsecret)
- [xkcd: Password Strength](https://xkcd.com/936/)

### Related Posts

- [Implementing a Password Blacklist in CFML](/2018/06/30/implementing-a-password-blacklist.html)