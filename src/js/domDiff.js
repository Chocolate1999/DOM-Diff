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