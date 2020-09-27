import Element from './Element'
// 创建虚拟dom对象
function createElement(type, props, children) {
  return new Element(type, props, children);
}
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

// 渲染真实dom
function renderDOM(rDom, rootEl) {
  rootEl.appendChild(rDom);
}

export {
  createElement,
  render,
  setAttrs,
  renderDOM
}