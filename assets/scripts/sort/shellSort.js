import insertionSort from './insertionSort';

// 分组 -> 排序 -> 替换原值
const shellSortOnce = (array, increment) => {
  for (let teamIndex = 0; teamIndex < increment; teamIndex += 1) {
    // 分组
    const effectIndexes = [];
    let effectIndex = teamIndex;
    while (effectIndex < array.length) {
      effectIndexes.push(effectIndex);
      effectIndex += increment;
    }
    const effectTeam = effectIndexes.map(index => array[index]);    
    // 排序
    insertionSort(effectTeam);
    // 替换
    effectIndexes.forEach((index, i) => {
      array.splice(index, 1, effectTeam[i]);
    });
  }
};

const shellSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  let increment = Math.trunc(array.length / 2);
  for (; increment >= 1; increment = Math.trunc(increment / 2)) {
    shellSortOnce(array, increment);
  }
  return array;
};

export default shellSort;
