---
layout: post
title:  "Executing Coldbox Events in Legacy Code"
subtitle: ""
categories: [cfml]
date:   2016-11-08 00:00:00
tags: [cfml,coldbox]
disqus: true
---

A quick tip for future Jason or anyone else who may work with Coldbox and legacy code (not MVC) running side-by-side. I found this well documented in the [Coldbox Documentation](https://coldbox.ortusbooks.com/content/full/event_handlers/executing_events.html) but wanted to post it as a quick reference for myself.

## MyHandler.cfc

Here the action is defined with a widget argument. When running it as a widget it will return the rendered content. Otherwise it is ran as a regular Coldbox request.

```cfscript
component extends="coldbox.system.EventHandler" {
	
	function myEvent(event,rc,prc,widget=false) {
		prc.message = "Test from Coldbox event";
		
		if (arguments.widget) {
			return renderView("main/myView");
		}
		
		event.setView("main/myView");
	}

}
```

## main/myView.cfm

Simple view that just outputs the message.

```markup
<cfoutput>#prc.message#</cfoutput>
```

## legacy.cfm

Now I call the Coldbox event from my legacy code like so.

```markup
<cfoutput>#application.cbController.runEvent(event="MyHandler.myEvent",eventArguments={widget=true})#</cfoutput>
```

### UPDATE: 11/29/2016

I found out that since my legacy code was not running inside a Colbox request that I also needed to populate the Coldbox RequestContext so the event had access to any url or form scope parameters.

```markup
<cfset application.cbController.getRequestService().requestCapture()>
<cfoutput>#application.cbController.runEvent(event="MyHandler.myEvent",eventArguments={widget=true})#</cfoutput>
```