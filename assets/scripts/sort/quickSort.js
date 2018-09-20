
const quickSortOnce = (array, startIndex = 0, endIndex = array.length - 1) => {
  const pivot = array[startIndex]; // array[leftIndex]; // 取左端点值为参照物
  let rightIndex = endIndex; // 设置右端点
  let leftIndex = startIndex; // 设置左端点
  // 左右端点不重合时循环排序
  while (leftIndex < rightIndex) {
    // 从右端点开始收紧
    for (; leftIndex < rightIndex; rightIndex -= 1) {
      if (array[rightIndex] < pivot) {
        array.splice(leftIndex, 1, array[rightIndex]);
        leftIndex += 1;
        break;
      }
    }
    // 如果已经从右侧找到比参照物小的值而使左右端点未重合，那么开始从左端点开始找比参照物大的值
    for (; leftIndex < rightIndex; leftIndex += 1) {
      if (array[leftIndex] > pivot) {
        array.splice(rightIndex, 1, array[leftIndex]);
        rightIndex -= 1;
        break;
      }
    }
  }
  array.splice(leftIndex, 1, pivot); // 把参照物赋值回多余值位置
  return leftIndex;
};

const recursion = (array, startIndex = 0, endIndex = array.length - 1) => {
  if (startIndex >= endIndex) { return false; }
  const pivotIndex = quickSortOnce(array, startIndex, endIndex);
  recursion(array, startIndex, pivotIndex - 1); // 递归左端点的左侧部分
  recursion(array, pivotIndex + 1, endIndex); // 递归左端点的右侧部分
  return array;
};

/**
 * 快速排序
 * @param {Array} array - 数组
 * @param {Function} callback - callback(item, index)必须返回一个有限数字，升序排序，可以返回负数来降序
 */
const quickSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  if (array.length < 2) { return array; }
  recursion(array, 0, array.length - 1);
  return array;
};

export default quickSort;
