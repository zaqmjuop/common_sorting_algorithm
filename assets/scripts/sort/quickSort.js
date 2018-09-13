const quickSortOnce = (array, callback, startIndex = 0, endIndex = array.length - 1) => {
  const pivot = array[startIndex]; // array[leftIndex]; // 取左端点值为参照物
  let rightIndex = endIndex; // 设置右端点
  let leftIndex = startIndex; // 设置左端点
  // 左右端点不重合时循环排序
  while (leftIndex < rightIndex) {
    // 从右端点开始收紧
    for (; leftIndex < rightIndex; rightIndex -= 1) {
      if (callback(array[rightIndex]) < callback(pivot)) {
        array.splice(leftIndex, 1, array[rightIndex]);
        leftIndex += 1;
        break;
      }
    }
    // 如果已经从右侧找到比参照物小的值而使左右端点未重合，那么开始从左端点开始找比参照物大的值
    for (; leftIndex < rightIndex; leftIndex += 1) {
      if (callback(array[leftIndex]) > callback(pivot)) {
        array.splice(rightIndex, 1, array[leftIndex]);
        rightIndex -= 1;
        break;
      }
    }
  }
  array.splice(leftIndex, 1, pivot); // 把参照物赋值回多余值位置
  return leftIndex;
};

const recursion = (array, callback, startIndex = 0, endIndex = array.length - 1) => {
  const pivotIndex = quickSortOnce(array, callback, startIndex, endIndex);
  if (pivotIndex - 1 > 0) {
    recursion(array, callback, 0, pivotIndex - 1); // 递归左端点的左侧部分
  }
  if (endIndex > pivotIndex + 1) {
    recursion(array, callback, pivotIndex + 1, endIndex); // 递归左端点的右侧部分
  }
  return array;
};

const quickSort = (array, callback = item => item) => {
  const isValidArgs = array instanceof Array
    && typeof callback === 'function';
  if (!isValidArgs) { return false; }
  recursion(array, callback, 0, array.length - 1);
  return array;
};

export default quickSort;
