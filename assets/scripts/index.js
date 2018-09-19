import 'babel-polyfill';
import main from './components/main';
import Dom from './dom';
import { getRandomArray } from './helper';
import * as sort from './sort/index';

document.addEventListener('DOMContentLoaded', () => {
  window.Dom = Dom;
  window.addEventListener('resize', () => {
    document.body.style.offsetHeight = `${window.innerHeight}px`;
  });
  window.resizeTo(window.innerWidth, window.innerHeight);

  const array = getRandomArray(10, 0, 1000);
  const past = Date.now();
  sort.quickSort(array);
  const now = Date.now();
  const isRight = array.every((item, index) => item >= array[index - 1] || index === 0);
  if (!isRight) { window.alert('Error'); }
  console.log(now - past);
  /**
   * 10000 0 1000
   * 冒泡 4535
   * 选择 150
   * 插入 100
   * 希尔 83
   * 归并 80
   * 计数 8
   * 桶排序 37
   * 基数 20
   */


  main();
});
