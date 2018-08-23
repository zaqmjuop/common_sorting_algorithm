
const param = {
  name: 'insertionSort',
  query: 'insertionSort',
  url: './assets/templates/insertionSort.html',
  data() {
    return { counter: 1 };
  },
  selectors: {
    div: 'div',
  },
  methods: {
    log() {
      console.log(this);
    },
  },
  created() { console.log('create insertionSort'); },
  implanted() { console.log('implanted insertionSort'); },
};

export default param;