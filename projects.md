---
layout: page
title : Projects
group: navigation
weight: 0
---
{% include JB/setup %}

<div id="post-list">

  {% for post in site.categories["project"] %}

<h1>
  <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a> <small>{{ post.tagline }}</small>
</h1>
<div class="logo-div">
  <img src="{{ BASE_PATH }}/file/thumb/{{ post.logo }}" />
</div>
<div class="entry-content">
  {{ post.content | split:"<!--more-->" | first }}
  {% include buttonbar.html buttons=post.buttons %}
  {% unless post.tags == empty %}
<ul class="tag_box inline">
  <li><i class="glyphicon glyphicon-tags gray"></i></li>
  {% assign tags_list = post.tags | sort %}
  {% include JB/tags_list_nocount %}
</ul>
  {% endunless %} 

</div>    
  {% endfor %}
</div>

