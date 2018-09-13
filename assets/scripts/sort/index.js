import bubbleSort from './bubbleSort';
import selectionSort from './selectionSort';
import insertionSort from './insertionSort';
import shellSort from './shellSort';
import mergeSort from './mergeSort';
import quickSort from './quickSort';
import heapSort from './heapSort';
import countingSort from './countingSort';
import bucketSort from './bucketSort';
import radixSort from './radixSort';

const booleanSort = (array) => {
  const isValid = array instanceof Array && array.every(item => typeof item === 'boolean');
  if (!isValid) { return false; }
  const counting = array.map(item => Number(item));
  countingSort(counting);
  const container = counting.map(item => !!item);
  array.splice(0, array.length, ...container);
  return array;
};

const sort = (array, callback) => {
  let result = array;
  if (!(array instanceof Array)) { result = false; }
  if (array.every(item => typeof item === 'boolean')) {
    // 计数排序
    booleanSort(array);
  } else if (array.every(item => typeof item === 'number' && Number.isFinite(item))) {
    // 快速排序
    quickSort(array);
  } else if (array.every(item => typeof item === 'string')) {
    // 不知道怎么排序
  } else if (array.every(item => typeof item === 'object' && item !== null)) {
    // 不知道怎么排序


    const container = array.map(item => callback(item))


    console.log(container)
  } else {
    result = false;
  }

  console.log(result)
  return result;
};

export {
  sort,
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  bucketSort,
  radixSort,
};
