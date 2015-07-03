---
layout:   post
title:    浏览器的同源策略和跨域访问
abstract: 以前做web应用的时候经常需要访问内网里不同的Web Service，而这些Web Service是放在不同的sub domain下的，这就会碰到cross domain问题。在网上也经常会看到一些跨域攻击的文章，但总感觉东一块、西一块，一直对问题的整体缺乏清晰的认识。周末花了点时间，尝试把这块内容梳理一下，加深自己的认识。
tags: [web, javascript, security]
---

### 一个例子

打开浏览器的终端窗口（例如Chrome就按Ctrl + Alt + J，IE按F12后选择控制台）后，如果你点这个按钮<button onclick=clickme()>点我</button>，在控制台界面你应该可以看到这样的错误（以Chrome为例）

![pb](/public/images/error-chrome.PNG "")

出现这个错误，是因为点击完那个按钮之后，浏览器执行了这样一段代码，引起了跨域访问的错误。

{% highlight JavaScript %}
$.get("http://www.github.com");
{% endhighlight %}

### 浏览器的同源策略

同源策略是浏览器众多重要的安全措施之一，它规定

> 不同域的客户端脚本在没明确授权的情况下，不能读写对方的资源。

这里的定义简单明确，突出了这几个关键字:

#### 不同域

一个域由三个元素确定：

1. 协议（http与https）

2. 域名（顶域与子域，不同的子域）

3. 端口

这三个元素都要相同才是在同一个域下。

#### 客户端脚本

主要是指JavaScript和ActionScript（Flash）。

#### 授权

服务器通过某种方式告诉浏览器，另一个域下的脚本可以访问我。

#### 资源

HTTP头，DOM树，Cookie，localStorage等。

同源策略保证了资源的隔离。一个网站的脚本只能访问自己的资源，就像操作系统里进程不能访问另一个进程的资源一样。

### 如何跨域访问

由于某些原因，有时候我们就是要跨域访问资源，这里有一些方式可以参考。

#### 1. Access-Control-Allow-Origin 
服务器在返回的http response头部中加入以下内容，用于允许www.a.com中的脚本调用自己。

{% highlight HTML %}
header("Access-Control-Allow-Origin: http://www.a.com");
{% endhighlight %}

#### 2. 后端转发
当前后端作为代理，转发请求。

#### 3. 修改document.domain
浏览器脚本修改document.domain。域名只允许往上升，例如a.git.com到git.com，这样脚本就可以访问git.com上的资源了。还有种用法是假设浏览器访问了a.git.com和b.git.com，如果它们的脚本都把域名设为git.com，那么浏览器本地的资源可以共享。

#### 4. window.postMessage
Html5的新方法，两个域下的脚本可以跨window通信。

#### 5. 利用表单
浏览器里不禁止表单跨域，所以可以用Javascript + iframe + 表单实现跨域调用。而且这种方式不需要远程服务器端明确授权的。感觉这种方式确实违反了浏览器的同源策略原则。所以对于敏感的API调用，在服务器端不能仅仅检查header里的token。

#### 6. JSONP

如果我们想访问一个URL并处理从它那边传回来的数据，JavaScript下面一般是写一个callback。例如：

{% highlight javascript %}
function displayData(data) {
    alert(data.name);
}
{% endhighlight %}

之后正常的做法是交给一个Ajax请求去做，但如果目标URL在不同的域内，就废了。

其实还有种方法达到Ajax这种异步请求并执行的效果，那就是&lt;script src="some_url"&gt;&lt;/script&gt;标签。当浏览器发现&lt;script&gt;标签的时候，就会发起一个web请求，把返回的数据当做JavaScript执行一遍。

浏览器只是禁止脚本跨域访问，并没有禁止html文件加载其他域下面的资源，例如图片，例如script本身。

当你想请求另一个域下面的资源时，当前脚本只需要动态生成一个&lt;script&gt元素并加到DOM树下面，浏览器就会乖乖把&lt;script&gt;中URL中的内容load下来，然后执行一把。如果远程服务器配合返回一个这样的东东

{% highlight javascript %}
displayData({"name", "yiheng"})
{% endhighlight %}

我们的回调函数在数据load完并执行的过程中就会被调用，是不是很像一次Ajax请求。

这就是JasonP。当然这种方式也需要服务器端的配合，也就相当于授权。其实还是没有违反同源策略。

#### 7. 利用iframe
基本原理是父窗口可以修改iframe的URL，而iframe可以是另一个域过来的内容。这样父窗口和iframe里面的脚本就可以利用URL（主要是锚点#之后的部分）或者是window.name属性（该属性在URL变化时不变，这样iframe里的脚本先把信息存到该属性上，父窗口在把iframe的URL改回到自己的域后可以读出该值）进行通信。同样是要有服务器端的配合。

### 跨域攻击
由于http是个无状态协议，但服务器端不可能让用户每个操作都输一遍密码，所以一个比较常见的做法是用cookie存用户的token，在http请求进来后检查cookie确定是哪个用户。

一般情况下cookie是受同源策略的保护，但还是有些攻击方式，例如CSRF和XSS。

#### CSRF
跨站请求伪造，是指利用某些方式绕过浏览器同源策略，访问另外一个网站下的webservice。如果你登录过那个网站并在浏览器里留下了cookie，恶意脚本在你不知情的情况下可以进行某些操作（例如发垃圾邮件，获取通信录等）。

在后端不授权的情况下，绕过同源策略有两种，一种是利用&lt;img&gt;等html元素加载时发起GET请求，另一种是利用表单（见上一节第5点），发起POST等各种类型的跨域请求。

对这种攻击一般是采取后端防护，对关键操作要求客户端传过来cookie中token（恶意脚本尽管能发起http头中带有cookie的跨域请求，但cookie是浏览器自动加上去的；如果要在请求的参数中提供token值，恶意脚本一般是拿不到的）或验证码。

#### XSS
跨站脚本攻击，是指通过某些方式把浏览器中的cookie“**偷**”出来。一般出现在允许用户上传或编辑自定义内容的网站上，例如博客，SNS等。攻击方式是恶意用户利用网站漏洞，进行脚本注入，生成了一些含有恶意代码的页面。当用户访问这些页面的时候，这个网站上的token被这些恶意代码发送到一个第三方远程的服务器上。这样在用户的token没有失效之前，恶意用户就获得了当前用户的权限。

对这种攻击的防护措施一般有对用户上传内容进行转义处理，或者在服务器返回页面的http头部加入http-only字段，这样cookie就无法通过浏览器端脚本获取了。

### 总结
本文总结和梳理了跟跨域有关的知识。笔者能力有限，欢迎指正。

{% raw %}
<script src="http://libs.useso.com/js/jquery/2.1.1/jquery.min.js"></script>
<script>
function clickme() {
    $.get("http://www.github.com");
}
</script>
{% endraw %}
