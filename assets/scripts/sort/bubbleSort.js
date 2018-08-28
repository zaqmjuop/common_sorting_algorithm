const bubble = (array, start = 0, end = array.length - 1) => {
  const isValid = array instanceof Array
    && Number.isSafeInteger(start)
    && Number.isSafeInteger(end)
    && start < end;
  if (!isValid) { return false; }
  for (let index = start; index < end; index += 1) {
    const item1 = array[index];
    const item2 = array[index + 1];
    if (item1 > item2) {
      array.splice(index, 2, item2, item1);
    }
  }
  return array;
};

const bubbleSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  for (let index = 0; index < array.length - 1; index += 1) {
    bubble(array, 0, array.length - index - 1);
  }
  return array;
};

export default bubbleSort;
