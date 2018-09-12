

const insertion = (array, index) => {
  const member = array[index];
  let insertIndex = 0;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (array[i] <= member) {
      insertIndex = i + 1;
      break;
    }
  }
  if (insertIndex !== index) {
    array.splice(index, 1);
    array.splice(insertIndex, 0, member);
  }
};


/** 插入排序 */
const insertionSort = (array) => {
  if (!(array instanceof Array)) { throw new TypeError(`${array} 不是Array`); }
  for (let index = 0; index < array.length; index += 1) {
    insertion(array, index);
  }
};

export default insertionSort;
