---
layout: page
title : Portfolio
group: navigation
weight: 1
---
{% include JB/setup %}

<div id="post-list">

  {% for post in site.categories["portfolio"] %}

<h1>
  <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a>
</h1>
  {% include popup.html imgWidth=post.galleryImgWidth images=post.gallery %}
  <br />
  {{ post.content | split:"<!--more-->" | first }}
  {% include buttonbar.html buttons=post.buttons %}
  {% unless post.tags == empty %}
<ul class="tag_box inline">
  <li><i class="glyphicon glyphicon-tags gray"></i></li>
  {% assign tags_list = post.tags | sort %}
  {% include JB/tags_list_nocount %}
</ul>
  {% endunless %} 
    
  {% endfor %}
</div>
