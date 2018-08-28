const countingSort = (array) => {
  if (!(array instanceof Array)) { throw new TypeError(`${array} 不是Array`); }
  // 筛选数组中一共存在几种值，并将其排序
  const keys = [...new Set(array)];
  keys.sort((a, b) => a - b);
  // 设一个容器，容器的每个成员是一个数组，值相同的成员放到同一数组
  const container = keys.map(() => []);
  array.forEach((item) => {
    const index = keys.indexOf(item);
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
