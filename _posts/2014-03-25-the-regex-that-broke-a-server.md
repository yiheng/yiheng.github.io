---
layout: post
title: 一个正则式引发的血案
abstract: 我从来没有想到我可以看到一个差劲的正则式造成一台服务器没有响应。但它偏偏就在我们的一个服务器上面发生了，结果导致了它毫无响应。
---
<div class="message">
本文在<a href="http://www.importnew.com/10308.html">ImportNew</a>上发表，原文来自<a href="http://vladmihalcea.com/2014/02/24/the-regex-that-broke-a-server/">vladmihalcea</a>。转载请保留原文出处、译者和译文链接。
</div>

我从来没有想到我可以看到一个差劲的正则式造成一台服务器没有响应。但它偏偏就在我们的一个服务器上面发生了，结果导致了它毫无响应。

假设我们在解析一些外部汽车经销商的信息。我们想在各种各样的输入中找到那些带”no air conditioning”的汽车，同时不要匹配那些诸如”mono air conditioning”的模式。

那个搞挂我们服务器的正则式类似于这样：

{% highlight java %}
String TEST_VALUE = "ABS, traction control, front and side airbags, Isofix child seat anchor points, no air conditioning, electric windows, \r\nelectrically operated door mirrors";

double start = System.nanoTime();

Pattern pattern = Pattern.compile("^(?:.*?(?:\\s|,)+)*no\\s+air\\s+conditioning.*$");

assertTrue(pattern.matcher(TEST_VALUE).matches());

double end = System.nanoTime();

LOGGER.info("Took {} micros", (end - start) / (1000 ));
{% endhighlight %}

两分钟后，这个测试还没有停止并且一个CPU核已经满负载运行了。

![placeholder](/public/images/regex-overload.png "ddd")

首先，我们是在整个输入数据上使用[matches](http://docs.oracle.com/javase/7/docs/api/java/util/regex/Matcher.html#matches%28%29)方法的，所以不需要开始(^)和结束($)匹配符。其次，由于输入字符串中存在换行符，我们必须让正则式运行在[多行模式](http://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html#MULTILINE)下：

<div class="message">
关于作者：Vlad Mihalcea是一个专注于软件集成，高可扩展性和并发编程挑战的软件架构师
</div>
