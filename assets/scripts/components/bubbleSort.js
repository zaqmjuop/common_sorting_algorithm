
const param = {
  name: 'bubbleSort',
  query: 'bubbleSort',
  url: './assets/templates/bubbleSort.html',
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
  created() { console.log('create bubbleSort'); },
  implanted() { console.log('implanted bubbleSort'); },
};

export default param;
