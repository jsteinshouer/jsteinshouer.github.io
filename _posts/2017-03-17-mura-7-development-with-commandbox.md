---
layout: post
title:  "Mura 7 Development with CommandBox"
subtitle: ""
date:   2017-03-17 07:56:00
tags: [CFML,Mura,CommandBox]
disqus: true
---

This is a script I wrote to quickly setup a new [Mura 7](http://www.getmura.com/) development server in [CommandBox](https://www.ortussolutions.com/products/commandbox). It runs on [Lucee](http://lucee.org/) with an embedded H2 database. It uses the new [cfconfig](https://www.forgebox.io/view/commandbox-cfconfig) module to setup the datasource.

<script src="https://gist.github.com/jsteinshouer/7d2c4d7cbd0329a2ea92f9de103678f3.js"></script>

Download and run the script in the directory you want the server setup.

```
wget https://gist.githubusercontent.com/jsteinshouer/7d2c4d7cbd0329a2ea92f9de103678f3/raw/d9ef6a860e0fc6a8e51e2f23cf8cc6cac7bdac1a/Mura7_setup.boxr
```
```
box recipe Mura7_setup.boxr
```

Once you run the script the browser will open and you will need to go through the initial Mura 7 setup form. 

1. Select MySQL as the Database type
2. Enter muradb as the datasource name
3. Click Next
4. You can change the Mura admin username and password here
5. Enter an admin email then click Next
6. You select the option to not have index.cfm in the navigation links if you like
7. Click Submit

You can now start tinkering away on your new Mura 7 server. You can use these commands to start and stop the server.

```
box server stop
```

```
box server start
```
