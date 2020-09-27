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