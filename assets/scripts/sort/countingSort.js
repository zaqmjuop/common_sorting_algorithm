const countingSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  if (array.some(item => !Number.isSafeInteger(item))) { return false; }
  // 确定范围
  let max = array[0];
  let min = array[0];
  array.forEach((item) => {
    if (item > max) { max = item; }
    if (item < min) { min = item; }
  });
  // 设一个容器，容器的每个成员是一个数组，值相同的成员放到同一数组
  const container = [];
  for (let index = min; index <= max; index += 1) {
    container.push([]);
  }
  array.forEach((item) => {
    const index = item - min;
    container[index].push(item);
  });
  // 清空原数组
  array.splice(0, array.length);
  // 把容器中每个数组中的成员重新放回原数组
  container.forEach((team) => {
    team.forEach((item) => {
      array.push(item);
    });
  });
  return array;
};

export default countingSort;
