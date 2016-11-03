---
layout: post
title:  "Notes on Migrating from Vue.js 1.x"
subtitle: "using ColdBox Elixir"
categories: [tools,CFML,javascript]
date:   2016-11-03 00:00:00
tags: [vuejs,cfml,javascript]
---

I have been refactoring a Coldbox application as a Single Page Application using [Vue.js](http://vuejs.org/) using [ColdBox Elixir](https://www.ortussolutions.com/blog/introducing-coldbox-elixir-ui-asset-manager). I was origionally looking at ColdBox Elixir for compiling Sass. After reading the [docs](https://coldbox-elixir.ortusbooks.com/installation.html) I was curious and decided to look into Vue.js.

So far Vue.js and ColdBox Elixir have been a joy to work with. Vue.js [recently released version 2.0](https://medium.com/the-vue-point/vue-2-0-is-here-ef1f26acf4b8#.44y3tnyv4) so i decided to try migrating what I had done to version 2.0.  

I started by upgraded my vue and vue-router packages to the most recent versions.

```bash
npm install vue@latest --save
npm install vue-router@latest --save
```

## Vue-Router Migration

I ran gulp to compile my application and recieved this error in the browser. 

```
Uncaught TypeError: router.map is not a function(…)
```
So after reviewing the [vue-router migration documentation](http://vuejs.org/guide/migration-vue-router.html) I changed my router configuration from this:

```javascript
const router = new VueRouter({
	history: true
});

router.map({
	'/': {component: Home},
	'/hello': {component: HelloWorld},
	'/profile/:userID': {component: Bar}
});

router.start(App, '#app');
```

To this:

```javascript
const routes = [
	{ path: '/', component: Home},
	{ path: '/hello', component: HelloWorld},
	{ path: '/profile/:userID', component: Bar}
];

const router = new VueRouter({
	mode: 'history',
  	routes: routes
});

const app = new Vue({
	components: {App},
  	router: router
}).$mount('#app');
```

To resolve this warning I needed to change my anchor tags using v-link.

`[Vue warn]: Failed to resolve directive: link`

This code:

```markup
<a href="#" v-link="/">Home</a>
```

Became this:

```markup
<router-link to="/">Home</router-link>
```

## Importing From NPM

After getting the vue-router setup changed I recieved this warning. 

```
[Vue warn]: Failed to mount component: template or render function not defined. 
(found in root instance)
```

The warning is a little misleading. After some searching I discovered it is because using NPM the [runtime-only build](http://vuejs.org/guide/installation.html#Standalone-vs-Runtime-only-Build) is imported.

```javascript
import Vue from 'vue';
```

The [workaround](http://vuejs.org/guide/installation.html#Standalone-vs-Runtime-only-Build) was to use Aliasify.

```bash
npm install aliasify --save
```

I then added this to `package.json`.

```bash
"aliasify": {
    "aliases": {
        "vue": "vue/dist/vue.js"
    }
},
```

## Vueify

My application uses Vue.js [Single File Components](http://vuejs.org/guide/single-file-components.html) and Vueify is the tool that compiles them. Coldbox Elixir uses Vueify 8.x which only works with Vue 1.x. To resolve this I installed Vueify 9.

```bash
npm install vueify@latest --save
```

## Resolving other warnings

I recieved other warnings due to deprecated features or changes to Vue.js. Here are the warnings I encountered and changes to resolve them.

Warning: 

`[Vue warn]: Component template should contain exactly one root element:`

Solution:

Added `<div></div>` around any component templates that had multiple root elements.

Before: 

```markup
<h1>{{header}}</h1>
<ul>
	<li v-for="user in users">{{user.name}}</li>
</ul>
```

After: 

```markup
<div>
	<h1>{{header}}</h1>
	<ul>
		<li v-for="user in users">{{user.name}}</li>
	</ul>
</div>
```

Warning:

`Failed to resolve directive: el `

Solution:

The [solution](http://vuejs.org/guide/migration.html#v-el-and-v-ref-replaced) for this was to replace the `v-el` attribute with the `ref` attribute. I Also had to changed my references from this.$elem to this.$refs.

One other change I made was to change the name of the `ready` event handler in my components to `mounted`.
