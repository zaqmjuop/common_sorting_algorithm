
const param = {
  name: 'selectionSort',
  query: 'selectionSort',
  url: './assets/templates/selectionSort.html',
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
  created() { console.log('create selectionSort'); },
  implanted() { console.log('implanted selectionSort'); },
};

export default param;