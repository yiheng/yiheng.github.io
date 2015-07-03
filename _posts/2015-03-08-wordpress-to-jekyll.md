---
layout: post
title: 个人博客的编译器 Jekyll
abstract: Wordpress是这个世界上最流行的博客网站程序。运行它需要一个服务器，一个php运行环境以及一个数据库。它集各种功能于一身，提供了成千上万插件和主题。但是，如果我们仅仅想建立一个写东西的博客，我们真的需要这么多功能和资源吗？答案是NO！如果你是一个Geek，可以尝试一下Jekyll。通过它可以搭建一个轻量、快速和灵活的个人博客。
tags: [web, blog, github-page, jekll]
---

当刚开始想搭建个人博客的时候，我选择的是[Wordpress](https://wordpress.com/)。它被广泛使用，成千上万的插件提供各种各样的功能，还有很多主题，以及移动端的支持。但当我玩了一段时间后发现，对于个人博客，Wordpress不是一个很好地解决方案。

大多数个人博客更偏向于一个静态网站。文章发布后就很少有变化，当然评论除外。而Wordpress是基于动态网站的解决方案的。动态网站的特点是功能强大，可以满足复杂的业务逻辑需求。但代价是需要更多的资源和响应时间。

刚开始使用Wordpress的时候，使用Apache + MySQL（同一个主机）。由于是个人博客，使用了AWS上最便宜的机子。结果内存使用率就没有下过95%，多开几个页面MySQL直接挂了。后来把MySQL移了出去，开了页面多了还是很慢。最后用Nginx + php-fpm替代Apache，效果也不是那么理想。

Wordpress的插件，虽然带来了功能上扩展的便利，但是以增加资源消耗为代价的。如果装了一个写的很挫的插件，整个网站都会被拖累。

还有备份问题，万一网站挂了怎么办，写的东西不都没了？一些插件提供了备份功能，但生成的备份文件怎么管理？备份的文件一定能恢复吗？在上次备份之后写的东西丢了怎么办？作为一个的程序猿，这些问题让我感到没底。

对于个人博客网站这样的静态网站来说，**最直接的方式写html上传到Nginx**，简单快速而且满足需求！但直接写html是太麻烦了，而且你还要维护文章列表这种每次发布新文章就要变化的页面。所以我们还是希望能有某种模板，只需要填入内容，就可以生成制定格式的html文件了。这样不仅简单快速，而且便捷。

然后我就找到了[Jekyll](http://jekyllrb.com/)！

### Jekyll

来自官网上的介绍

> Jekyll is a simple, blog-aware, static site generator. It takes a template directory containing raw text files in various formats, runs it through a converter (like Markdown) and our Liquid renderer, and spits out a complete, ready-to-publish static website suitable for serving with your favorite web server. Jekyll also happens to be the engine behind GitHub Pages, which means you can use Jekyll to host your project’s page, blog, or website from GitHub’s servers for free.

拿程序开发这事做对比，Wordpress这货就像一个脚本语言，每次你访问的时候都要编译一把（生成页面）；Jekyll就像C的编译器，在你访问之前就给你编译好（生成html页面），所以响应速度那是杠杠的。它还提到Jekyll是Github Pages的后端，所以使用Github Pages就是在使用Jekyll。

### 使用Jekyll

我们先从搭一个能跑的网站开始，[五步开始使用GitHub Pages](https://pages.github.com/)。

现在已经有了一个网站了，但上面空空的什么也没有。下一步可以把[别人的模板](https://github.com/jekyll/jekyll/wiki/sites)clone下来，拷到我们这里来使用，如果允许的话，呵呵。这个博客使用的是[Hyde](https://github.com/hyde/hyde)。把新的文件push到repository后，就可以看到我们网站有了基本的样子了。

下一步我们要根据自己的需求定制网站。这里我们回顾一下Jekyll的工作原理，它会把我们的文章和网页模板连接在一起，然后编译（渲染）成html文件。

文章一般是用Markdown写的，放在_post目录下，文件命名要遵循一定的格式。还有一些html的网页，例如文章列表页面，放在根目录里面。

不管是Markdown还是html，只要头部包含如下的头部，都会被Jekyll处理。
{% highlight YAML %}
---
layout : xxx
xxx    : xxx
---
{% endhighlight %}

网页模板是html格式，放在_layout目录下。如果有些公用的部分，可以放在_include目录下面。

文章和网页头部的元数据会在编译（渲染）时被用到。例如layout用来决定用哪个模板。如果头部有title这样的元数据，在渲染模板时会把{{ "{{ title " }}}} 这样的地方替换掉。

不仅仅网页模板里可以用元数据，网页里也可以。例如文章列表页面，就可以包含for循环打印文章列表标题和摘要这样的语句（Jekyll会先把_post下页面的元数据先提取好）。这看上去和php有点像，但要记住这是发生在你提交页面的时候，而不是像php发生在每次访问页面的时候。Jekyll使用一个叫[Liquid](https://github.com/Shopify/liquid)的东西进行渲染。

所有的配置信息放在_config.yml文件里。与yml相比，xml太反人类了。这些配置信息一方面可以被Jekyll使用，也可以在网页模板或网页文章中使用。

这些东西改好之后，再push一把，就可以看到属于你自己的网站了。

如果你想在push前预览一遍文章，可以在本地装一下Jekyll。[非Windows安装Jekyll](http://jekyllrb.com/docs/installation/)，[Windows下五步安装Jekyll](http://jekyll-windows.juthilo.com/)

你也可以不在GitHub Pages上托管你的网站。在本地用Jekyll编译网站后会生成_site的目录，把它拷到一个文件服务器上就可以了。当然也可以在你的主机上安装Jekyll，它本身可以提供文件访问服务。

我还是建议用GitHub Pages。你所有的文章都放在GitHub上，这就完美的解决了之前提到的备份问题。如果自己有域名的话，[也可以指向你的GitHub Pages](https://help.github.com/articles/setting-up-a-custom-domain-with-github-pages/)。

关于评论功能，你可以使用第三方评论托管服务，例如[disqus](https://disqus.com/)，[多说](http://duoshuo.com/)，[畅言](http://changyan.sohu.com/)等。其实可以看到，通过Javascript我们可以实现动态功能的，只不过消耗的资源就是在用户端了。

### 总结

Jekyll是一个静态网站编译器，提供了通过模板生成静态网站的功能。静态网站简单、轻量、响应快，通过和Github整合可以完美解决网站备份问题。非常适合个人博客等页面内容变化不大的网站。还可以通过引入第三方服务提供诸如评论等动态功能。

可以用[Chuck Yeager将军](http://en.wikipedia.org/wiki/Chuck_Yeager)（第一个超音速飞行的人）赞扬一架飞机的机械系统时用的词来形容它
> 结构简单、部件很少、易于维护、非常坚固。
