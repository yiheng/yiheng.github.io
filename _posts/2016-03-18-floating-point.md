---
layout: post
title: 双精度，单精度和半精度
abstract: 同学，你听说过半精度吗？
tags: [data-structure]
---

浮点数是计算机上最常用的数据类型之一，有些语言甚至数值只有浮点型（Perl，Lua同学别跑，说的就是你）。

常用的浮点数有双精度和单精度。除此之外，还有一种叫半精度的东东。

双精度64位，单精度32位，半精度自然是16位了。

半精度是英伟达在2002年搞出来的，双精度和单精度是为了计算，而半精度更多是为了降低数据传输和存储成本。

很多场景对于精度要求也没那么高，例如分布式深度学习里面，如果用半精度的话，比起单精度来可以节省一半传输成本。考虑到深度学习的模型可能会有几亿个参数，使用半精度传输还是非常有价值的。

Google的TensorFlow就是使用了16位的浮点数，不过他们用的不是英伟达提出的那个标准，而是直接把32位的浮点数小数部分截了。据说是为了更less computation expensive。。。

比较下几种浮点数的layout:

![placeholder](/public/images/floating-point-1.png "双精度浮点")

![placeholder](/public/images/floating-point-2.png "单精度浮点")

![placeholder](/public/images/floating-point-3.png "半精度浮点")

它们都分成3部分，符号位，指数和尾数。不同精度只不过是指数位和尾数位的长度不一样。

解析一个浮点数就5条规则

1. 如果指数位全零，尾数位是全零，那就表示0
2 如果指数位全零，尾数位是非零，就表示一个很小的数（subnormal），计算方式(−1)signbit×2−126× 0.significandbits
3. 如果指数位全是1，尾数位是全零，表示正负无穷
4. 如果指数位全是1，尾数位是非零，表示不是一个数NAN
5. 剩下的计算方式为(−1)signbit×2exponentbits−127× 1.significandbits

常用的语言几乎都不提供半精度的浮点数，这时候需要我们自己转化。

具体可以参考Numpy里面的代码：

<https://github.com/numpy/numpy/blob/master/numpy/core/src/npymath/halffloat.c#L466>

当然按照TensorFlow那么玩的话就很简单了。

参考资料：
<https://en.wikipedia.org/wiki/Half-precision_floating-point_format>

<https://en.wikipedia.org/wiki/Double-precision_floating-point_format>

<https://en.wikipedia.org/wiki/Single-precision_floating-point_format>

<http://download.tensorflow.org/paper/whitepaper2015.pdf>

