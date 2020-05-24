function processArray(input) {
  return input.filter(i => !!i)
}

function processObject(input) {
  Object.keys(input).forEach(key => {
    if (!input[key]) {
      delete input[key]
    }
  })
  return input
}

function useObjectIfTruthy(target, obj) {
  return (target ? obj : {})
}

function processTemplate(template, data = {}) {
  return template.replace(/\{\{([^}]+)\}\}/g, function (match) {
      match = match.slice(2, -2).trim();
      var sub = match.split('.');
      if (sub.length > 1) {
          var temp = data;
          sub.forEach(function (item) {
              if (!temp[item]) {
                  temp = '';
                  return;
              }
              temp = temp[item];
          });
          return temp;
      }

      else {
          if (!data[match]) return '';
          return data[match];
      }
  });
}

module.exports = {
  processArray,
  processObject,
  useObjectIfTruthy,
  processTemplate,
}