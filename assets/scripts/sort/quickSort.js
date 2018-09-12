const quickSortOnce = (array, startIndex = 0, endIndex = array.length - 1) => {
  const isValidArgs = array instanceof Array
    && Number.isSafeInteger(startIndex)
    && Number.isSafeInteger(endIndex)
    && startIndex >= 0
    && startIndex < endIndex;
  if (!isValidArgs) { return false; }
  let rightIndex = endIndex; // 设置右端点
  let leftIndex = startIndex; // 设置左端点
  const pivot = array[leftIndex]; // 取左端点值为参照物
  while (leftIndex < rightIndex) { // 左右端点不重合时循环排序
    for (; leftIndex < rightIndex; rightIndex -= 1) { // 从右端点开始收紧
      if (array[rightIndex] < pivot) {
        // 如果右端点比参照物小，就赋值到左端点的位置上，由于左端点已经被赋值为目标值，所以左端点就收紧一位。此时右端点是个多余值
        array.splice(leftIndex, 1, array[rightIndex]); // 把左端点赋值为右端点值
        // 此时右端点为多余值，参照物不在数组中
        leftIndex += 1; // 由于左端点已经被赋值，于是将左端点收紧一位
        break;
      }
      // 如果从右侧遍历没有找到比参照物小的值，右端点会收紧到与左端点重合
    }
    // 如果已经从右侧找到比参照物小的值而使左右端点未重合，那么开始从左端点开始找比参照物大的值
    for (; leftIndex < rightIndex; leftIndex += 1) { // 从左端点开始收紧
      if (array[leftIndex] > pivot) {
        // 如果从左侧找到比参照物大的值，把左端点值赋值到右端点，那么左端点就变成了多余值位置
        array.splice(rightIndex, 1, array[leftIndex]);
        rightIndex -= 1; // 由于右端点已经被赋值，于是将右端点收紧一位,然后进入下一次循环
        break;
      }
      // 如果从左侧没有找到比参照物大的值，左端点会收紧到与右端点重合
    }
  }
  // 到这里左右端点重合，且位置是多余值的位置
  array.splice(leftIndex, 1, pivot); // 把参照物赋值回多余值位置
  return leftIndex;
};

const quickSort = (array, startIndex = 0, endIndex = array.length - 1) => {
  const isValidArgs = array instanceof Array
    && Number.isSafeInteger(startIndex)
    && Number.isSafeInteger(endIndex)
    && startIndex >= 0
    && startIndex < endIndex;
  if (!isValidArgs) { return false; }
  const pivotIndex = quickSortOnce(array, startIndex, endIndex);
  if (pivotIndex - 1 > 0) {
    quickSort(array, 0, pivotIndex - 1); // 递归左端点的左侧部分
  }
  if (endIndex > pivotIndex + 1) {
    quickSort(array, pivotIndex + 1, endIndex); // 递归左端点的右侧部分
  }
  return array;
};

export default quickSort;
