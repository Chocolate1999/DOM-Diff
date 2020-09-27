import { createElement, render, renderDOM } from './virtualDom'
import domDiff from './domDiff'
import doPatch from './doPatch'
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

const rDom = render(vDom);
renderDOM(
  rDom,
  document.getElementById('app')
)
// console.log(vDom);
// console.log(rDom);


const patches = domDiff(vDom, vDom2);
console.log(patches);

doPatch(rDom, patches);