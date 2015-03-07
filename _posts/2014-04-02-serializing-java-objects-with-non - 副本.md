---
layout: post
title: 怎样对带有不可序列化属性的Java对象进行序列化
abstract: 出于很多原因我们想使用自定义的序列化方法取代Java默认的机制。一个最常见的原因是提高性能，而另一个原因是有时候我们无法使用默认的序列化方法。在这篇文章中，我们具体来讨论怎样通过定制的序列化方法，对一个较大的、带有不可序列化属性的对象进行序列化。
---
<div class="message">
本文在<a href="http://www.importnew.com/10705.html">ImportNew</a>上发表，原文来自<a href="http://marxsoftware.blogspot.com/2014/02/serializing-java-objects-with-non.html">marxsoftware</a>。转载请保留原文出处、译者和译文链接。
</div>

出于很多原因我们想使用自定义的序列化方法取代Java默认的机制。一个最常见的原因是提高性能，而另一个原因是有时候我们无法使用默认的[序列化方法](http://www.ibm.com/developerworks/library/j-5things1/)。在这篇文章中，我们具体来讨论怎样通过定制的序列化方法，对一个较大的、带有[不可序列化属性](http://stackoverflow.com/questions/7290777/java-custom-serialization/7292035#7292035)的对象进行[序列化](http://docs.oracle.com/javase/tutorial/jndi/objects/serial.html)。

下面这段代码定义了一个简单的类。它可以把一个给定的对象序列化到一个指定的文件，或者从相同的文件中把对象反序列化出来。在这片文章中，我将使用这个类进行演示。

下面这段代码给出了一个使用SerializationDemonstrator类序列化和反序列化标准的Java字符串的例子。字符串是支持序列化的。代码之后的截图显示了在Netbeans中运行该类的serialize和deserialize方法后的输出。

下面这两段代码定义了Person和CityState两个类。CityState是Person的一个属性。可以看到尽管Person实现了Serializable接口，CityState却没有。

下面这段代码演示了使用SerializationDemonstrator序列化Person类。由于包含了一个不可序列化的属性CityState，在之后截图里，我们可以看到Netbean抛出了异常。

![placeholder](/public/images/serializationDemonstratorOnSerializablePersonNonSerializableCityState.png "")

在这个例子里，由于CityState类是我们自己写的，我们可以使它支持序列化。但是如果这个类属于一个第三方的框架或者库，我们就很难去修改这个类。但是我们可以修改Person类，通过使用自定义的序列化和反序列化方法，使它和CityState类一起正常工作。下面这段代码定义了一个从Person类改过来的SerializablePerson类。

在上面这段代码中，SerializablePerson有自定义的writeobject和readObject方法。它们以适当的方式处理CityState的序列化和反序列化。下面这段代码使用SerializationDemonstrator运行了这个类，我们可以看到这次的运行是成功的。

![placeholder](/public/images/serializationDemonstratorOnSerializablePersonPlusNonSerializableCityState.png "")

上面描述的这个方法可以允许我们在一个可序列化的类中使用不可序列化的属性，而且不需要transient。现在看上去已经挺不错了，但是如果前面这个CityState要在多个需要序列化的类中使用，更好的方式是用一个支持序列化的Decorator去修饰CityState。然后在那些需要做序列化的类中使用这个Decorator。下面这段代码定义了SerializableCityState。它是CityState的一个支持序列化的Decorator版本。

这个可序列化的Decorator可以在Person类中直接使用。由于所有的属性都支持序列化，Person类可以使用默认的序列化方法。下面这段代码定义了一个从Person类改过来的Person2类

下面这段代码运行了这个类。之后是NetBeans输出的截图。

![placeholder](/public/images/serializedOutputDemoPerson2SerializedCityState.png "")

通过使用定制的序列化方法，可以在不使用transient的情况下，对一个带有不可序列化属性的类进行序列化。当你要在一个需要序列化的类中使用不可序列化的类型，并且这些类型不能被修改时，这是一个有用的技术。\
