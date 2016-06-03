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

###一个简单的JNI项目
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
{% highlight c %}
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

###在Maven中构建
基本思路是，我们创建一个Maven项目Greeting，这个项目包含两个子项目native和jni，其中native生成so文件，jni生成class文件以及打成jar包。

创建文件夹
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>mkdir Greeting</code>
</pre>
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>mkdir -p Greeting/native/src/main/c/jni</code>
</pre>
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>mv Greeting.c Greeting/native/src/main/c/jni</code>
</pre>
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>mkdir -p Greeting/jni/src/main/java</code>
</pre>
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>mv Greeting.java Greeting/jni/src/main/java</code>
</pre>

创建Greeting项目的pom.xml文件
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.github.yiheng</groupId>
    <artifactId>greeting</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>native</module>
        <module>jni</module>
    </modules>
</project>
{% endhighlight %}

创建native项目的pom.xml文件
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns="http://maven.apache.org/POM/4.0.0"
 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
 <modelVersion>4.0.0</modelVersion>

 <parent>
     <groupId>io.github.yiheng</groupId>
     <artifactId>greeting</artifactId>
     <version>0.0.1-SNAPSHOT</version>
 </parent>
 <artifactId>greeting_native</artifactId>
 <packaging>so</packaging>

 <build>
     <plugins>
         <plugin>
             <artifactId>maven-compiler-plugin</artifactId>
         </plugin>
         <plugin>
             <groupId>org.codehaus.mojo</groupId>
             <artifactId>native-maven-plugin</artifactId>
             <version>1.0-alpha-8</version>
             <extensions>true</extensions>
             <configuration>
                 <compilerProvider>generic-classic</compilerProvider>
                 <compilerExecutable>gcc</compilerExecutable>
                 <linkerExecutable>gcc</linkerExecutable>
                 <sources>
                     <source>
                         <directory>${basedir}/src/main/c/jni</directory>
                         <fileNames>
                             <fileName>Greeting.c</fileName>
                         </fileNames>
                     </source>
                 </sources>
                 <compilerStartOptions>
                     <compilerStartOption>-I ${JAVA_HOME}/include/</compilerStartOption>
                     <compilerStartOption>-I ${JAVA_HOME}/include/linux/</compilerStartOption>
                 </compilerStartOptions>
                 <compilerEndOptions>
                     <compilerEndOption>-shared</compilerEndOption>
                     <compilerEndOption>-fPIC</compilerEndOption>
                 </compilerEndOptions>
                 <linkerStartOptions>
                     <linkerStartOption>-I ${JAVA_HOME}/include/</linkerStartOption>
                     <linkerStartOption>-I ${JAVA_HOME}/include/linux/</linkerStartOption>
                 </linkerStartOptions>
                 <linkerEndOptions>
                     <linkerEndOption>-shared</linkerEndOption>
                     <linkerEndOption>-fPIC</linkerEndOption>
                 </linkerEndOptions>
                 <linkerFinalName>libgreeting</linkerFinalName>
             </configuration>
         </plugin>
     </plugins>
 </build>
</project>
{% endhighlight %}

这里我们使用了一个叫做native-maven-plugin的插件编译我们的native代码，本质上相当于执行了一条gcc命令。

然后是jni项目的pom.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://maven.apache.org/POM/4.0.0"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>io.github.yiheng</groupId>
        <artifactId>greeting</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>
    <artifactId>greeting_jni</artifactId>
    <packaging>jar</packaging>

    <build>
        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
{% endhighlight %}

在Greeting目录下面，执行
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>mvn compile</code>
</pre>

我们可以看到在编译成功，并在native/target下生成了so文件，在jni/target/classes下生成了class文件。

把它们拷到一起
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>cp jni/target/classes/Greeting.class ./</code>
</pre>
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>cp native/target/libgreeting.so ./</code>
</pre>
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>java Greeting</code>
</pre>

打印出Goodby World！消息。

未完待续。。。