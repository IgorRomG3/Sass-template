//template.js

(function() {
  window.addEventListener('load', () => {
    initPage();
  })

  function initPage() {
    console.log('template');  
  }

  function sequence() {
    const args = Array.prototype.slice.call(arguments);
    const funcs = R.type(R.last(args)) == 'Array' ? R.zip([...R.dropLast(1, args)], R.last(args)) : args;

    return () => {
      R.map(func => R.type(func) == 'Array' ? func[0](R.join(',', R.tail(func))) : func() , funcs);
    }
  }
})();