const bucketSort = (array) => {
  if (!(array instanceof Array)) { throw new TypeError(`${array} 不是Array`); }
  const DEFAULT_BUCKET_SIZE = 5;
  let max = array[0];
  let min = array[0];
  // 找到最大最小值
  array.forEach((item) => {
    if (item > max) { max = item; }
    if (item < min) { min = item; }
  });
  // 找到断点
  const breakpoints = []; // 中间的断点，不包括min和max
  const spacing = Math.floor((max - min) / 5);
  let breakpoint = min;
  for (let index = 0; index < DEFAULT_BUCKET_SIZE - 1; index += 1) {
    breakpoint += spacing;
    breakpoints.push(breakpoint);
  }
  // 创建一个二元数组容器,长度为DEFAULT_BUCKET_SIZE，每个成员是一个空数组
  const container = [];
  for (let index = 0; index < DEFAULT_BUCKET_SIZE; index += 1) {
    container.push([]);
  }
  // 将原数组按分组放入容器内
  array.forEach((item) => {
    let index = breakpoints.findIndex(point => (point >= item));
    if (index < 0) { index = DEFAULT_BUCKET_SIZE - 1; }
    container[index].push(item);
  });
  // 对容器每组进行插入排序
  container.forEach(item => sort(item));
  // 替换原数组
  array.splice(0, array.length);
  container.forEach(item => array.push(...item));
  return array;
}

export default bucketSort;
