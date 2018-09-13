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

const objectSort = (array, callback) => {
  const isValid = array instanceof Array && array.every(item => typeof item === 'object');
  if (!isValid) { return false; }
  const copy = array.slice(0);
  quickSort(array, callback);
  // 把快排导致的乱序还原
  const teams = [[array[0]]];
  for (let index = 1; index < array.length; index += 1) {
    const item = array[index];
    const prev = array[index - 1];
    if (callback(item) === callback(prev)) {
      teams[teams.length - 1].push(item);
    } else {
      teams.push([item]);
    }
  }
  const equalTeams = teams.filter(team => team.length > 1);
  equalTeams.forEach((team) => {
    const arrayStart = array.indexOf(team[0]);
    const indexes = team.map(item => copy.indexOf(item));
    const emptyArray = new Array(array.length);
    team.forEach((item, index) => {
      const originIndex = indexes[index];
      emptyArray.splice(originIndex, 1, item);
    });
    const ordered = emptyArray.filter(item => item && item);
    array.splice(arrayStart, team.length, ...ordered);
  });
  return array;
};

const defaultSort = (array, callback = item => item) => {
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
    quickSort(array, item => item.length);
  } else if (array.every(item => typeof item === 'object' && item !== null)) {
    // 根据callback返回值大小排序
    objectSort(array, callback);
  } else {
    result = false;
  }
  return result;
};

export {
  defaultSort,
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
