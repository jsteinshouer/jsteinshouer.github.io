---
layout: post
title:  "OWASP TOP 10 2017 A2-Broken Authentication: Password Guidance"
date:   2018-07-13 16:58:00
disqus: true
excerpt: "One of the recommendations I mention in OWASP TOP 10 2017 A2-Broken Authentication: Password Requirements is to provide guidance to your users when creating passwords. Here I attempt to explore some ways of implementing feedback to users on the strength of their passwords."
tags: [Security,OWASP,Vue.js]
---

One of the recommendations I mention in [OWASP TOP 10 2017 A2-Broken Authentication: Password Requirements](/2018/06/30/owasp-top-10-broken-authentication-password-requirements.html) is to provide guidance to your users when creating passwords. Here I attempt to explore some ways of implementing feedback to users on the strength of their passwords.

I came across a password estimation library called [zxcvbn](https://github.com/dropbox/zxcvbn) built by some folks at Dropbox. Previous ways of providing user's feedback on password strength may have been inaccurate feedback because they meet certain length and complexity requirements. 

The library uses pattern matching and data comprised of commonly used passwords, common names, dictionary words, and other patterns that may make a password easily guessable. Using its algorithms it seems to be able to provide better and more accurate feedback on the strength of a password.

I found this [example implementation](https://css-tricks.com/password-strength-meter/) of a password meter built using this library. It inspired me to build this slightly different version with Vue.js and Bootstrap that you can see here.

<p data-height="600" data-theme-id="0" data-slug-hash="YjPaKv" data-default-tab="result" data-user="jsteinshouer" data-embed-version="2" data-pen-title="Password Meter" class="codepen">See the Pen <a href="https://codepen.io/jsteinshouer/pen/YjPaKv/">Password Meter</a> by Jason Steinshouer (<a href="https://codepen.io/jsteinshouer">@jsteinshouer</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

I implemented it as a Vue.js component. Which takes two properties one is the `password` and the other is `target` which should be a selector for the password input. This allows it to focus the boostrap popover that on the input element. The popover is used to display the user suggestions and warnings.

There are two data properties. The first is `score` which is used to power the meter (0 - 4). The second is `info` which will contain any suggestions or warnings to the user. A bootstrap popover is used to display the contents of the info property.

```javascript
Vue.component('password-meter', {

    template: ' <div id="password-strength-meter" @click="showInfo">\
        <meter max="4" :value="score"></meter> \
        <span class="text-muted">Password Strength: {{strength}} \
            <span class="glyphicon glyphicon-info-sign" v-if="info"></span> \
        </span> \
    </div>',
    props: ["password","target"],
    data: function() {
        return {
            score: 0,
            info: ""
        }
    },
...
```

I am using a Vue.js computed property to convert the score to a word indicating the current password strength.


```javascript
...
    computed: {
        strength: function() {
            switch( this.score ) {
                case 0: case 1:
                    return "Weak";
                break;
                case 2:
                    return "Medium";
                break;
                case 3:
                    return "Good";
                break;
                case 4:
                    return "Great";
                break;
            }
        }
    },
...
```

Here I am using [underscore.js](https://underscorejs.org/) for providing debounce utility for running the estimation when the password changes. This may not be necessary but I figure it doesn't hurt. 

```javascript
...
    created: function() {
        this.debouncedGetEstimate = _.debounce(this.getEstimate, 200);
    },
    watch: {
        password: function() {
            this.debouncedGetEstimate();
        }
    },
...
```

I have a `showInfo` method that is triggered when the user clicks the information icon. It triggers the popover with suggestions or warnings to display on the password input. 

```javascript
...
    methods: {
        showInfo: function() {
            var vm = this;

            if (vm.info) {
            
                $( this.target ).popover({
                    content: function() {
                        return vm.info;
                    },
                    title: vm.strength,
                    trigger: "manual",
                    container: 'body'
                });
                $( this.target ).popover("toggle");
            }
        }, 
...
```

Finally, the `getEstimate` method calls the zxcvbn library to get an estimate of the password. The result contains the score and feedback. It contains other data that I am currently not using such as an estimated amount of time it would take to crack the password.

```javascript
...
        getEstimate: function() {
            var estimate = zxcvbn( this.password );
            
            this.score = estimate.score;
            if (estimate.feedback.warning && estimate.feedback.warning.length && this.score < 3) {
                this.info = estimate.feedback.warning + "\n";
                this.info += "\n\n" + estimate.feedback.suggestions.join("\n");
            }
            else if (estimate.feedback.suggestions && estimate.feedback.suggestions.length && this.score < 3) {
                this.info = estimate.feedback.suggestions.join("\n");
            }
            else {
                this.info = "";
            }
            $( this.target ).popover("destroy");

        }
    }

});
```

Here is the html markup.

```markup
<div class="input-group">
	<input :type="passwordFieldType" name="password" id="password" v-model="password" class="form-control input-lg" placeholder="Password" required>
	<span class="input-group-addon pointer" @click="showPassword = !showPassword">
		<span class="glyphicon" :class="{'glyphicon-eye-open': !showPassword, 'glyphicon-eye-close': showPassword}" aria-hidden="true"></span>
	</span>
</div>
<password-meter :password="password" target="#password"></password-meter>
```

Here is a [jsfiddle](http://jsfiddle.net/steinshouerj/r67e4fcj) of it as well. 

If you are interested in possibly using the library for password validation on the server. The project has several ports to other languages. [nbvcxz](https://github.com/GoSimpleLLC/nbvcxz) is a Java port of the estimation tool that can be used in CFML to do the estimation on the server side.

This [GitHub Repo](https://github.com/jsteinshouer/owasp-demo-cfml) contains an example of doing it on the server side using the Java library. It is a sample Coldbox application I created to demonstrate some ways for preventing some of the OWASP Top 10 vulnerabilities. If you are interested take a look at these files.

- [models/security/PasswordStrengthEstimator.cfc](https://github.com/jsteinshouer/owasp-demo-cfml/blob/master/models/security/PasswordStrengthEstimator.cfc)
- [models/security/PasswordStrengthEstimatorResult.cfc](https://github.com/jsteinshouer/owasp-demo-cfml/blob/master/models/security/PasswordStrengthEstimatorResult.cfc)
- [models/security/PasswordService.cfc](https://github.com/jsteinshouer/owasp-demo-cfml/blob/master/models/security/PasswordService.cfc)

### Related Posts

- [OWASP TOP 10 2017 A2-Broken Authentication: Password Requirements](/2018/06/30/owasp-top-10-broken-authentication-password-requirements.html)
- [Implementing a Password Blacklist in CFML](/2018/06/30/implementing-a-password-blacklist.html)

