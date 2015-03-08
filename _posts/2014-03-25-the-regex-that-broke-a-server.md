---
layout: post
title: 一个正则式引发的血案
abstract: 我从来没有想到我可以看到一个差劲的正则式造成一台服务器没有响应。但它偏偏就在我们的一个服务器上面发生了，结果导致了它毫无响应。
---
<div class="message">
本文在<a href="http://www.importnew.com/10308.html">ImportNew</a>上发表，原文来自<a href="http://vladmihalcea.com/2014/02/24/the-regex-that-broke-a-server/">vladmihalcea</a>。转载请保留原文出处、译者和译文链接。
</div>

我从来没有想到我可以看到一个差劲的正则式造成一台服务器没有响应。但它偏偏就在我们的一个服务器上面发生了，结果导致了它毫无响应。

假设我们在解析一些外部汽车经销商的信息。我们想在各种各样的输入中找到那些带"no air conditioning"的汽车，同时不要匹配那些诸如"mono air conditioning"的模式。

那个搞挂我们服务器的正则式类似于这样：

{% highlight java %}
Pattern pattern = Pattern.compile("^(?:.*?(?:\\s|,)+)*no\\s+air\\s+conditioning.*$");
{% endhighlight %}

两分钟后，这个测试还没有停止并且一个CPU核已经满负载运行了。

![placeholder](/public/images/regex-overload.png "")

首先，我们是在整个输入数据上使用[matches](http://docs.oracle.com/javase/7/docs/api/java/util/regex/Matcher.html#matches%28%29)方法的，所以不需要开始(^)和结束($)匹配符。其次，由于输入字符串中存在换行符，我们必须让正则式运行在[多行模式](http://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html#MULTILINE)下：

{% highlight java %}
Pattern pattern = Pattern.compile("(?:.*?(?:\\s|,)+)*no\\s+air\\s+conditioning.*?", Pattern.MULTILINE);
{% endhighlight %}

让我们看一看不同版本的正则式的行为：
<table>
  <thead>
    <tr>
      <th>正则式</th>
      <th>运行时间（毫秒）</th>
      <th>评价</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>"(?:.*?(?:\\s|,)+)*no\\s+air\\s+conditioning.*?"</td>
      <td>35699.334</td>
      <td>这个方法等的花儿都谢了。</td>
    </tr>
    <tr>
      <td>"(?:.*?(?:\\s|,)+)?no\\s+air\\s+conditioning.*?"</td>
      <td>108.686</td>
      <td>非捕获组不需要*量词(原文是+，作者应该写错了吧)，所以我们用?量词代替。</td>
    </tr>
    <tr>
      <td>"(?:.*?\\b)?no\\s+air\\s+conditioning.*?"</td>
      <td>153.636</td>
      <td>上一个方法只是匹配了用空白字符(\s)或逗号(,)分割输入数据的情况，这个方法适用于更多的情况。</td>
    </tr>
    <tr>
      <td>"\\bno\\s+air\\s+conditioning"</td>
      <td>78.831</td>
      <td>Find比起matches更快，并且我们只对这个模式第一次出现的地方感兴趣。</td>
    </tr>
  </tbody>
</table>

### 为什么不用[String.indexOf()](http://docs.oracle.com/javase/7/docs/api/java/lang/String.html#indexOf%28java.lang.String%29)
尽管它应该比正则式快很多，但我们仍需要考虑字符串开始的情况，例如一些像”mono air conditioning”的模式；以及用制表符或多个空格符分开的输入。像这样自定制的实现可能会快一些，但都缺少灵活性而且需要更多的时间去实现。

### 结论
正则式是模式匹配的利器，但你不应该随心所欲的使用它。因为很小的改变可能带来很大的不同。第一个正则式事与愿违的原因是由于[catastrophic backtracking](http://www.regular-expressions.info/catastrophic.html)。这是一个每位开发者在写正则式之前都应当注意的一个现象。

<div class="message">
关于作者：Vlad Mihalcea是一个专注于软件集成，高可扩展性和并发编程挑战的软件架构师
</div>

