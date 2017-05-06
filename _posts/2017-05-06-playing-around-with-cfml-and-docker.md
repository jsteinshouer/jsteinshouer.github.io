---
layout: post
title:  "Playing Around with CFML and Docker: First Steps"
subtitle: ""
date:   2017-05-06 13:56:00
tags: [CFML,CommandBox]
disqus: true
---

Watching the keynote talks from this year's Into the Box Conference gave me some inspiration to start learning more about running CFML applications in Docker. I currently run a Jekyll Docker image to develop this blog but I am still very much a newbie.

I know the there are some [images for Lucee](https://github.com/lucee/lucee-dockerfiles) but haven't had a chance to work with them. Also, The Ortus Solutions team recently released a [new image][CommandBox Image Blog Post] for CommandBox which allows you to run Coldfusion or Lucee inside a Docker container. 

For my first experiment, I thought I would attempt to get the Coldbox skeleton application running using the CommandBox docker image provided by Ortus Solutions.

First I created a skeleton application using the Command Box scaffolding tools.

```bash
mkdir docker-test
cd docker-test
box coldbox create app name="Docker Test" skeleton="AdvancedScript" installColdbox=true
```

I am somehwhat familiar with [Docker Compose][Getting Started with Docker Compose] since that is what I use to run my blog development container. So I created the following docker-compose.yml file in the application root directory.

```yml
web:
    image: ortussolutions/commandbox:latest
    ports:
        - 8080:8080
    volumes:
        - .:/app
    environment:
        - PORT=8080
        - CFENGINE=adobe@11
```

By default, it runs on port 8080 but you are free to change those values in the file if you want to use a different port. The example file is using Adobe CF 11 as the CFML engine but you can change that environment variable to be any CFML engine that Command Box supports.

Finally Run docker compose to create the image and run it.

```bash
docker-compose up
```
Once it is running you should be able to browse http://localhost:8080 and see the Coldbox app.

#### Next steps 

As a next step I will attempt to link it to a database service and also explore the cfconfig integration that the Ortus Solutions team describes in [their blog post] [CommandBox Image Blog Post].




[CommandBox Image Blog Post]: https://www.ortussolutions.com/blog/commandbox-docker-image-360-released
[CommandBox Docker Image]: https://hub.docker.com/r/ortussolutions/commandbox/
[Getting Started with Docker Compose]: https://docs.docker.com/compose/gettingstarted/
[Environment Variables in Docker Compose]: https://docs.docker.com/compose/environment-variables/#passing-environment-variables-through-to-containers
[Codeship Blog]: https://blog.codeship.com/orchestrate-containers-for-development-with-docker-compose/