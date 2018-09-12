const swap = (array, i, j) => {
  const tmp = array[i];
  array.splice(i, 1, array[j]);
  array.splice(j, 1, tmp);
};

const heapify = (array, index, end = array.length - 1) => {
  let largest = index;
  const left = index * 2 + 1;
  const right = left + 1;
  if (left <= end && array[left] > array[largest]) {
    largest = left;
  }
  if (right <= end && array[right] > array[largest]) {
    largest = right;
  }
  if (largest !== index) {
    swap(array, index, largest);
    heapify(array, largest, end); // 向下递归
  }
};

const buildMaxHeap = (array) => {
  for (let index = Math.trunc(array.length / 2) - 1; index >= 0; index -= 1) {
    heapify(array, index);
  }
};

const heapSort = (array) => {
  if (!(array instanceof Array)) { throw new TypeError(`${array} 不是Array`); }
  buildMaxHeap(array);
  for (let index = array.length - 1; index > 0; index -= 1) {
    swap(array, 0, index);
    heapify(array, 0, index - 1);
  }
  return array;
};

export default heapSort;
