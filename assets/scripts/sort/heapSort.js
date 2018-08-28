const swap = (array, i, j) => {
  const tmp = array[i];
  array.splice(i, 1, array[j]);
  array.splice(j, 1, tmp);
};

const heapAdjust = (array, i, j) => {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < j && array[largest] < array[left]) {
    largest = left;
  }

  if (right < j && array[largest] < array[right]) {
    largest = right;
  }

  if (largest !== i) {
    swap(array, i, largest);
    heapAdjust(array, largest, j);
  }
};

const buildMaxHeap = (array) => {
  for (let i = Math.floor(array.length / 2) - 1; i >= 0; i -= 1) {
    heapAdjust(array, i, array.length);
  }
};

const heapSort = (array) => {
  buildMaxHeap(array);
  for (let i = array.length - 1; i > 0; i -= 1) {
    swap(array, 0, i);
    heapAdjust(array, 0, i);
  }
  return array;
};