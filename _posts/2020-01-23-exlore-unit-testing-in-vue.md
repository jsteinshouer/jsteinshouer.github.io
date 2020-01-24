---
layout: post
title:  "Exploration in Unit Testing Vue.js Components"
date:   2020-01-23 09:12:00
disqus: true
tags: [Vue.js, Testing]
excerpt: "This post is some notes on things I learned during my initial exploration with unit testing Vuex components"
---

I have been playing around with the Vue.js framework a lot in the last year or two. I went through Udemy course that covered Vue.JS and Vuex. The final project was to build a Stock Trading Simulation using Vue.js and Vuex. The course did not cover testing. I wanted to explore that by adding some unit tests to my Stock Trading application. Here are my notes about some of the things I learned in the process.

### What to test?

I am not going to go into the benefits of writing tests in this post but I was curious about what I should test in a Vue.js component. I found some good guidance in this [guide from the Vue Test Utils documentation](https://vue-test-utils.vuejs.org/guides/#knowing-what-to-test). 

> Instead, we recommend writing tests that assert your component's public interface, and treat its internals as a black box. A single test case would assert that some input (user interaction or change of props) provided to the component results in the expected output (render result or emitted custom events).

So basically I should test input and output and not worry about testing the details of internal implementation. 

### Getting started

The [Vue CLI](https://cli.vuejs.org/) makes setting up new Vue.js projects simple and easy. So it made sense to check their docs for ways to easily add unit testing to a Vue.js project. It turns out it has support for unit testing built it with either the [Jest](https://github.com/facebook/jest) or [Mocha](https://mochajs.org/) libraries. I did not have prior experience with either library but had read that the syntax for Jest was very similar to Jasmine so I decided to go with Jest. Adding it to my project was easy as running this command.

    vue add @vue/unit-jest

By default you will put your tests in the `tests/unit` directory. The test runner will look for anything that ends with `.spec.(js|jsx|ts|tsx)`.

Running the tests is as simple as this command.

    npm run test:unit

### Vue Test Utils

[Vue Test Utils](https://vue-test-utils.vuejs.org/) is the official test library for Vue.js. It gives you the ability to mount Vue.js components inside your tests. It also gives you utilities to traverse the rendered HTML to verify the component behavior is what is expected.

### ShallowMount vs Mount

[Vue Test Utils](https://vue-test-utils.vuejs.org/) provides two utilities for mounting Vue.js components in isolation for testing them. They allow you to mock the inputs to the component as well as provides convivence methods for asserting that the outputs are correct. The `[Mount](https://vue-test-utils.vuejs.org/guides/#mounting-components)` method will mount the component along with any child components as well. 

The `[shallowMount](https://vue-test-utils.vuejs.org/guides/#shallow-rendering)` method will only mount the component itself and stub out any child components. The benefit to this is that it allows you to test the component in isolation as well as makes your tests faster because it doesn't have to render all the child components. See [the docs](https://vue-test-utils.vuejs.org/guides/#shallow-rendering) for more info.

Here is an example of using the `shallowMount` method to test my component. 

```javascript
import { shallowMount } from '@vue/test-utils'
import Home from '@/components/Home.vue'
...
it('should display the current amount of funds', () => {
    wrapper = shallowMount(Home, {localVue, store});
    expect(wrapper.find("h2").text()).toBe("Your Funds: $75,000");
});
```

Here is an example where I check that a stubbed child component is would be rendered twice.

```javascript
it('should render the stock component for each stock', () => {
    wrapper = shallowMount(Stocks, { localVue, store });
    expect(wrapper.findAll("app-stock-stub").length).toBe(2);
});
```

### Testing Components with Vuex

Since we are unit testing we want to test the component in isolation. So if my component is calling getters, mutators, or actions from a Vuex store, I don’t want to test that at the same time. To handle this I can use the Jest `[jest.fn()](https://jestjs.io/docs/en/mock-functions)` utility to mock them.

In this example I am using it to mock a Vuex mutation.

```javascript
let mutations;
let store;
    
beforeEach(()=>{

  mutations = {
     "buy": jest.fn()
  }

  store = new Vuex.Store({
      mutations
  });

});
```

Then in my tests I can verify it was called.

```javascript
it('should call the buy mutation when a quantity is entered and the button is clicked', () => {
    wrapper = mount(Stock, { propsData: { stock }, localVue, store});
    wrapper.setData( { quantity: 1 } );
    wrapper.find("button").trigger("click");
    expect(mutations.buy).toHaveBeenCalled();
});
```

### Testing Vuex

For testing a Vuex store you can test it like you would any other Javascript module. Just import it ,call the methods,and verify the results. Here is a simple example.

```javascript
import stocks from '@/store/stocks';

describe('store/stocks.js', () => {

    describe('mutations.endDay', () => {

        it('should randomly change the stock prices', () => {

            stocks.state.stocks = [
                { name: "Google", price: 100 },
                { name: "Apple", price: 100 },
                { name: "Twitter", price: 100 }
            ];

            stocks.mutations.endDay(stocks.state);

            stocks.state.stocks.forEach( (item) => {
                expect(item.price).not.toBe(100);
            });
        });


    });
});
```

### Testing with Vuetify

I used the Vuetify UI component library in project so in order to get my unit tests to run I had to setup the local Vue instance to know about the Vuetify library. 

```javascript
import Vuetify from 'vuetify'
...
const localVue = createLocalVue()
localVue.use(Vuetify)
```

### CI with Travis CI

Now that I have a test suite I wanted to setup my Travis CI build to run them and verify that they pass prior to deploying any changes. In my `.travis.yml` configuration file I just had to run the `npm run test` command prior to running the `npm run build` command. I also run the lint command to catch any formatting or syntax issues. Here is my full configuration.

```yml
language: node_js
node_js:
  - "stable"
cache:
  directories:
  - node_modules
script:
  - npm run lint
  - npm run test
  - npm run build
deploy:
  provider: pages
  skip_cleanup: true
  github_token: $github_token
  local_dir: dist
  on:
    branch: master
```

Deployment to Github pages by adding this to the `vue.config.js` file. This lets the build command know that the application should be built to run int in the sub directory `stock-trader` of my Github pages site.

```javascript
module.exports = {
    publicPath="stock-trader"
}
```

### Test Coverage

I was able to add test coverage reporting by adding this to my Jest config in the file `jest.config.js`.

```javascript
collectCoverage: true,
collectCoverageFrom: [
    '**/*.{vue}', 
    '!**/node_modules/**', 
    '!<rootDir>/dist/**',
    '!<rootDir>/src/plugins/**', 
    '!<rootDir>/tests/unit/**'
],
coverageReporters: ['lcov', 'text-summary']
```

This will generate reports in the `/coverage` directory.

### Conclusion

It is possible that I am not following some best practices here and welcome any feedback. This post is some notes on things I learned during my initial exploration with unit testing Vuex components. It is not meant to be a deep dive.