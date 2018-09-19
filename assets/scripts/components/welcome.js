import Component from './component';
import Dom from '../dom';
import bubbleSort from './bubbleSort';
import selectionSort from './selectionSort';
import insertionSort from './insertionSort';
import shellSort from './shellSort';
import mergeSort from './mergeSort';
import quickSort from './quickSort';
import heapSort from './heapSort';
import countingSort from './countingSort';
import bucketSort from './bucketSort';
import radixSort from './radixSort';

const bubbleSortParam = Component.of(bubbleSort);
const selectionSortParam = Component.of(selectionSort);
const insertionSortParam = Component.of(insertionSort);
const shellSortParam = Component.of(shellSort);
const mergeSortParam = Component.of(mergeSort);
const quickSortParam = Component.of(quickSort);
const heapSortParam = Component.of(heapSort);
const countingSortParam = Component.of(countingSort);
const bucketSortParam = Component.of(bucketSort);
const radixSortParam = Component.of(radixSort);

const initParam = bubbleSortParam;

const param = {
  query: 'welcome',
  url: './assets/templates/welcome.html',
  name: 'welcome',
  selectors: {
    container: '.container',
    bubbleSort: '*[name=bubbleSort]',
    selectionSort: '*[name=selectionSort]',
    insertionSort: '*[name=insertionSort]',
    shellSort: '*[name=shellSort]',
    mergeSort: '*[name=mergeSort]',
    quickSort: '*[name=quickSort]',
    heapSort: '*[name=heapSort]',
    countingSort: '*[name=countingSort]',
    bucketSort: '*[name=bucketSort]',
    radixSort: '*[name=radixSort]',
  },
  data() {
    return {
    };
  },
  methods: {
    init() {
      const promise = Promise.resolve()
        .then(() => {
          this.data.current = initParam;
          return this.appendChild(this.data.current, this.elements.container, 0);
        });
      return promise;
    },
    changeCurrent(cpt) {
      if (!Component.isComponent(cpt) || this.data.current === cpt) { return false; }
      const beforeCurrent = this.data.current;
      this.data.current = cpt;
      return this.replaceChild(this.data.current, beforeCurrent);
    },
    bindEvents() {
      Dom.of(this.elements.bubbleSort).on('click', () => this.methods.changeCurrent(bubbleSortParam));
      Dom.of(this.elements.selectionSort).on('click', () => this.methods.changeCurrent(selectionSortParam));
      Dom.of(this.elements.insertionSort).on('click', () => this.methods.changeCurrent(insertionSortParam));
      Dom.of(this.elements.shellSort).on('click', () => this.methods.changeCurrent(shellSortParam));
      Dom.of(this.elements.mergeSort).on('click', () => this.methods.changeCurrent(mergeSortParam));
      Dom.of(this.elements.quickSort).on('click', () => this.methods.changeCurrent(quickSortParam));
      Dom.of(this.elements.heapSort).on('click', () => this.methods.changeCurrent(heapSortParam));
      Dom.of(this.elements.countingSort).on('click', () => this.methods.changeCurrent(countingSortParam));
      Dom.of(this.elements.bucketSort).on('click', () => this.methods.changeCurrent(bucketSortParam));
      Dom.of(this.elements.radixSort).on('click', () => this.methods.changeCurrent(radixSortParam));
    },

  },
  created() {
    const promise = Promise.resolve()
      .then(() => this.methods.init())
      .then(() => this.methods.bindEvents());
    return promise;
  },
};
export default param;
