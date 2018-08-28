const selection = (array, start = 0, end = array.length - 1) => {
  const isValid = array instanceof Array
    && Number.isSafeInteger(start)
    && Number.isSafeInteger(end)
    && start < end;
  if (!isValid) { return false; }
  let minIndex = start;
  for (let index = start + 1; index <= end; index += 1) {
    if (array[index] < array[minIndex]) {
      minIndex = index;
    }
  }
  if (minIndex !== start) {
    const min = array[minIndex];
    array.splice(minIndex, 1, array[start]);
    array.splice(start, 1, min);
  }
  return array;
};

const selectionSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  for (let index = 0; index < array.length - 1; index += 1) {
    selection(array, index);
  }
  return array;
};

export default selectionSort;
