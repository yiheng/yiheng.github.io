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

#### SerializationDemonstrator.java

{% highlight java %}
package dustin.examples.serialization;
 
import static java.lang.System.out;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
 
/**
 * Simple serialization/deserialization demonstrator.
 *
 * @author Dustin
 */
public class SerializationDemonstrator
{
   /**
    * Serialize the provided object to the file of the provided name.
    * @param objectToSerialize Object that is to be serialized to file; it is
    *     best that this object have an individually overridden toString()
    *     implementation as that is used by this method for writing our status.
    * @param fileName Name of file to which object is to be serialized.
    * @throws IllegalArgumentException Thrown if either provided parameter is null.
    */
   public static  void serialize(final T objectToSerialize, final String fileName)
   {
      if (fileName == null)
      {
         throw new IllegalArgumentException(
            "Name of file to which to serialize object to cannot be null.");
      }
      if (objectToSerialize == null)
      {
         throw new IllegalArgumentException("Object to be serialized cannot be null.");
      }
      try (FileOutputStream fos = new FileOutputStream(fileName);
           ObjectOutputStream oos = new ObjectOutputStream(fos))
      {
         oos.writeObject(objectToSerialize);
         out.println("Serialization of Object " + objectToSerialize + " completed.");
      }
      catch (IOException ioException)
      {
         ioException.printStackTrace();
      }
   }
 
   /**
    * Provides an object deserialized from the file indicated by the provided
    * file name.
    *
    * @param  Type of object to be deserialized.
    * @param fileToDeserialize Name of file from which object is to be deserialized.
    * @param classBeingDeserialized Class definition of object to be deserialized
    *    from the file of the provided name/path; it is recommended that this
    *    class define its own toString() implementation as that will be used in
    *    this method's status output.
    * @return Object deserialized from provided filename as an instance of the
    *    provided class; may be null if something goes wrong with deserialization.
    * @throws IllegalArgumentException Thrown if either provided parameter is null.
    */
   public static  T deserialize(final String fileToDeserialize, final Class classBeingDeserialized)
   {
      if (fileToDeserialize == null)
      {
         throw new IllegalArgumentException("Cannot deserialize from a null filename.");
      }
      if (classBeingDeserialized == null)
      {
         throw new IllegalArgumentException("Type of class to be deserialized cannot be null.");
      }
      T objectOut = null;
      try (FileInputStream fis = new FileInputStream(fileToDeserialize);
           ObjectInputStream ois = new ObjectInputStream(fis))
      {
         objectOut = (T) ois.readObject();
         out.println("Deserialization of Object " + objectOut + " is completed.");
      }
      catch (IOException | ClassNotFoundException exception)
      {
         exception.printStackTrace();
      }
      return objectOut;
   }
}
{% endhighlight %}

下面这段代码给出了一个使用SerializationDemonstrator类序列化和反序列化标准的Java字符串的例子。字符串是支持序列化的。代码之后的截图显示了在Netbeans中运行该类的serialize和deserialize方法后的输出。

#### Running SerializationDemonstrator Methods on String

{% highlight java %}
SerializationDemonstrator.serialize("Inspired by Actual Events", "string.dat");
final String stringOut = SerializationDemonstrator.deserialize("string.dat", String.class);
{% endhighlight %}

![pb](/public/images/outputStringSerializationDemonstrator.png "")

下面这两段代码定义了Person和CityState两个类。CityState是Person的一个属性。可以看到尽管Person实现了Serializable接口，CityState却没有。

#### Person.java

{% highlight java %}
package dustin.examples.serialization;  
 
import java.io.Serializable;  
 
/** 
 * Person class. 
 *  
 * @author Dustin 
 */ 
public class Person implements Serializable  
{  
   private String lastName;  
   private String firstName;  
   private CityState cityAndState;  
 
   public Person(  
      final String newLastName, final String newFirstName,  
      final CityState newCityAndState)  
   {  
      this.lastName = newLastName;  
      this.firstName = newFirstName;  
      this.cityAndState = newCityAndState;  
   }  
 
   public String getFirstName()  
   {  
      return this.firstName;  
   }  
 
   public String getLastName()  
   {  
      return this.lastName;  
   }  
 
   @Override 
   public String toString()  
   {  
      return this.firstName + " " + this.lastName + " of " + this.cityAndState;  
   }  
}
{% endhighlight %}

#### CityState.java

{% highlight java %}
package dustin.examples.serialization;  
 
/** 
 * Simple class storing city and state names that is NOT Serializable. 
 *  
 * @author Dustin 
 */ 
public class CityState  
{  
   private final String cityName;  
   private final String stateName;  
 
   public CityState(final String newCityName, final String newStateName)  
   {  
      this.cityName = newCityName;  
      this.stateName = newStateName;  
   }  
 
   public String getCityName()  
   {  
      return this.cityName;  
   }  
 
   public String getStateName()  
   {  
      return this.stateName;  
   }  
 
   @Override 
   public String toString()  
   {  
      return this.cityName + ", " + this.stateName;  
   }  
}
{% endhighlight %}

下面这段代码演示了使用SerializationDemonstrator序列化Person类。由于包含了一个不可序列化的属性CityState，在之后截图里，我们可以看到Netbean抛出了异常。

#### Running SerializationDemonstrator Methods on Serializable Person with Non-Serializable CityState

{% highlight java %}
final Person personIn = new Person("Flintstone", "Fred", new CityState("Bedrock", "Cobblestone"));  
SerializationDemonstrator.serialize(personIn, "person.dat");  
 
final Person personOut = SerializationDemonstrator.deserialize("person.dat", Person.class);
{% endhighlight %}

![placeholder](/public/images/serializationDemonstratorOnSerializablePersonNonSerializableCityState.png "")

在这个例子里，由于CityState类是我们自己写的，我们可以使它支持序列化。但是如果这个类属于一个第三方的框架或者库，我们就很难去修改这个类。但是我们可以修改Person类，通过使用自定义的序列化和反序列化方法，使它和CityState类一起正常工作。下面这段代码定义了一个从Person类改过来的SerializablePerson类。

#### SerializablePerson.java

{% highlight java %}
package dustin.examples.serialization;  
 
import java.io.IOException;  
import java.io.InvalidObjectException;  
import java.io.ObjectInputStream;  
import java.io.ObjectOutputStream;  
import java.io.ObjectStreamException;  
import java.io.Serializable;  
 
/** 
 * Person class. 
 *  
 * @author Dustin 
 */ 
public class SerializablePerson implements Serializable  
{  
   private String lastName;  
   private String firstName;  
   private CityState cityAndState;  
 
   public SerializablePerson(  
      final String newLastName, final String newFirstName,  
      final CityState newCityAndState)  
   {  
      this.lastName = newLastName;  
      this.firstName = newFirstName;  
      this.cityAndState = newCityAndState;  
   }  
 
   public String getFirstName()  
   {  
      return this.firstName;  
   }  
 
   public String getLastName()  
   {  
      return this.lastName;  
   }  
 
   @Override 
   public String toString()  
   {  
      return this.firstName + " " + this.lastName + " of " + this.cityAndState;  
   }  
 
   /** 
    * Serialize this instance. 
    *  
    * @param out Target to which this instance is written. 
    * @throws IOException Thrown if exception occurs during serialization. 
    */ 
   private void writeObject(final ObjectOutputStream out) throws IOException  
   {  
      out.writeUTF(this.lastName);  
      out.writeUTF(this.firstName);  
      out.writeUTF(this.cityAndState.getCityName());  
      out.writeUTF(this.cityAndState.getStateName());  
   }  
 
   /** 
    * Deserialize this instance from input stream. 
    *  
    * @param in Input Stream from which this instance is to be deserialized. 
    * @throws IOException Thrown if error occurs in deserialization. 
    * @throws ClassNotFoundException Thrown if expected class is not found. 
    */ 
   private void readObject(final ObjectInputStream in) throws IOException, ClassNotFoundException  
   {  
      this.lastName = in.readUTF();  
      this.firstName = in.readUTF();  
      this.cityAndState = new CityState(in.readUTF(), in.readUTF());  
   }  
 
   private void readObjectNoData() throws ObjectStreamException  
   {  
      throw new InvalidObjectException("Stream data required");  
   }  
}  
{% endhighlight %}

在上面这段代码中，SerializablePerson有自定义的writeobject和readObject方法。它们以适当的方式处理CityState的序列化和反序列化。下面这段代码使用SerializationDemonstrator运行了这个类，我们可以看到这次的运行是成功的。

#### Running SerializationDemonstrator on SerializablePerson

{% highlight java %}
final SerializablePerson personIn = new SerializablePerson("Flintstone", "Fred", new CityState("Bedrock", "Cobblestone"));  
SerializationDemonstrator.serialize(personIn, "person1.dat");  
 
final SerializablePerson personOut = SerializationDemonstrator.deserialize("person1.dat", SerializablePerson.class);
{% endhighlight %}

![placeholder](/public/images/serializationDemonstratorOnSerializablePersonPlusNonSerializableCityState.png "")

上面描述的这个方法可以允许我们在一个可序列化的类中使用不可序列化的属性，而且不需要transient。现在看上去已经挺不错了，但是如果前面这个CityState要在多个需要序列化的类中使用，更好的方式是用一个支持序列化的Decorator去修饰CityState。然后在那些需要做序列化的类中使用这个Decorator。下面这段代码定义了SerializableCityState。它是CityState的一个支持序列化的Decorator版本。

#### SerializableCityState.java

{% highlight java %}
package dustin.examples.serialization;  
 
import java.io.IOException;  
import java.io.InvalidObjectException;  
import java.io.ObjectInputStream;  
import java.io.ObjectOutputStream;  
import java.io.ObjectStreamException;  
import java.io.Serializable;  
 
/** 
 * Simple class storing city and state names that IS Serializable. This class 
 * decorates the non-Serializable CityState class and adds Serializability. 
 *  
 * @author Dustin 
 */ 
public class SerializableCityState implements Serializable  
{  
   private CityState cityState;  
 
   public SerializableCityState(final String newCityName, final String newStateName)  
   {  
      this.cityState = new CityState(newCityName, newStateName);  
   }  
 
   public String getCityName()  
   {  
      return this.cityState.getCityName();  
   }  
 
   public String getStateName()  
   {  
      return this.cityState.getStateName();  
   }  
 
   @Override 
   public String toString()  
   {  
      return this.cityState.toString();  
   }  
 
   /** 
    * Serialize this instance. 
    *  
    * @param out Target to which this instance is written. 
    * @throws IOException Thrown if exception occurs during serialization. 
    */ 
   private void writeObject(final ObjectOutputStream out) throws IOException  
   {  
      out.writeUTF(this.cityState.getCityName());  
      out.writeUTF(this.cityState.getStateName());  
   }  
 
   /** 
    * Deserialize this instance from input stream. 
    *  
    * @param in Input Stream from which this instance is to be deserialized. 
    * @throws IOException Thrown if error occurs in deserialization. 
    * @throws ClassNotFoundException Thrown if expected class is not found. 
    */ 
   private void readObject(final ObjectInputStream in) throws IOException, ClassNotFoundException  
   {  
      this.cityState = new CityState(in.readUTF(), in.readUTF());  
   }  
 
   private void readObjectNoData() throws ObjectStreamException  
   {  
      throw new InvalidObjectException("Stream data required");  
   }  
}  
{% endhighlight %}

这个可序列化的Decorator可以在Person类中直接使用。由于所有的属性都支持序列化，Person类可以使用默认的序列化方法。下面这段代码定义了一个从Person类改过来的Person2类

#### Person2.java

{% highlight java %}
package dustin.examples.serialization;  
 
import java.io.Serializable;  
 
/** 
 * Person class. 
 *  
 * @author Dustin 
 */ 
public class Person2 implements Serializable  
{  
   private final String lastName;  
   private final String firstName;  
   private final SerializableCityState cityAndState;  
 
   public Person2(  
      final String newLastName, final String newFirstName,  
      final SerializableCityState newCityAndState)  
   {  
      this.lastName = newLastName;  
      this.firstName = newFirstName;  
      this.cityAndState = newCityAndState;  
   }  
 
   public String getFirstName()  
   {  
      return this.firstName;  
   }  
 
   public String getLastName()  
   {  
      return this.lastName;  
   }  
 
   @Override 
   public String toString()  
   {  
      return this.firstName + " " + this.lastName + " of " + this.cityAndState;  
   }  
}  
{% endhighlight %}

下面这段代码运行了这个类。之后是NetBeans输出的截图。

#### Running SerializationDemonstrator Against Person2/SerializableCityState

{% highlight java %}
final Person2 personIn = new Person2("Flintstone", "Fred", new SerializableCityState("Bedrock", "Cobblestone"));  
SerializationDemonstrator.serialize(personIn, "person2.dat");  
 
final Person2 personOut = SerializationDemonstrator.deserialize("person2.dat", Person2.class);
{% endhighlight %}

![placeholder](/public/images/serializedOutputDemoPerson2SerializedCityState.png "")

通过使用定制的序列化方法，可以在不使用transient的情况下，对一个带有不可序列化属性的类进行序列化。当你要在一个需要序列化的类中使用不可序列化的类型，并且这些类型不能被修改时，这是一个有用的技术。

