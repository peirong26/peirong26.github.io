---
id: 2158
title: Exploring device detection for better user experiences in 2020
date: 2020-01-15T02:16:54-03:00
author: Leonardo Faria
ogImage: /images/og-images/2158.png
layout: post  
#guid: https://leonardofaria.net/?p=2158
#permalink: /2020/01/15/exploring-device-detection-for-better-user-experiences-in-2020/
#categories:
  #- browser
  #- javascript
#tags:
  #- browser
  #- javascript
---
A few months ago I watched a great talk in Chrome Dev Summit about performance in slow devices.
 

It blew my mind all the work done by Facebook in identifying devices to create a better user experience. Fast-forward to now, I decided to study a bit more the topic and see what I could do at Thinkific.

## User agents {#user-agents}

User agents are well-known by developers. We use them to detect bots, redirect users to a specific version of our website or append CSS classes on our page so we can create different experiences.

At Thinkific we already use the [browser Ruby gem](https://github.com/fnando/browser) to parse the user-agent and get relevant info (bot detection for instance). So, I decided to persist the main info in a visitor_device table – here is the schema:

```
tenant_id: the course creator school the visitor is checking
raw: the raw ua
type: desktop / mobile / tablet / bot / other
browser_name
browser_version
platform_name
platform_version
hardware: hstore containing memory, processor, device_model, device_name
connection: hstore containing downlink_max, connection_type
```

You probably noticed that a few things there are not available in the UA string. Time for new JavaScript APIs:

## Getting hardware info using JavaScript {#getting-hardware-info-using-javascript}

As covered in the Chrome Dev Summit video, we can use JS to get this info

### Memory {#memory}

`navigator.deviceMemory` will return a floating-point number. There are things to consider here:

  * It only works over HTTPS
  * Support is quite limited (Chrome only basically)

More about it:

  * [Spec from W3C](https://github.com/w3c/device-memory)
  * [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)
  * [Can I use deviceMemory](https://caniuse.com/#feat=mdn-api_navigator_devicememory)

### Processors {#processors}

`navigator.hardwareConcurrency` will return the number of logical cores of the user's CPU. Support for this is [decent](https://caniuse.com/#feat=hardwareconcurrency).

## Detecting connection info using JavaScript {#detecting-connection-info-using-javascript}

`navigator.connection` is a new API containing information about the system's connection, such as the current bandwidth of the user's device or whether the connection is metered. The support is quite limited (Chrome only basically) but things are promising.

More about it:

  * [Chrome example](https://googlechrome.github.io/samples/network-information/)
  * [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection)
  * [Can I use Network Information API](https://caniuse.com/#feat=netinfo)

## Detecting the device model {#detecting-the-device-model}

The user agent _may_ return some information about the model name. [userstack](https://userstack.com/) is a service that gives you information based on the user agent. It works well and it is easy to integrate, however, depending on your need, they can't help.

Take for instance iDevices. Their user agent is basically the same so you can't differentiate an iPad Pro from an old iPad that runs the last iOS. For these cases, you may need a better detection based on resolution, pixel density and other hardware information exposed in the browser. I did a quick research on this and found 3 products so far: [WURFL.io](https://web.wurfl.io/#wurfl-js), [DeviceAtlas](https://deviceatlas.com/products/web) and [51Degrees](https://51degrees.com/). I didn't have time to try their products yet, but I am looking forward to doing it (and post about it)

## FAQ {#faq}

_Question: Why not using Google Analytics / Mixpanel / Kibana / New Relic / your tool here?_

We could get browser info inside other tools however as a SaaS product we don't use our own Google Analytics property (customers add their own). Also, adblockers may block these third-party tools. Last not least, by having this info in our side we can adapter better.

_Question: Do you have a list of low-end/high-end devices?_

No. Maybe this can be built combining the number of processors and memory but I didn't invest much time on this. In this project, my colleague created a Rails helper that would determinate if the user would use the lite or default version of a website based on hardware. On this topic, it is important to mention Facebook has a library for Android called [Device Year Class](https://github.com/facebook/device-year-class/).
