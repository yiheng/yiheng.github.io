---
layout: post
title: 使用Maven构建发布JNI项目
abstract: Maven是Java项目构建利器。当Java中项目包含Native代码的时候，Maven仍然能够优雅的支持。这篇文章总结了如何使用Maven构建一个JNI的Java项目。
tags: [java, maven]
draft: 1
---

Maven是Java世界必备的开发工具。它完美的解决了Java项目定义、依赖、构建和发布等诸多环节的问题。

当项目中使用JNI的时候，我们不仅要编译Java代码，还要编译Native代码。Java类文件要和Native代码生成的库文件（例如Linux下是so文件）一起才能
工作。这就需要我们考虑在Maven下怎样编译native代码、测试的时候怎样引入库文件、怎样发布库文件和类文件等问题。

幸运的是，我们在Maven的框架下仍然能够优雅的解决这个问题。这篇文章就总结了如何使用Maven构建、测试和发布一个最简单的JNI项目。这里我们设定开发
环境Linux。

1. 一个简单的JNI项目
在这个项目，我们通过JNI调用一段native代码打印“Goodbye World!”

####Greeting.java:
{% highlight java %}
class Greeting {
    static {
        System.loadLibrary("greeting");
    }

    public static void main(String[] args) {
        Greeting.greeting();
    }

    public static native void greeting();
}
{% endhighlight %}

代码很简单。JVM在装载Class的时候，会去load一个greeting的动态链接库，也就是一个叫libgreeting.so的文件。在main里面会调用greeting函数，
而该函数被声明成native的，也就是会调用native的实现。这里我们不用package。

编译一下
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>javac Greeting.java</code>
</pre>

我们看到生成Greeting.class的文件。

生成头文件
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>javah Greeting</code>
</pre>

这就生成了我们应该实现的C文件的接口。

####C代码 Greeting.c:
{% highlight java %}
#include <jni.h>
#include <stdio.h>

JNIEXPORT void JNICALL Java_Greeting_greeting(JNIEnv * jenv, jclass jcls) {
    printf("Goodbye World!\n");
}
{% endhighlight %}

很简单，在实现里调用stdio的printf打印信息。

编译C代码
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>gcc Greeting.c -o libgreeting.so -I $JAVA_HOME/include/ -I $JAVA_HOME/include/linux/ -shared -fPIC</code>
</pre>

生成文件名是我们前面提到的libgreeting.so。这里$JAVA_HOME是你的jdk安装路径。我们生成的是动态链接文件，所以编译时要添加-shared和-fPIC。

运行程序
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>java Greeting</code>
</pre>

可以看到打印出
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>Goodbye World!</code>
</pre>

未完待续。。。