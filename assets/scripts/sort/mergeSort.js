import insertionSort from './insertionSort';

// 二分一个数组
const halve = (array) => {
  if (!(array instanceof Array) || array.length < 2) { return array; }
  if (array.length <= 1) { return array; }
  const rightSrart = Math.ceil(array.length / 2);
  const left = array.slice(0, rightSrart);
  const right = array.slice(rightSrart, array.length);
  array.splice(0, array.length, left, right);
  return array;
};

/** 把一个数组切碎成多元数组 */
const shredding = (array) => {
  if (!(array instanceof Array)) { return false; }
  halve(array);
  array.forEach((item) => {
    if (item instanceof Array && item.length > 2) {
      shredding(item);
    }
  });
  return array;
};

/** 排序并合并 */
const merge = (...array) => {
  if (array.length <= 1) { return array; }
  const container = [];
  if (array.every(item => !(item instanceof Array))) {
    container.push(...array);
    insertionSort(container);
  } else {
    // 二维数组排序
    while (array.every(team => team.length > 0)) {
      // 找到最小的team[0]
      let minIndex = 0;
      for (let index = 1; index < array.length; index += 1) {
        if (array[index][0] < array[minIndex][0]) {
          minIndex = index;
        }
      }
      const min = array[minIndex].shift();
      container.push(min);
    }
    array.forEach(team => container.push(...team));
  }
  return container;
};

const recursiveMerge = (array) => {
  if (!(array instanceof Array)) { return false; }
  array.forEach((team) => {
    recursiveMerge(team);
  });
  const total = merge(...array);
  array.splice(0, array.length, ...total);
  return array;
};

const mergeSort = (array) => {
  shredding(array); // 递归分组
  recursiveMerge(array);// 递归合并并排序
  return array;
};

export default mergeSort;
