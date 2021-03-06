---
layout: post
title: 论文笔记 Learning Gradient Descent Better Generalization and Longer Horizons
abstract: 这篇论文尝试使用RNN去优化另一个神经网络模型。基本思想源于更早的一篇论文，在其基础上做了改进。发表于ICML2017.
tags: [machine-learning, paper, learn-to-learn]
---

### 介绍
深度学习模型训练时最头疼的就是设置各种超参，设置不好难以调出较好的准确率。超参设置有许多经验和人工的意味，这个论文就是想
用机器学习的路子解决这个问题。[论文下载](https://arxiv.org/pdf/1703.03633.pdf)

基本思路借鉴了[这篇文章](https://arxiv.org/abs/1606.04474)(NIPS 2016)，在此基础上做了改进。当然也有人用强化学习
做这块地。

这篇文章的贡献，引入了两个trick提高效果，提出一个新的RNN模型。带来的好处有
1. 训练的步数可以更多了（和原文章相比）
2. 支持更多种类的网络，例如更深的MLP，CNN，LSTM

### 相关工作
文章对传统的优化算法做了一个总结，见下表
![placeholder](/public/images/lgdbgalh/table.PNG "传统优化算法")

文章里将这些算法分为两类，SGD和Momentum（梯度滑动平均）是一类，它们参数更新对梯度本身大小敏感，例如我把一个
loss function的结果乘以c，这样梯度大小会乘以c，从而参数更新会乘以c，这是有问题的因为我们对loss function的操作不会
影响模型参数，而这里参数更新却发生了变化。

而第二类的优化算法就通过对g做归一化解决了这个问题，把c * g带进去是不是c被消掉了。这第二类算法包括
Adagrad（利用g的历史和归一化），RMSprop（利用g平方的滑动平均归一化），Adadelta（和RMSprop类似，但还乘了一个参数变
化的滑动平均？？？），Adam（对g进行滑动平均，再利用g平方的滑动平均归一化）。

### 方法
首先是Random Scaling的trick。它解决什么问题呢？一个简单例子f(w) = c * w^2，我们只需要将参数变化的值设为
（-1/2）c*w 即可，实际上一步就可以达到最优解。而如果模型连c一块学进去了，碰到f(2) = d * w^2就有问题了。这里模型产生
了overfitting，没有学到形状而是学到了具体任务的w的大小。为了提高模型的泛化能力，每次训练RNN模型的时候，
loss function的参数会乘以一个同样尺寸的随机向量。

第二个trick是combination with convex function。由于深度学习模型都是高度非凸的，RNN模型可能很难学到梯度下降。所以
我们不是直接用loss function训练，而是用loss function加一个凸函数（文中是用每次迭代用一个随机变量，用这个变量和当前
参数距离的平方和）。这样RNN模型可以很快学到梯度下降，然后在梯度下降上结合loss function做调整。

RNN 模型。和Adam类似，使用一个归一化过的g和m（貌似有点重复）作为输出，经过一个全连接层+ELU，输入到一个两层LSTM，然后
激活函数是一个a * tanh。

### 实验
主要是与NIPS 2016年那篇文章和传统的优化算法做对比。[代码地址](https://github.com/vfleaking/rnnprop)
1. 首先是重现原文章中的实验
2. 然后加大训练步数，发现原文章算法DMOptimizer就跑飞了，而新的算法表现得仍然不错；还有发现在更多迭代的情况下RNNProp
没有传统算法好，论文给出的解释是RNNProp只是用了100步做训练
3. 换MLP的激活函数（ReLU, ELU,tanh）发现DMOptimizer效果不好而RNNProp效果好
4. 更深的MLP，DMOptimizer跑飞，而RNNProp要好，并且好于Adam
5. CNN，测了MNIST和Cifar10，RNNProp效果好
6. LSTM，RNNProp效果好而DMOptimizer直接跑飞
7. 一些控制实验测量模型和两个trick对实际效果贡献程度

### 总结
个人感觉这篇文章想法不错并且做了很多扎实的实验，还把代码放出来了，可以作为参考。这个方向也不错，用模型训练模型，让机器学
习更加自动。
