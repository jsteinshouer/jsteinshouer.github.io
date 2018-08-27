---
layout: post
title:  "Using Vue CLI 3 with a Coldbox Application"
date:   2018-08-27 16:58:00
disqus: true
excerpt: "The Vue CLI is a great tool for developing Vue.js applications but I wanted to see how it could be integrated into an application with a CFML/Coldbox back-end."
tags: [Coldbox,CFML,Vue.js]
---

### TL;DR

The Vue CLI is a great tool for developing Vue.js applications but I wanted to see how it could be integrated into an application with a CFML/Coldbox back-end. I think the key to doing this is to use the [Webpack Development Server](#webpack-development-server) `proxy` setting to proxy requests to the CFML back-end application. I also adjusted the front-end and back-end routing to work well together. I created this [Github repository](https://github.com/jsteinshouer/guitar-tabs-vue) that contains a simple Vue.js Single-Page Application (SPA) with a Coldbox back-end. 

### Introduction

I recently took this [Udemy Course](https://www.udemy.com/vuejs-2-the-complete-guide/) on Vue.js. I learned a lot from the course and would recommend it to anyone interested in learning Vue.js. As the course progressed into more advanced exercises and projects the instructor had me use the Vue CLI to scaffold and run my Vue.js applications. I liked how easy it was to use. I could easily run a built-in webpack development server which does something called [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/). Basically, this means that you can see your changes in real time without needing to reload the application. It is just as easy to build a minified version for production. 

I have been wanting to try using the [Vue CLI](https://cli.vuejs.org/) to develop a Vue.js Single-Page Application(SPA) with a Coldbox back-end. I thought I would document my steps here for myself and maybe it will help someone else too.

### Coldbox REST API

To start I will use CommandBox create a Coldbox application using the REST template. 

```
coldbox create app name = "My App" skeleton=rest
```

I will start the CommandBox server and run it on port 3000.

```
server start port=3000 rewritesEnable=true
```

### Vue CLI Installation

The course I mention uses Vue CLI v2 but since Vue CLI v3 was recently released I decided to use that. Here is the command to install it globally.

```
npm install @vue/cli -g
```

### Generate The Vue.js Application

I put the Vue.js application in a directory called `client-app`.  I kept all defaults when prompted to select options. The `--git false` flag will tell Vue CLI to not initiate a Git repository.

```
vue create client-app --git false
```

This will generate the base Vue.js app. You can see it running by doing this. 

```
cd client-app
npm run serve
```

#### Vue.js Plugins

Since this is a SPA I will use the Vue.js router. I can add it using this command.

```
vue add router
```

I plan to use Vuex for state management in this application so I add that as well.

```
vue add vuex
```

I added Axios for communicating with the backend API.

```
vue add axios
```


Finally, I add [Vuetify](https://vuetifyjs.com/en/getting-started/quick-start) which is a Material Design component library for Vue.js. I just accept all the default options for the generator.

```
vue add vuetify
```

### Vue CLI Config

#### Asset Directory

You can create a file named `vue.config.js` in the client-app directory. This file will contain a Javascript object with the [configuration options](https://cli.vuejs.org/config/) that will get used by the Vue CLI when running the development server or building your application for production.

The first configuration option that I set is `assetsDir`. This tells the Vue CLI where to put the `js`, `css`, `img`, and `fonts` files and folders. I set this to `assets` since that is where I will put them in the Coldbox application.

```
module.exports = {
	assetsDir: "assets"
}
```

#### Webpack Development Server

I will also set two settings for the webpack development server. They are `devServer.port` and `devServer.proxy`. The port setting tells which port to run the front-end development server on. I set this to 3001. The proxy setting is used to proxy requests from the front-end server to the back-end Coldbox application. Since I started my CommandBox server on port 3000. I set this setting to `http://localhost:3000`. My full config file looks like this.

```
module.exports = {
	assetsDir: "assets",
	devServer: {
		port: 3001,
		proxy: 'http://localhost:3000'
	}
}
```

### CommandBox Scripts

I added a couple scripts to my `box.json` file that can be run using the CommandBox `run-script` command. The first is named `dev` which just starts the front-end and back-end servers for development. The second is `build` which runs a CommandBox task runner named build. This runs the client build process and copies the assets to the Coldbox asset directory. It also takes the `index.html` file that is generated copies it to `views/main/index.cfm` which is the Coldbox default view.

```
"scripts":{
    "dev" : "start --force && !npm run serve --prefix ./client-app",
    "build" : "task run ./build/scripts/build"
}
```

You can view the full task runner here on [Github](https://github.com/jsteinshouer/guitar-tabs-vue/blob/master/build/scripts/Build.cfc).

### Routing


#### Vue.js Router

Here I changed the Vue.js router mode from hash mode to history mode. This takes the hash out of the URL and achieves a cleaner navigation. 

`client-app/src/router.js`

```
export default new Router({
    mode: 'history',
    routes: [
      ...
    ]
})
```

#### Coldbox

I set up a default wildcard Coldbox route that points to the view `views/main/index.cfm`. This allows any link other than API routes to load the client application. 

`config/Router.cfc`

```
route(pattern=".*",handler="Main",action="index").end();
```

If you would like to see more of the code [here is a github repository](https://github.com/jsteinshouer/guitar-tabs-vue) of the application I have started working on. 