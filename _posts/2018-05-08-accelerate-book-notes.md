---
layout: post
title:  "Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations"
date:   2018-05-08 06:00:00
disqus: true
excerpt: "The book Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations by Nicole Forsgren Ph.D., Jez Humble, and Gene Kim warn that organizations should be learning continuous delivery so they do not fall behind in a world where IT is critical to remain competitive in any industry."
tags: [DevOps,Books,Development]
---

The book [Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations](https://read.amazon.com/kp/kshare?asin=B07B9F83WM&id=7tIJy7ClSviSgwQwU2xJpQ&reshareId=4BX8T28SB0MYEH4TTASK&reshareChannel=system) by Nicole Forsgren Ph.D., Jez Humble, and Gene Kim warn that organizations should be learning continuous delivery so they do not fall behind in a world where IT is critical to remain competitive in any industry. This is based on research they have performed through years of creating the [State of DevOps Report](https://puppet.com/resources/whitepaper/state-of-devops-report). They tracked metrics such as the amount of time it takes to deliver software changes, how often they deploy to production, change fail rate, and time to restore service when a failure occurs. By analyzing all the data they found that these [24 capabilities](https://devops-research.com/assets/transformation_practices.pdf) are where the high-performing organizations are practicing. 

This is not a technical book but clearly explains what these practices are and how they are used to get better results. The book also does a nice job of describing exactly how the research was executed if you are interested in that. This was enjoyable to read and I recommend it to anyone involved in the delivering software products.

I am also including some of my notes on things I thought were particularly interesting.


## My Notes

### Software Development Practices

**Automate your deployment process**

- In order to do continuous delivery, you need to have an automated deployment process that does not require manual intervention.

**Automated testing**

- Practice TDD to improve overall code design and readability. As a by-product, you get some automated regression testing.
- Testers are still important., they are just focused on acceptance testing and exploratory testing

**Test data management**

- The practice of management data sets needed for automated testing. **SHOULD NOT USE PRODUCTION DATA**

**Implement Continuous Integration**

- Teams should have a way to be confident their changes integrate with other developers changes. To have this confidence an automated build and testing process should be implemented.

**Use trunk-based development methods**

- This one surprised me a little but once I thought about it it makes sense because it lines up with the practice of continuous integration. The sooner the developer finds out there is a conflict with a change they made the easier and faster it will be to resolve that conflict. If you do development isolated in your own branch for long periods (More than a day) a lot of time is spent trying to integrate it back into the trunk.
- [Continuous Integration and Feature Branching](http://www.davefarley.net/?p=247)

**Shift left on security**

- Security should be considered in all parts of the software development lifecycle and not just an afterthought.

**Use a loosely coupled architecture**

- Break applications down to smaller prices that are easier to manage and can be deployed independently from the rest of the application (Microservices)


### Lean Product Development

- Many of the concepts are based on concepts developed by Toyota using what became know as [Lean Manufacturing](https://en.wikipedia.org/wiki/Lean_manufacturing)

**Work in small batches**

- Work should be broken into small pieces that can be completed in less than a week. This shortens the feedback loop and allows for more frequent deployment.

> The key to working in small batches is to have work decomposed into features that allow for rapid development, instead of complex features developed on branches and released infrequently. This idea can be applied at both the feature and the product level. An MVP is a prototype of a product with just enough features to enable validated learning about the product and its business model. Working in small batches enables short lead times and faster feedback loops. In software organizations, the capability to work and deliver in small batches is especially important because it allows you to gather user feedback quickly using techniques such as A/B testing. It’s worth noting that an experimental approach to product development is highly correlated with the technical practices that contribute to continuous delivery.

**Gather and implement customer feedback**

- Seek customer feedback and let it drive the design of the product.

### Leadership / Management Practices

**Have a lightweight change approval processes**

- Use peer reviews such as pair programming or intrateam code reviews instead of change approval boards or other gatekeepers

**Architect for empowered teams**

- Let the team choose the tools they use. Do not dictate to them.

**Foster and enable team experimentation**

- Allow developers to experiment and implement their ideas without the need for outside approval

**Quality and Saftey should be a pre-requisite**

> Too often, quality is overshadowed by the pressure for speed. A courageous and supportive leader is crucial to help teams “slow down to speed up,” providing them with the permission and safety to put quality first (fit for use and purpose) which, in the long run, improves speed, consistency, and capacity while reducing cost, delays, and rework. Best of all, this improves customer satisfaction and trust

- Should not need to have permission to do automated testing

**Support a generative culture**

- Establish a dedicated training budget and make sure people know about it
- Let people choose which training interests them
- Dedicated time to explore side projects
- Encourage staff to attend conferences
- Set up internal hack days, where cross-functional teams can get together to work on a project
- Lightning talks
- Encourage teams to organize internal “yak days,” where teams get together to work on technical debt
- Hold regular internal DevOps mini-conferences


### General Notes

- [ING - Experimenting with different ways of working](https://www.mckinsey.com/industries/financial-services/our-insights/ings-agile-transformation) 
	- The last chapter talked about transformational leadership and how ING is implementing these practices
	- [Org Structure](https://www.mckinsey.com/~/media/McKinsey/Industries/Financial%20Services/Our%20Insights/INGs%20agile%20transformation/SVG%20QWeb_ING_ex1.ashx)
- **Make it your own** Organizations need to develop what works for them instead of adopting everything by the book. No one org will do it the same. Orgs should be evolving and adjusting as time goes on (Continuous Improvement).

> Practice practice. You just have to try it: learn, succeed, fail, learn, adjust, repeat. Rhythm and routine, rhythm and routine, rhythm and routine . . .

- **Work smarter not harder** 

> In 2017, we saw low performers lose some ground in stability. We suspect this is due to attempts to increase tempo (“work harder!”) which fail to address the underlying obstacles to improved overall performance (for example, rearchitecture, process improvement, and automation)