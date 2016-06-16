---
layout: post
title:  "Hello World from Jekyll!"
subtitle: "My first blog post!"
date:   2016-06-14 22:34:01
categories: [tools]
---
I decided to try out using [Jekyll][jekyll] to build a personal blog. It is a static site generator and also the engine behind [Github Pages][gh-pages]. This is appealing since I can host my site there for free. This first posts focuses on setting up my development environment to get started with Jekyll.

First, I found a Jekyll theme that I liked. I used [Daktilo](https://github.com/kronik3r/daktilo) and copied it to my project folder.

As of this writing Jekyll is not officially supported on Windows. Since I was working in Windows I decided to use [Vagrant][vagrant] to setup my development environment as a virtual machine. Vagrant is a tool that helps automate the creation of development environments using virtual machines. With vagrant I can do my Jekyll development on a linux virtual machine. I already had [Vagrant][vagrant] and [Virtual Box][vbox] installed on my windows machine. 

virtual machine with [Jekyll][jekyll] and all of its [dependencies][jekyll-install].  

I found [this Github repository](https://github.com/jsturtevant/jekyll-vagrant) with a Vagrant config and Linux shell script to install Jekyll and all of its [dependencies][jekyll-install]. I downloaded repo and copied the `Vagrantfile` and `boostrap.sh` files to my project directory.

I could then provision and start the Vagrant box with the following command.

{% highlight bash %}
vagrant up
{% endhighlight %}

It takes a while the first time you run it because it must download the base Vagrant box then run the provisioning. Subsequent startups should be much faster. Once it is was up I could connect using SSH.

{% highlight bash %}
vagrant ssh
{% endhighlight %}

Vagrant maps a the project directory to a directory named vagrant inside the virtual machine. I then changed to that directory.

{% highlight bash %}
cd /vagrant
{% endhighlight %}

I use the following command to have Jekyll generate the site and serve it. It will also watch the directory and regenerate for any changes.  

{% highlight bash %}
jekyll serve --host 0.0.0.0 --watch --force_polling
{% endhighlight %}


I could browse the site from my host machine at `http://localhost:4000.` I was now ready to start developing the site. Check out the [Jekyll docs][jekyll] for more info on how to get starting using Jekyll. 

[jekyll]:      http://jekyllrb.com
[vagrant]:     https://www.vagrantup.com/
[gh-pages]:    https://pages.github.com/
[jekyll-install]: https://jekyllrb.com/docs/installation/
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-help]: https://github.com/jekyll/jekyll-help
[vbox]: 		https://www.virtualbox.org/wiki/Downloads
