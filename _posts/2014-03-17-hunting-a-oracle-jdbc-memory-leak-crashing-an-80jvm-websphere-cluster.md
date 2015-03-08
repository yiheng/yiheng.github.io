---
layout: translate
title: 寻找导致80JVM WebSphere集群崩溃的罪魁祸首——Oracle JDBC内存泄露
abstract: 你是否在不断地过早重启你的JVM以防止它们内存耗尽？或者你已经收到了来自应用专家干巴巴的建议“增加Java堆空间”？ 本文介绍了一个由八个节点组成的集群（每个节点上运行了10个JVM，每个JVM的堆空间大小为4.1GB）的崩溃原因——Oracle JDBC内存泄露
---
<div class="message">
本文在<a href="http://www.importnew.com/10007.html">ImportNew</a>上发表，原文来自<a href="http://apmblog.compuware.com/2014/01/07/hunting-a-oracle-jdbc-memory-leak-crashing-an-80jvm-websphere-cluster/">compuware</a>。转载请保留原文出处、译者和译文链接。
</div>


你是否在不断地过早重启你的JVM以防止它们内存耗尽？或者你已经收到了来自应用专家干巴巴的建议“增加Java堆空间”？

我们有一个由八个节点组成的集群，每个节点上运行了10个JVM，每个JVM的堆空间大小为4.1GB。下面这张图表显示了这些JVM的内存消耗情况。这套系统被用在一个大型在线零售商店。它的JVM不断地耗尽内存，然后崩溃，并且有时导致整个主机挂掉。

![placeholder](/public/images/MemoryLeakOverMonths.png "从5月份开始所有的JVM显示出相同的内存消耗模式：用光了所有的4.1GB的堆空间直到崩溃。类似的模式有时甚至导致整个主机挂掉。")

应用团队对这个问题首先的“解决方法”是在机器上增加内存。但由于采购时间太长，他们决定更深入的去研究这个让人精疲力尽的内存问题的根源。

### 第一步：分析内存耗尽时的转储文件

每当这些JVM崩溃，它的APM模块都会主动的捕获一份完整的堆内存转储文件。这使得事后分析这个内存过度使用问题的根本原因变得十分方便。在这个场景里热点非常容易被识别出来。下面的这张截图显示出根源是22.7K的T4CStatement对象。他们消耗了大概2.6GB的堆空间。由于被一些全局静态变量引用，它们没有被垃圾回收器清除。

![placeholder](/public/images/MemoryDumpDetails.png "主要原因是数目不断增长的T4CStatement对象，它们消耗了2.6GB内存。由于仍然被引用，它们无法被垃圾回收器清除。")

### 第二步：谁在分配这些对象并且为什么它们没有被清除

对这些T4CStatement对象来源更近一步的分析，显示出只要通过createStatement中的allocateStatement方法执行一条SQL语句，它们就会被分配出来。而问题在于这些被分配的T4CStatement对象在相关连接被放回连接池的时候也不会被释放。

![placeholder](/public/images/AllocationInPurePath.png "每次新的语句执行时都会创建T4CStatement对象。问题在于这些对象在不需要之后从不会被清除。")

这就导致了这些对象一直在堆空间中存在，直到内存被耗尽。下面这张图显示出这些对象中的大部分在堆上存在了几个小时甚至几天。

![placeholder](/public/images/LongLivingObjectsOnHeap.png "堆的转储显示出这些对象在堆上存在了多少时间——验证了垃圾回收器从来不会清除它们。")

### 第三步：和供应商合作以解决这个问题

JDBC驱动的供应商Oracle深入的研究了相关代码。他们发现这些语句对象被保存在一个全局的变量中，所以它们不能被垃圾回收器回收。供应商提供了一个快速的修复方案，使得这些T4CStatement对象在数据库事务不再需要它们的时候不再存在。这解决了所有的崩溃问题，当然也降低了内存平均消耗。这还使得集群中的JVM被更高效的利用起来，并且在相同的环境下处理更多的负载而不用担心内存问题。

想了解更多的企业级内存管理？
我同样推荐看一看我们在线免费电子书中关于[内存管理](http://javabook.compuware.com/content/memory/how-garbage-collection-works.aspx)的章节。或者阅读一些其他的内存管理和内存泄露的博客文章，例如[解决JVM内存问题的开发运营之路](http://apmblog.compuware.com/2013/08/01/the-devops-way-to-solving-jvm-memory-issues/)，[在Java产品应用中修复内存泄露](http://apmblog.compuware.com/2013/05/07/fix-memory-leaks-in-java-production-applications/)或[常见Java内存问题](http://apmblog.compuware.com/2011/12/15/the-top-java-memory-problems-part-2/)。

<div class="message">
关于作者：Andreas Grabner有在Java和.Net领域十年以上的架构师和开发经历。现在他为Compuware担任技术策略师并且领导了Compuware应用性能管理中心的Excellence团队
</div>

