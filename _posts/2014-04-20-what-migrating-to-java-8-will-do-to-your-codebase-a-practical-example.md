---
layout: translate
title: Java 8会给你的代码带来什么——一个实际的例子
abstract: 无论你知道与否，Java 8就要来了。这个让人期盼已久的版本已经确定在三月18号发布，离现在只有一个月了。实际上，你已经可以下载和尝试候选版。（译者注：在翻译这篇文章的时候，Java8已经发布了；但这仍是一篇值得一读的介绍Java 8的文章。）
---
<div class="message">
本文在<a href="http://www.importnew.com/">ImportNew</a>上发表，原文来自<a href="http://zeroturnaround.com/rebellabs/what-migrating-to-java-8-will-do-to-your-codebase-a-practical-example/">zeroturnaround</a>。转载请保留原文出处、译者和译文链接。
</div>

### Java 8会怎样改变你的代码

无论你知道与否，Java 8就要来了。这个让人期盼已久的版本已经确定在三月18号发布，离现在只有一个月了。实际上，你已经可以[下载和尝试](https://jdk8.java.net/download.html)候选版。（译者注：在翻译这篇文章的时候，Java8已经发布了；但这仍是一篇值得一读的介绍Java 8的文章。）

从很多方面来说，这个版本十分重要。在各种重要的改进中，我认为Defender Method（译者注：也就是interface的default方法）的引入，是最有影响力的。它让标准库能以一种更容易的方式进行演化，这意味着以后的改进可能发布得更快。

当然，随着地球人都知道的lambda表达式的到来，Java和那些[更酷的JVM语言](http://zeroturnaround.com/rebellabs/the-adventurous-developers-guide-to-jvm-languages-java-scala-groovy-fantom-clojure-ceylon-kotlin-xtend/)更接近了。在这些语言中，函数作为一等公民已经好多年了。通过lambda，Java提供了块操作（也就是所谓的Stream API），以及更方便的并行计算。其它的变化包括一个重写的日期和时间API，改进的cryptographic primitives，Nashorn JS引擎，改进的fork Join框架和一堆方便并发的改进。

尽管这个“[到底什么已经改变了](http://openjdk.java.net/projects/jdk8/milestones)”的列表很长很长，但是并不是所有的改变对我们代码的影响都那么重要。他们中的有些，例如移除permenate generation space，并不直接作用于代码。

在这篇文章中，我会把一个兼容旧的Java语言规范的小项目，升级到Java8。我将手工做这次迁移，不会用到IDE提供的任何“神奇”的功能。通过这个练习，我们可以看到一个升级是怎样进行的，哪一部分最有挑战性，哪一部分比较平滑。

### 示例程序

在这个实验中，我选择了我最喜欢的zip处理库：[zt-zip](https://github.com/zeroturnaround/zt-zip)。选择zt-zip的主要原因如下：

1. 它是一个自由获取，开源的库，所以如果我把一些Java8的用法搞错了，一些更聪明的人会指出来。
2. 它现在是与Java4兼容的！所以里面有很多地方需要改变，这有好的一面也有坏的一面。新版本的代码会变化很大，但是这些更改很难应用在更新的Java版本的升级中。
3. 作为一个处理zip压缩包的库，它包含了很多对压缩文件的迭代，所以用stream会很方便，同时回调函数可以使用lambda。它也包含了一些反射API的使用，所以可以看到“[运行时带有名字的方法参数](http://openjdk.java.net/jeps/118)”是否会使反射更简洁一些。
4. 同时，这个源还包含一些单元测试，这或多或少可以对我的改进做一些验证。

*声明：我实际上是这个库的一个维护者，我对代码很熟悉。所以这个实验实际上可能会很有实用价值。*

### 移植细节

首先，让我们下载一份zt-zip源码最新的版本
> git clone git@github.com:zeroturnaround/zt-zip.git

这是一个Maven的项目，你可以把编译器插件的source和target版本设为1.8。

![placeholder](/public/images/java8-source-level-640x257.png "")

改好之后，运行测试时我们首先注意到runtime警告我们缺少permenate generation space。

> Java HotSpot(TM) 64-Bit Server VM warning: ignoring option MaxPermSize=384m; support was removed in 8.0

我还没有找到怎样让Maven不去指定PermGen选项。尽管有这些警告，由于所有的测试都通过了，所以我就忽略它了。如果你恰好知道怎么做，请在评论里告诉我，或者推特我[@shelajev](https://twitter.com/shelajev)。

接下来，我发现了下面这个lambda表达式的用武之地。

![placeholder](/public/images/java8-containsAny-is-nice-640x419.png "")

这段代码想做的是检查给定的文件是否是一个zip的压缩包，以及一些指定的文件是否在里面。

首先吸引我眼球的是，现在可以在数组上用Stream API做迭代，还有用lamda表达式，这一点都不像在写Java代码。并且，尽管这里是个最简单的例子，在真实的代码中看到这些比起在Turtrial和Workshop中有意义的多。

在Java中用Stream并不是在哪里都这么方便的。在下面这段代码中，我们在一组名称上迭代，检查对应的项是否是文件夹。这个方法的名字告诉我们它和stream会是好基友，即用一个[filter去过滤stream](http://download.java.net/jdk8/docs/api/java/util/stream/Stream.html#filter-java.util.function.Predicate-)的方法。

![ph](/public/images/java8-filter-dirs-proper-diff-640x535.png "")

我们在Java8中经常见到filter和collection的用法。个人来说，我不是很喜欢collection因为它太繁琐了。尤其是accumlating的部分。

另一件让我不爽的事情是stream不知道异常（例如，checked exception）。我想在作为参数的lamda中抛一个异常来终止迭代，并在我想要的地方退出。但是，由于函数的signature不支持throws语句，我不得不用try catch把我的lambda表达式包起来，然后还要再把整个迭代包一遍，只是为了覆盖不能打开文件的情况。

同样如果你用break中断了一个循环，这也很难在stream的世界里进行模拟。一个方法是通过异常实现，但当你开始时不时的使用**BreakingIteration**异常时，你的代码很快会变的非常难看。

还有，你应该慎用**Stream.parallel()**方法。你可以十分容易得引入它，并且看起来是个很好的想法。但它并不一定能改进性能，而且可能产生你测试中检查不出来的并发的bug。

我们在zt-zip中跟日期和时间打交道的地方不多，所以没有找到一个地方可以试试新的API。而且我设定的实验时间到了，这里就不再展示更多了。

### 结论

从开发者的角度，Java8比以前的任何一个版本都好。它不会平息所有的关于Java代码过于冗余的抱怨，也没有包含到目前为止出现的所有人性化编程的功能。尽管如此，**lambda表达式的引入和把函数作为一等公民**，让编程过程变的更加让人享受。

Java 8中大量的小函数，回调函数和错误报告有了更好的可读性。易于上手和使用的Stream API，尽管不是所有for循环现成的替代品，并且有时候会导致代码更乱，但仍是库一个良好的添加。

在迁移项目时，有两件事情你需要记得，否则你会后悔的。

* 良好的单元测试覆盖
* IDE支持

由于我对你项目里的测试无能为力，至少我可以分享一些关于IDE Java8支持功能的链接。

1. **IntelliJ IDEA**很早就有支持Java8的[版本](http://www.jetbrains.com/idea/)。提供一些优化例如，把匿名类转化为lambda函数，在lambda表达式和语句中前进和后退，编辑器上的警告。在这个实验中有这样的支持是一件非常好的事情。
2. **Eclipse**也会很快发布它支持java8的正式版。现在你可以使用它的[测试版](https://wiki.eclipse.org/JDT_Core/Java8)。
3. **Netbean**在版本[7.4](https://netbeans.org/downloads/index.html)之后也开始支持java8了。

如果你以前没有玩过java8，可以试一试。框架和工具已经有了。不要忘了Java8不仅会带给你健壮性，对于性能和安全性也是很有帮助。

