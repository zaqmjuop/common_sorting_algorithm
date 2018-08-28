import insertionSort from './insertionSort';

/** 把一个数组切碎成多元数组 */
const shredding = (ary) => {
  if (!(ary instanceof Array)) { return false; }
  const halve = (array) => {
    // 二分一个数组
    if (array.length <= 1) { return array; }
    const rightSrart = Math.ceil(array.length / 2);
    const left = array.slice(0, rightSrart);
    const right = array.slice(rightSrart, array.length);
    return [left, right];
  };
  const shredding2 = (array) => {
    if (array instanceof Array) {
      const isGrassRootsInNeed = array.every(item => !(item instanceof Array)) && array.length > 2;
      if (isGrassRootsInNeed) {
        // 负责二分最底层
        const halved = halve(array);
        if (halved[0].length > 2) { // 遍历前加一次遍历条件，减少遍历操作次数
          shredding2(halved);
        }
        array.splice(0, array.length, ...halved);
      } else {
        // 负责递归最底层
        array.forEach(item => shredding2(item));
      }
    }
  };
  shredding2(ary);
  return ary;
};


/** 将分好组的数组合并并排序 */
const recursiveMergeSort = (array) => {
  if (!(array instanceof Array) || array.length < 2) { return array; }
  const isGrassRoots = array.every(item => !(item instanceof Array));
  if (isGrassRoots) {
    // 最底层初次排序 2个值一组的部分
    insertionSort(array);
  } else {
    // 遍历替换原值
    let merge = [];
    array.forEach((item) => {
      recursiveMergeSort(item); // 递归到底层
      merge = merge.concat(item); // 从底层开始合并
    });
    array.splice(0, array.length, ...merge); // 将元素组改为合并，降维
    insertionSort(array); // 将合并排序
  }
  return array;
};

const mergeSort = (array) => {
  shredding(array); // 递归分组
  recursiveMergeSort(array); // 递归合并并排序
  return array;
};

export default mergeSort;
