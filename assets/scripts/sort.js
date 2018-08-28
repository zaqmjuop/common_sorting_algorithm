/** 插入排序 改变原数组 */
function insertionSort(array) {
  const container = []; // 准备一个空数组，向空数组内插入
  // 一次插入动作
  const onceInsert = (member) => {
    let isInserted = false;
    for (let i = 0; i < container.length; i += 1) {
      const item = container[i];
      // 插入条件
      if (item > member) {
        container.splice(i, 0, member); // 插入
        isInserted = true;
        break;
      }
    }
    // 若container中没有比member更大的值时
    if (!isInserted) { container.push(member); }
    return container;
  };
  // 将原数组中的值有序的插入到container
  array.forEach(item => onceInsert(item));
  // 改变原数组
  array.splice(0, array.length, ...container);
}

export default insertionSort;
export { insertionSort };
