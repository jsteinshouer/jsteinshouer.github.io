---
layout: post
title:  "Using the CFLint for Static Analysis with Jenkins"
date:   2019-03-02 22:58:00
disqus: true
tags: [CommandBox,CFLint,CFML,Jenkins]
excerpt: I am going to walk through how you can use CFLint and Jenkins to do static code analysis on your CFML code as part of a CI process.
---


There are a lot of good options when it comes to Continuous Integration(CI) systems these days. [Jenkins](https://jenkins.io/) is a time tested CI tool but has also evolved to adapt to modern development practices so I think it is still a great option when it comes to continuous integration. I am going to walk through how you can use [CFLint](https://github.com/cflint/CFLint) and Jenkins to do static code analysis on your CFML code as part of a CI process.

### CFLint

CFLint is a tool for doing static analysis on CFML code. It allows you to use rules to check code for possible bugs and also to ensure that best practices and standards are being met. Hopefully, you and your developers are using CFLint or another tool as you develop but it is also a good process to run as part of your continuous integration process.

[CommandBox-CFLint](https://github.com/jsteinshouer/commandbox-cflint) is a CommandBox module that packages the CFLint tool. In this tutorial, I use it with CommandBox to easily install and run CFLlint from within Jenkins.

### Jenkins Setup

For this demo, I am running Jenkin in Docker. The command below I used is based on information in [this tutorial](https://jenkins.io/doc/tutorials/build-a-node-js-and-react-app-with-npm/#run-jenkins-in-docker). It should work pretty much the same if you have a physical server. The commands may be slightly different depending on if you are using Linux or Windows. Here is the command I used to run it on my Windows machine.

```
docker run ^
  --rm ^
  -u root ^
  -p 8080:8080 ^
  -v jenkins-data:/var/jenkins_home ^
  -v /var/run/docker.sock:/var/run/docker.sock ^
  -v "%HOME%":/home ^
  jenkinsci/blueocean
```

Your initial admin password can be found in this file.

```
/var/jenkins_home/secrets/initialAdminPassword
```

The first time you sign in you will go through a setup process. Here you will want to install all the recommended plugins. You can optionally set up additional users. 
Once you are logged into the admin you will want to set up a Job. To do this follow [these steps](https://jenkins.io/doc/tutorials/build-a-node-js-and-react-app-with-npm/#create-your-pipeline-project-in-jenkins) for your repository. 

### Pipeline Configuration

It is common in modern CI systems for the configuration to be stored in a text file that can be checked into the source control system. With the introduction of the Jenkins pipeline plugins, it is possible to define your build configuration in a Jenkinsfile. This is Groovy script with a domain specific language (DSL) for Jenkins. 

Here is an example of a Jenkinsfile from the [Jenkins documentation](https://jenkins.io/doc/book/pipeline/jenkinsfile/) that defines 3 stages of a pipeline.

```
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}
```

The [agent directive](https://jenkins.io/doc/book/pipeline/syntax/#agent) is used to tell Jenkins how to execute the pipeline. This can be defined at the global level or at each individual stage. One option is to use Docker which is what I will use for this tutorial. 

Here I tell Jenkins to execute the pipeline using the [Ortus Solutions CommandBox Docker image](https://hub.docker.com/r/ortussolutions/commandbox/). 

```
pipeline {
    agent {
        docker {
            image 'ortussolutions/commandbox'
        }
    }
…
```

Then I define a single stage named Static Analysis with 2 steps.

```
stages {
    stage('Static Analysis') { 
        steps {
           sh 'box install commandbox-cflint'
           sh 'box cflint reportLevel=ERROR'
       }
    }
}
```

This first step tells CommandBox to install the commandbox-cflint module from [ForgeBox](https://www.forgebox.io/). 

```
sh 'box install commandbox-cflint'
```

The second will then run the CFLint command in the workspace directory. Keep in mind the Jenkins will check out the code into the workspace prior to executing these commands. 

```
sh 'box cflint reportLevel=ERROR'
```

The reportLevel parameter tells the command to only report items with the level of ERROR. If any errors are found by CFLint the pipeline run will be marked with failure.

![Jenkins Failed](https://s3.us-west-2.amazonaws.com/jasonsteinshouer/images/2019-03-02_22h02_07.png)

Then if I fix the errors and commit them to source control the job will run again and will then be successful.

![Jenkins Success](https://s3.us-west-2.amazonaws.com/jasonsteinshouer/images/2019-03-02_22h35_20.png)


#### Jenkinsfile

For reference here is the whole Jenkinsfile I used for this example.

```
pipeline {
    agent {
        docker {
            image 'ortussolutions/commandbox'
        }
    }
    stages {
        stage('Static Analysis') { 
            steps {
                sh 'box install commandbox-cflint'
                sh 'box cflint reportLevel=ERROR'
            }
        }
    }
}
```

