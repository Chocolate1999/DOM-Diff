## 前言

本文源码收录于 <a href="https://github.com/Chocolate1999/DOM-Diff">DOM-Diff</a> 仓库，文章内容按照一位老师视频学习而来（详情见文本末尾哈），每一个字都是自己手动敲出来的，算是给自己的一个梳理和总结，下面，我们一起来学习一下 `dom diff` 吧。

## DOM Diff
`dom diff` 其实就是对比两个虚拟节点，然后对比它们的差异。然后再对应真实 `dom` 上进行一个打补丁操作。我们的目的就是找到其中的差异，然后用最小的代价来操作 `dom`。因为操作 `dom` 相对而言比较耗性能。

而对于虚拟节点呢，我们可以简单理解为**普通对象**。就是将真实节点用对象的方式模拟出来，通过比较两个新老虚拟节点，得到彼此的差异，形成一个补丁，最后再与真实的 `dom` 进行匹配，将这些补丁打到真实 `dom` 上去，最终，我们还是操作了原来的真实 `dom`，但是我们是用了差异化结果的 **最小的代价**  来操作的。


### 平级对比
上文我们讲解了虚拟节点可以简单理解为普通对象，那么我们来用图示来看一看，得到其中的一个特点：
![](https://img-blog.csdnimg.cn/20200926232712906.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
左边就是旧的虚拟节点，而右边是新的虚拟节点。我们来看看有什么变化：

- 第一层， `ul` 底下的 `class` 由 `list` 变为了 `wrap`
- 第二层，第三个孩子 `li` 变为了 `div`
- 第三层，有文本节点发生了变化，并且删除了一个节点
- 第四层，删除了一个节点


从上述表述来看，可以知道 `dom diff` 算法是有一定规则的，即它只会平级的进行对比，是对应的，不存在跨级对比的问题。

**特点一**：平级对比


### 存在索引值

我们再来看看下面这种情况，比如左边旧虚拟 dom 和右边新的虚拟 dom ，会不会按照下面这种方式进行对比呢？

![](https://img-blog.csdnimg.cn/20200926233851748.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
仍然不会，因为不是一一对应关系，即不属于平级关系。

那么，如果我们将新的虚拟dom上面节点删除掉呢，这种情况下会进行比对吗？
![](https://img-blog.csdnimg.cn/20200926234234333.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
答案是不一定，因为在 `dom diff`算法中，对于虚拟节点是有对应的索引值的，如果满足**平级**关系后，此时索引值不相同，还是不会进行比对，只有**索引值相同**的才会进行比对，这个在下文会进一步探讨。


**特点二**：存在索引值


### 交换平级虚拟节点，无需重新渲染

对于下图中，如果对于新旧虚拟dom中，我们的变化只是交换了一个虚拟节点，此时就不需要重新渲染了，直接替换就好了。

![](https://img-blog.csdnimg.cn/20200926234534852.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
**特点三**：交换平级虚拟节点，无需重新渲染


### 深度遍历
从下图索引值遍历循序课件，`dom` 的遍历时按照深度进行遍历的。

![](https://img-blog.csdnimg.cn/20200926234744443.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
**特点四**：深度遍历


## 建立项目

### 初始化

创建一个文件夹，我这里命名 `vDOM`，然后以 `vscode`打开，打开一个终端，执行下面代码，生成一个 `package.json`

```javascript
npm init - y
```

然后安装 `webpack` 相关插件：

```javascript
npm install webpack webpack-cli webpack-dev-server html-webpack-plugin
```

安装完后，我们在项目文件夹内新建一个名为 `webpack.config.js` 的文件，进行相关配置：

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin'), // 处理html
  { resolve } = require('path');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'src/index.html')
    })
  ],
  devServer: {
    contentBase: './',
    open: true
  }
}
```

### 配置相关命令

然后，我们回来 `package.json` 文件中来，更改我们的 `scripts`命令。

```javascript
{
  "name": "vDOM",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "webpack-dev-server",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "html-webpack-plugin": "^4.5.0",
    "webpack": "^4.44.2",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.0"
  }
}
```

### 创建文件

配置完成后，我们就可以创建相关文件了，如下图所示：

![](https://img-blog.csdnimg.cn/2020092708412665.png#pic_center)
其中 `index.html` 文件内容可以初始化如下代码：

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>vDOM</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

`index.js`文件初始化为如下代码：

```javascript
console.log(1);
```

最后，执行 `npm run dev`，如果控制台打印了 1 ，代表 `webpack` 配置成功。

### 创建虚拟 dom

配置成功后，就可先在 `js/index.js` 文件准备好我们的虚拟 dom 了，如下代码：

```javascript
const vDom = createElement('ul', { class: 'list', style: 'width: 300px;height: 300px;background-color: orange' }, [
  createElement('li', { class: 'item', 'data-index': 0 }, [
    createElement('p', { class: 'text' }, ['第1个列表项'])
  ]),
  createElement('li', { class: 'item', 'data-index': 1 }, [
    createElement('p', { class: 'text' }, [
      createElement('span', { class: 'title' }, ['第2个列表项'])
    ])
  ]),
  createElement('li', { class: 'item', 'data-index': 2 }, ['第3个列表项'])
]);
```
### 生成 dom 对象

创建完成后，会发现 `createElement`未定义，接下来我们来定义一下，在 `js` 文件夹底下，创建一个名为 `virtualDom.js` 的文件，相关内容代码如下：

定义 `createElement`，其中当然是要将我们的虚拟dom转换为dom对象，因此我们定义了一个类（见后文），然后将这个方法导出去。
```javascript
import Element from './Element'
function createElement(type, props, children) {
  return new Element(type, props, children);
}
export {
  createElement
}
```
同时，我们创建一个 `Element.js` 文件，用来将我们的虚拟dom转换为dom对象。
```javascript
class Element {
  constructor(type, props, children) {
    this.type = type;
    this.props = props;
    this.children = children;
  }
}
export default Element;
```
定义好了方法之后，我们在最开始的 `index.js`文件里面进行引入操作
```javascript
import { createElement } from './virtualDom'
```
在尾部，我们可以打印一下 `vDom`。
```javascript
console.log(vDom);
```

![](https://img-blog.csdnimg.cn/20200927090042901.png#pic_center)
### 生成真实 dom 结构

有了 `dom` 对象后，我们还需要解析成为真实的 `dom`，才会显示我们对应的页面，而这里需要一个 `render` 函数

```javascript
const rDom = render(vDom);
```
在 `render`函数中，我们需要创建一个真实节点，然后将其属性加上去，而我们的属性 `key`值可能是 value，也可能是 style ，还有其它一些属性 key 值，因此我们不能直接通过 `node.setAttribute` 给节点设置属性值，需要分情况考虑。

```javascript
// 将虚拟dom转换为真实dom
function render(vDom) {
  const { type, props, children } = vDom;
  // 创建真实节点
  const el = document.createElement(type);
  // 遍历属性
  for (let key in props) {
    // 设置属性 分 input textarea 
    setAttrs(el, key, props[key]);
  }
  console.log(el);
}
```

因此，我们需要自定义设置节点属性值的方法，对于 value 、style等进行一个区分。

```javascript
// 给节点设置属性
function setAttrs(node, prop, value) {
  switch (prop) {
    case 'value':
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        node.value = value;
      } else {
        node.setAttribute(prop, value);
      }
      break;
    case 'style':
      node.style.cssText = value;
      break;
    default:
      node.setAttribute(prop, value);
      break;
  }
}
```
最后，打印得到如下结果，发现 `ul`上的属性值都挂载上去了。
![](https://img-blog.csdnimg.cn/20200927093040424.png#pic_center)

###  render 孩子节点
上文，我们只是对于祖先节点的设置属性操作，而对于孩子节点没有进行处理。对于孩子节点呢，我们也需要考虑一下，如果它还是属于 `Element`对象，那么我们就需要进行递归操作，而对于文本节点，直接创建一个新的节点即可，具体实现代码如下：

```javascript
// 将虚拟dom转换为真实dom
function render(vDom) {
  const { type, props, children } = vDom;
  // 创建真实节点
  const el = document.createElement(type);
  // 遍历属性
  for (let key in props) {
    // 设置属性 分 input textarea 
    setAttrs(el, key, props[key]);
  }
  // 处理孩子节点
  children.map((c) => {
    // 如果是元素节点
    if (c instanceof Element) {
      // 递归操作
      c = render(c);
    } else {
      // 对于文本节点，直接创建一个新的节点
      c = document.createTextNode(c);
    }
    el.appendChild(c);
  });
  return el;
}
```
最终，我们得到了我们的真实 `dom`  结构啦，✿✿ヽ(°▽°)ノ✿

![](https://img-blog.csdnimg.cn/20200927093510983.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
### renderDOM

有了真实dom后，我们还需要将这个真实dom渲染到页面去，方法如下：

```javascript
// 渲染真实dom
function renderDOM(rDom, rootEl) {
  rootEl.appendChild(rDom);
}
```
然后在我们的`index.js`文件中执行该方法：

```javascript
const rDom = render(vDom);
// 执行渲染
renderDOM(
  rDom,
  document.getElementById('app')
)
```

最终，我们成功渲染我们的真实dom，得到如下结果✿✿ヽ(°▽°)ノ✿
![](https://img-blog.csdnimg.cn/20200927151400857.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
## 虚拟节点差异比较
在上文，我们得到了真实dom结构并且进行了渲染，下文我们将进行两个虚拟dom之间的差异分析，然后形成一个补丁。

### 两个虚拟dom

![](https://img-blog.csdnimg.cn/2020092715180359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
上文两个 `vDom` 对应下面代码：
```javascript
const vDom = createElement('ul', { class: 'list', style: 'width: 300px;height: 300px;background-color: orange' }, [
  createElement('li', { class: 'item', 'data-index': 0 }, [
    createElement('p', { class: 'text' }, ['第1个列表项'])
  ]),
  createElement('li', { class: 'item', 'data-index': 1 }, [
    createElement('p', { class: 'text' }, [
      createElement('span', { class: 'title' }, ['第2个列表项'])
    ])
  ]),
  createElement('li', { class: 'item', 'data-index': 2 }, ['第3个列表项'])
]);

const vDom2 = createElement('ul', { class: 'list-wrap', style: 'width: 300px;height: 300px;background-color: orange' }, [
  createElement('li', { class: 'item', 'data-index': 0 }, [
    createElement('p', { class: 'title' }, ['特殊列表项'])
  ]),
  createElement('li', { class: 'item', 'data-index': 1 }, [
    createElement('p', { class: 'text' }, [])
  ]),
  createElement('div', { class: 'item', 'data-index': 2 }, ['第3个列表项'])
]);
```

### patches

补丁，其实也是一个对象。

![](https://img-blog.csdnimg.cn/20200927152157893.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
### domDiff
在 `js` 文件夹底下，我们创建一个 `domDiff`文件，用来实现虚拟dom差异比较的方法。

在此之前，我们可以提前设置好对应的属性值，创建一个 `patchTypes.js`  文件，如下：

```javascript
export const ATTR = 'ATTR';
export const TEXT = 'TEXT';
export const REPLACE = 'REPLACE';
export const REMOVE = 'REMOVE';
```

在 `domDiff` 文件中，我们需要做如下操作：

- 进行深度遍历，比较新旧虚拟dom的差异
- 深度遍历时比较的是每一个虚拟节点，对于新节点如果它不存在，那么就是删除操作，打上删除的补丁
- 如果新旧节点都是文本节点并且值不相同，打上替换的补丁
- 而对于都是元素节点，并且节点类型相同的情况，我们就需要比较它们的属性值是否相同。同时，对于元素节点，它们都有自己的孩子节点，因此，我们需要对孩子节点进行递归 vnodeWalk 操作，此时需要定义一个全局节点的索引值，用来对应每一个虚拟节点的补丁索引
- 其它情况，就是进行了替换操作，直接打上替换的补丁

比较元素节点的属性值时，又会有几种情况考虑：

- 先遍历旧的属性集合，如果新旧属性值不一样，那么就是修改了属性，打上修改的属性补丁
- 在遍历新的属性集合，如果旧属性值没有，那么就是新增了属性，打上增加的属性补丁


```javascript
import {
  ATTR,
  TEXT,
  REPLACE,
  REMOVE
} from './patchTypes';
// 定义全局补丁对象
let patches = {};
// 定义全局索引值
let vnIndex = 0;

function domDiff(oldVDom, newVDom) {
  let index = 0;
  // 深度遍历
  vnodeWalk(oldVDom, newVDom, index);
  return patches;
}

// 深度遍历
function vnodeWalk(oldNode, newNode, index) {
  // 对每一个节点创建一个小补丁
  let vnPatch = [];
  // 如果在新节点不存在了，就是存在删除操作
  if (!newNode) {
    vnPatch.push({
      type: REMOVE,
      index
    })
  } else if (typeof oldNode === 'string' && typeof newNode === 'string') {
    // 如果都是文本节点并且值不相同，需要进行替换操作
    if (oldNode !== newNode) {
      vnPatch.push({
        type: TEXT,
        text: newNode
      })
    }
  } else if (oldNode.type === newNode.type) {
    // 如果两个都是元素节点，并且它们的类型相同，此时我们需要对它们的属性进行差异比较
    const attrPatch = attrsWalk(oldNode.props, newNode.props);
    // 如果属性差异有的话，我们才会放入我们的补丁集合当中
    if (Object.keys(attrPatch).length > 0) {
      vnPatch.push({
        type: ATTR,
        attrs: attrPatch
      });
    }

    // 遍历它们的孩子
    childrenWalk(oldNode.children, newNode.children);
  }else{
    // 其它情况，执行了替换操作，打上替换补丁即可
    vnPatch.push({
      type: REPLACE,
      newNode
    })
  }
  // 判断是否有补丁
  if(vnPatch.length){
    patches[index] = vnPatch;
  }

}

// 打属性的补丁
function attrsWalk(oldAttrs, newAttrs) {
  let attrPatch = {};
  // 遍历旧的属性值，看是否修改了属性值
  for (let key in oldAttrs) {
    // 如果对于相同的key，值不相同，则需要保存新节点的属性值，形成一个小补丁
    if (oldAttrs[key] !== newAttrs[key]) {
      attrPatch[key] = newAttrs[key];
    }
  }
  // 遍历新的属性值，看是否存在新增了属性值
  for (let key in newAttrs) {
    if (!oldAttrs.hasOwnProperty(key)) {
      attrPatch[key] = newAttrs[key];
    }
  }
  return attrPatch;
}

// 遍历孩子
function childrenWalk(oldChildren, newChildren) {
  oldChildren.map((c, idx) => {
    vnodeWalk(c, newChildren[idx], ++vnIndex);
  });
}

export default domDiff;
```

此时，我们打印出来了比对差异之后的补丁 ✿✿ヽ(°▽°)ノ✿

![](https://img-blog.csdnimg.cn/20200927155818144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)
### 给真实 dom 打补丁

上文我们得到了虚拟dom之间的差异补丁，下面我们将做打补丁操作。

首先，还是在 `js` 文件夹下创建一个 `doPatch.js` 文件，里面编写打补丁方法。


```javascript
// 保存补丁包，形成全局变量
import {
  ATTR,
  TEXT,
  REPLACE,
  REMOVE
} from './patchTypes';
import { setAttrs, render } from './virtualDom'
import Element from './Element'
let finalPatches = {};
let rnIndex = 0;
function doPatch(rDom, patches) {
  finalPatches = patches;
  // 遍历真实dom
  rNodeWalk(rDom);
}

// 真实dom遍历
function rNodeWalk(rNode) {
  const rnPatch = finalPatches[rnIndex++];
  const childNodes = rNode.childNodes;
  // 递归孩子节点
  [...childNodes].map((c) => {
    rNodeWalk(c);
  })
  // 如果当前索引下存在补丁，才会有后续操作
  if (rnPatch) {
    patchAction(rNode, rnPatch);
  }
}

// 打补丁
function patchAction(rNode, rnPatch) {
  // 遍历当前索引节点下的所有补丁
  rnPatch.map((p) => {
    switch (p.type) {
      case ATTR:
        for (let key in p.attrs) {
          // 取属性值
          const val = p.attrs[key];
          // 属性值存在，我们就对其进行设置
          if (val) {
            setAttrs(rNode, key, val);
          } else {
            // 属性值不存在，直接删除对应key值即可
            rNode.removeAttribute(key);
          }
        }
        break;
      case TEXT:
        rNode.textContent = p.text;
        break;
      case REPLACE:
        // 替换操作的话，我们需要判断如果还是虚拟dom的话需要走一遍render函数，形成真实dom，否则就直接新创建一个文本节点
        const newNode = (p.newNode instanceof Element) ? render(p.newNode) : document.createTextNode(p.newNode);
        // 替换操作，先找到父节点然后替换子节点即可
        rNode.parentNode.replaceChild(newNode, rNode);
        break;
      case REMOVE:
        // 删除操作，先找到父节点然后直接删除对应自己即可
        rNode.parentNode.removeChild(rNode);
        break;
      default:
        break;
    }
  });
}

export default doPatch;
```

此时，我们打印出来了最后打上补丁的dom结构  ✿✿ヽ(°▽°)ノ✿

![](https://img-blog.csdnimg.cn/2020092716582879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)

最终，我们的页面变成了这样：

![](https://img-blog.csdnimg.cn/20200927165907168.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTcxOA==,size_16,color_FFFFFF,t_70#pic_center)

## 总结与个人思考
根据本文的理解，下面我将总结一下如果面试的话，该如何讲清楚这个 diff 算法。经典三部曲：是什么，为什么，怎么做？

### 是什么
首先，谈及 `diff` 算法，其实就是对比两个虚拟节点，然后对比它们的差异。然后再对应真实 `dom` 上进行一个打补丁操作。我们的目的就是找到其中的差异，然后用最小的代价来操作 `dom`。因为操作 `dom` 相对而言比较耗性能。

### 为什么
那么为什么用 `diff`算法呢？直接操作真实 `dom` 难道不香吗？而且你使用 `diff` 算法后只是得到了差异化，最后还是要操作真实 dom 的，好像没太多区别？

当然有区别了，从 **是什么** 我们了解了直接操作 `dom` 的话比较耗费性能，想想 `JQuery` 时代，操作一个表格，如果对表格中某一项进行修改，那么整个表格 dom 节点都要重新刷一下，这显然很费性能。

虚拟节点呢，我们可以简单理解为**普通对象**。就是将真实节点用对象的方式模拟出来，通过比较两个新老虚拟节点，得到彼此的差异，形成一个补丁，最后再与真实的 `dom` 进行匹配，将这些补丁打到真实 `dom` 上去，最终，我们还是操作了原来的真实 `dom`，但是我们是用了差异化结果的 **最小的代价**  来操作的。

### 怎么做

这里我就按照本文的思路来说一说实现过程了：

首先，我们需要将虚拟节点给创建出来，虚拟节点可以理解为 **普通对象**，然后将虚拟dom转换为真实的dom节点，通过 `renderDOM`方法渲染到页面上，呈现出我们看到的页面。之后，通过 `domDiff` 方法，比对两个虚拟 dom ，得到补丁 `patches`，最后，我们通过 `doPatch` 方法操作真实 dom 执行打补丁操作。

对于**虚拟 dom 转换为真实 dom** 过程中，有需要注意的点：

首先，遍历每一个虚拟节点，对其创建一个真实的节点，此时节点上面还没有任何属性添加，我们需要遍历虚拟节点的属性，而对于属性，会有几种情况需要考虑，对于像**输入框**和**文本框**，我们是通过 `node.value` 这样来进行赋值操作，而对于**样式属性**的话，我们是通过 `node.style.cssText`来设置样式，其它情况我们是通过 `node.setAttribute` 直接操作。因此，我们需要分情况来讨论，所以在上述代码中，我们单独写了一个 `setAttr` 方法来给真实节点设置属性。

属性操作完了，还是不够，我们不是有三个属性吗？ `type` 、 `props`、`children`，对了还有我们的孩子节点，对于孩子节点，我们需要判断是不是**普通文本节点**，如果是的话，直接通过  `document.createTextNode` 来创建一个文本节点就好了，而对于虚拟节点的话，我们需要执行**递归**操作。最后，将孩子节点通过 `appendChild`方法添加到当前**真实根节点**上。

<hr/>

对于 **dom diff**， 一个核心部分就是 `vnodeWalk`，用来进行节点的深度遍历。

在 `domDiff` 文件中，我们需要做如下操作：

- 进行深度遍历，比较新旧虚拟dom的差异
- 深度遍历时比较的是每一个虚拟节点，对于新节点如果它不存在，那么就是删除操作，打上删除的补丁
- 如果新旧节点都是文本节点并且值不相同，打上替换的补丁
- 而对于都是元素节点，并且节点类型相同的情况，我们就需要比较它们的属性值是否相同。同时，对于元素节点，它们都有自己的孩子节点，因此，我们需要对孩子节点进行递归 vnodeWalk 操作，此时需要定义一个全局节点的索引值，用来对应每一个虚拟节点的补丁索引
- 其它情况，就是进行了替换操作，直接打上替换的补丁

比较元素节点的属性值时，又会有几种情况考虑：

- 先遍历旧的属性集合，如果新旧属性值不一样，那么就是修改了属性，打上修改的属性补丁
- 在遍历新的属性集合，如果旧属性值没有，那么就是新增了属性，打上增加的属性补丁



## 本文参考
<a href="https://www.bilibili.com/video/BV1zk4y1y7sD">【全网首发:完结】虚拟节点与DOM Diff算法源码实现【面试必备】</a>

>感谢小野老师的对算法的细致讲解，给老师打call，建议大家可以结合视频看一看，看完会恍然大悟的！


## 最后
文章产出不易，还望各位小伙伴们支持一波！

往期精选：

<a href="https://github.com/Chocolate1999/Front-end-learning-to-organize-notes">小狮子前端の笔记仓库</a>

<a href="https://github.com/Chocolate1999/leetcode-javascript">leetcode-javascript：LeetCode 力扣的 JavaScript 解题仓库，前端刷题路线（思维导图）</a>

小伙伴们可以在Issues中提交自己的解题代码，🤝 欢迎Contributing，可打卡刷题，Give a ⭐️ if this project helped you!


<a href="https://yangchaoyi.vip/">访问超逸の博客</a>，方便小伙伴阅读玩耍~

![](https://img-blog.csdnimg.cn/2020090211491121.png#pic_center)

```javascript
学如逆水行舟，不进则退
```


