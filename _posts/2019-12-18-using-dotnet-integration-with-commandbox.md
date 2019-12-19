---
layout: post
title:  "Using .NET Integration Services with CommandBox"
date:   2019-12-18 09:05:00
disqus: true
tags: [CFML]
excerpt: "CommandBox is a great tool for getting CFML development environments setup very quickly. I work with an application that uses the .NET Integration feature of Coldfusion. I recently needed to change that functionality so I needed to get it working in my development environment to test it."
---

[CommandBox](https://www.ortussolutions.com/products/commandbox) is a great tool for getting CFML development environments setup very quickly. I work with an application that uses the .NET Integration feature of Coldfusion. I recently needed to change that functionality so I needed to get it working in my development environment to test it. This is to document the steps I took to get it working with a CommandBox server in my local development environment.

### Install Coldfusion .NET Integration Services

First you need to download and install the Coldfusion .NET Integration Services standalone installer. I have included a link to the installer for [Coldfusion 2018 here](https://www.adobe.com/support/coldfusion/downloads.html#cf2018serverinstallers). Once it is downloaded run the installer. 

### Add configuration settings

I am using the [commandbox-dotenv](https://www.forgebox.io/view/commandbox-dotenv) and [commandbox-cfconfig](https://cfconfig.ortusbooks.com/) modules to configure my environment.

```
box install commandbox-dotenv
box install commandbox-cfconfig
```
I added these settings to my `.env` file for the .NET Integration. In the traditional installation for Coldfusion 2018 you would find these settings in `<cf home>/lib/neo-dotnet.xml`. The port numbers will be defined in the folder that the .NET Integration Services are installed in a file named `JNBDotNetSide.exe.config`. 

    # .NET Integration Settings
    DOTNET_DIR=C:\\ColdFusion2018DotNetService
    DOTNET_PORT=6095
    DOTNET_CLIENT_PORT=6096

Lucky for me commandbox-cfconfig supports configuring .NET integration in Coldfusion for me. Here is a snippet of my `.cfconfig.json` file.

    "dotNetInstallDir": "${DOTNET_DIR}",
    "dotNetPort": "${DOTNET_PORT}",
    "dotNetClientPort": "${DOTNET_CLIENT_PORT}"

Once you have the .NET Integration Services installed and running you can then restart the server for the new settings to take effect.

    box server restart

### Test it

Here is a script that can be used to test it. It just writes the OS version to the screen using .NET.

```cfscript
<cfscript>
environment = createObject(".NET", "System.Environment");

writeOutput("OS Version: " & environment.Get_OSVersion() );
</cfscript>
```
If it is not working you will likely receive an error message like:

> DotNet Side does not seem to be running.