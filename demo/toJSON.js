;(_ => {
  'use strict';
  FormData.prototype.toJSON = function() {
    var obj = {};
    var item;

    /*
     * translate everthing that is in the form
     * to an object
     */
    for (item of this) {
      var key = item[0];
      var value = item[1];
      if (key in obj) {
        /*
         * add a flag called "multiple" in order to
         * catch multiple keys into an array
         */
        if (obj[key].multiple) {
          obj[key].push(value);
        } else {
          // convert the single entry into an array
          obj[key] = [obj[key]];

          // set the flag to true
          obj[key].multiple = true;

          obj[key].push(value);
          /*
           * the motivation is that I'm not sure if the value
           * of the current input is an array.
           */
        }
      } else {
        /* <input type="file" name="myfile">
         *
         * falls as an object File, e.g
         * {
         *   'myfile': File
         * }
         */
        obj[key] = value;
      }
    }


    // Remove the flag "multiple" from every property if present
    for (item in obj) {
      if (obj[item].hasOwnProperty('multiple')) {
        delete obj[item].multiple;
      }
    }
    return obj;
  };
})();
