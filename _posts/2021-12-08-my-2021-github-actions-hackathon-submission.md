---
layout: post
title:  "My 2021 Dev.to Github Actions Hackathon Submission"
date:   2021-12-08 00:00:00
disqus: true
tags: [CFML,Github,Docker]
excerpt: "My goal was to learn more about building a modern CFML application with a CI/CD process."
---

I decided to create project submission for this year's [Dev.to Github Actions Hackathon](https://dev.to/devteam/join-us-for-the-2021-github-actions-hackathon-on-dev-4hn4).  I thought I would share my submission here. 

My goal was to learn more about building a modern CFML application with a CI/CD process. I am sure there are a lot of improvements that could be made. One thing I am still working on is adding more documentation. Below is a link to the [Dev.to](http://Dev.to) post as well as the project in Github.

[Dev.to post](https://dev.to/jsteinshouer/building-a-cicd-workflow-for-my-cfmlvuejs-application-2c29)

[Project on Github](https://github.com/jsteinshouer/movie-list-app)

The application itself is just basically just a to-do list but for movies. It is very much a work in progress. Here is a general outline of the tech stack that I am using:

### API

- CFML - [Lucee](https://www.lucee.org/)
- [Coldbox MVC Framework](https://www.coldbox.org/)
- [Quick ORM](https://quick.ortusbooks.com/) + [cfmigrations](https://github.com/coldbox-modules/cfmigrations)
- MySQL

### Front-end

- [Vue.js 2](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Axios](https://axios-http.com/docs/intro)
- [TailwindCSS](https://tailwindcss.com/)

### Testing

The project also uses [TestBox](https://testbox.ortusbooks.com/) and [Cypress](https://www.cypress.io/) for testing.

### Production

I am running it on the AWS [Graviton2](https://aws.amazon.com/pm/ec2-graviton/) (ARM64 processor) micro instance using Docker. AWS is doing a free trial on the Graviton2 micro instances until the end of the year. It is using [Traefik](https://traefik.io/traefik/) for reverse proxy and free/automated SSL certificates via Let’s Encrypt. I am also planning to share some more details about how I setup it up in a later post.

### Conclusion

I do not think there is anything revolutionary here nor do I expect to win a contest prize. For me it was more about learning from the process of creating it. 

Sadly, I just realized my last blog post was exactly one year ago 😞. I am hoping to change that in 2022. Maybe this project will be fodder for some new blog entries.