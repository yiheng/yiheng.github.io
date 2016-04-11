---
layout: post
title: 在Ubuntu上搭建Torch + GPU的深度学习开发环境
abstract: Torch是老牌的神经网络算法库，开发语言是lua + C。本文介绍在Ubuntu14.04上如何一步步搭建torch + GPU的开发环境，并在ImageNet2012的数据集上运行一个AlexNet的模型。
tags: [machine-learning,torch,deep-learning,gpu,neural-network]
---

前一段时间在折腾GPU和torch，遇到了一些坑。这里先把搭建环境这一块整理一下，省得之后到处查资料了。

先说下环境，操作系统是ubuntu14.04，显卡是Nvidia K80，比较坑的一点是机器是在防火墙后面，往外网只能通过http和https的代理。

首先瞄一下自己的显卡有没有被正确识别出来，没识别出来可以洗洗睡了。。。
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>lspci | grep -i nvidia</code>
</pre>

识别出来后先装个GCC。
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>sudo apt-get install build-essential</code>
</pre>

如果你也是在防火墙后面，要给apt加个代理，具体方式为在/etc/apt下面创建个apt.conf。里面加上
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>Acquire::http::Proxy "http://yourproxyaddress:proxyport";</code>
</pre>

然后装cuda，到[这里](https://developer.nvidia.com/cuda-downloads)上，选择linux然后x86\_64然后Ubuntu然后14.04然后runfile（我就是不用deb你咬我啊），然后把URL拷到终端，用wget + URL下载runfile。然后
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>sudo./runfile</code>
</pre>

这里如果要代理的话，需要把http\_proxy和https\_proxy设上代理地址。
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>export http\_proxy=http://yourproxyaddress:proxyport</code>
<code>export https\_proxy=http://yourproxyaddress:proxyport</code>
</pre>

使用sudo时自动使用代理
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>sudo visudo</code>
</pre>
然后加上
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>Defaults  env\_keep += "http\_proxy"</code>
<code>Defaults  env\_keep += "https\_proxy"</code>
</pre>

装好了之后，脚本会好心提示把/usr/local/cuda的bin路径加到你的PATH里，还有把/usr/local/cuda的lib路径加到你的ld.so.conf.d下面（新建一个conf文件）。之后不要忘了跑下
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>source ~/.bashrc</code>
<code>sudo ldconfig</code>
</pre>
让这些改动生效。

这时候可以打一下nvidia-smi看下是否能把全部显卡显示出来。

还有可以跑到刚刚安装上的nvdia samples文件夹下敲一下make，看看编译是否能正常通过。正常情况下会在bin文件夹下生成一堆可执行文件，跑一个应该能跑的起来。

这样cuda就应该装好了。下一步装torch。

先装个git
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>sudo apt-get install git</code>
</pre>

配置代理
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>git config --global http.proxy http://yourproxyaddress:proxyport</code>
<code>git config --global https.proxy http://yourproxyaddress:proxyport</code>
</pre>

由于是在防火墙后面，所以git://之类的url就都要换成https://打头的才能用。可以让git自动替换
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>git config --global url.https://github.com/.insteadOf git://github.com/</code>
</pre>

然后
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>git clone https://github.com/torch/distro.git ~/torch --recursive</code>
<code>cd ~/torch; bash install-deps;</code>
<code>./install.sh</code>
<code>source ~/.bashrc</code>
</pre>

在终端敲一下th，是否进入了torch的命令行环境？

要让torch使用gpu做开发，还要装几个lua的包
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>luarocks install cutorch</code>
<code>luarocks install cunn</code>
</pre>

到这里，开发环境基本就搞完了。可以跑个model来玩玩。

到[这里](http://image-net.org/download-images)下载2012年的imagenet数据集（train和validation）。下载好之后，在下载的文件夹下面执行
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>mkdir train && mv ILSVRC2012\_img\_train.tar train/ && cd train</code>
<code>tar -xvf ILSVRC2012\_img\_train.tar && rm -f ILSVRC2012\_img\_train.tar</code>
<code>find . -name "*.tar" | while read NAME ; do mkdir -p "${NAME%.tar}"; tar -xvf "${NAME}" -C "${NAME%.tar}"; rm -f "${NAME}"; done</code>
<code>cd ../ && mkdir val && mv ILSVRC2012\_img\_val.tar val/ && cd val && tar -xvf ILSVRC2012\_img\_val.tar</code>
<code>wget -qO- https://raw.githubusercontent.com/soumith/imagenetloader.torch/master/valprep.sh | bash
</code>
</pre>

然后把别人写好的代码拉下来。
<pre style="overflow:auto;word-wrap:inherit;white-space:pre;">
<code>git clone https://github.com/soumith/imagenet-multiGPU.torch.git</code>
<code>cd imagenet-multiGPU.torch</code>
<code>th main.lua -data path\_to\_imagenet\_folder</code>
</pre>

就可以开始跑了.

这个脚本有几个参数，例如

-nGPU 用几个GPU跑

-backend cudnn显卡跑，nn CPU跑

-nDonkeys 读文件的线程数，一般是CPU的核数

-netType 模型，默认AlexNetowtbn（带batch nomalization的单塔alexnet模型）

到这里，你就有了一套torch的深度学习开发环境了。

Happy to Hack！！！
