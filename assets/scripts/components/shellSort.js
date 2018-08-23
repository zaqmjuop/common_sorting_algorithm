
const param = {
  name: 'shellSort',
  query: 'shellSort',
  url: './assets/templates/shellSort.html',
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
  created() { console.log('create shellSort'); },
  implanted() { console.log('implanted shellSort'); },
};

export default param;