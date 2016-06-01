---
layout: post
title: 使用Maven构建发布JNI项目
abstract: Maven是Java项目构建利器。当Java中项目包含Native代码的时候，Maven仍然能够优雅的支持。这篇文章总结了如何使用Maven构建一个JNI的Java项目。
tags: [java, maven]
draft: 1
---

Maven是Java世界必备的开发工具。它完美的解决了Java项目定义、依赖、构建和发布等诸多环节的问题。

当项目中使用JNI的时候，我们不仅要编译Java代码，还要编译Native代码。Java类文件要和Native代码生成的库文件（例如Linux下是so文件）一起才能工作。这就需要我们考虑在Maven下怎样编译native代码、测试的时候怎样引入库文件、怎样发布库文件和类文件等问题。

幸运的是，我们在Maven的框架下仍然能够优雅的解决这个问题。这篇文章就总结了如何使用Maven构建、测试和发布一个最简单的JNI项目。

我们设定开发环境Linux。

未完待续。。。