function isAN(value) {
  if (value instanceof Number) value = value.valueOf(); // Если это объект числа, то берём значение, которое и будет числом
  // console.log("value=",value, typeof value, parseFloat(value), typeof parseFloat(value))
  return isFinite(value) && value === parseFloat(value);
}

function movingAvg(array, count, qualifier) {
  // console.log(array,count)
  if (isNaN(count)) {
    count = 3;
  }
  // /** скользящее среднее
  //     * returns an array with moving average of the input array
  //     * @param array - the input array
  //     * @param count - the number of elements to include in the moving average calculation
  //     * @param qualifier - an optional function that will be called on each
  //     *  value to determine whether it should be used
  //     */
  // calculate average for subarray
  function avg(array, qualifier) {
    let sum = 0,
      count = 0,
      val;
    for (let i in array) {
      val = array[i];
      if (!qualifier || qualifier(val)) {
        if (val) {
          sum += val;
          count++;
        }
      }
    }
    if (count > 0) {
      return sum / count;
    } else {
      return NaN;
    }
  }
  let result = [],
    val;
  // pad beginning of result with null values
  for (let i = 0; i < count - 1; i++) result.push(NaN);
  // calculate average for each subarray and add to result
  for (let i = 0, len = array.length - count; i <= len; i++) {
    val = avg(array.slice(i, i + count), qualifier);
    if (isNaN(val)) result.push(NaN);
    else result.push(val);
  }
  return result;
}
/*
  Hampel Filter implemented in JavaScript by Adam O'Grady
  AN: Very basic (ie: improve before using in production) function I needed for some work stuff, used for detecting and removing outliers in a moving window via Median Absolute Deviation (MAD)
  PARAMS:
    data - Array of numbers to be examined
    half_window: Integer representing half the moving window size to use
    threshold: Integer for the maximum multiple of the Median Absolute Deviation before it's considered an outlier and replaced with the median
  RETURNS:
    object:
      data: updated, smoothed array
      ind: original indicies of removed outliers
*/

function median(numbers) {
  const middle = (numbers.length + 1) / 2;
  const sorted = [...numbers].sort((a, b) => a - b); // you have to add sorting function for numbers
  const isEven = sorted.length % 2 === 0;
  return isEven
    ? (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2
    : sorted[middle - 1];
}

function hampelFilter(data, half_window, threshold) {
  if (isNaN(threshold)) {
    threshold = 3;
  }
  if (isNaN(half_window)) {
    half_window = 5;
  }

  let n = data.length;
  let data_copy = data;
  let ind = [];
  let L = 1.4826;
  for (let i = half_window + 1; i < n - half_window; i++) {
    const formed1 = data.slice(i - half_window, i + half_window);
    const formed2 = formed1.filter(function (value) {
      return !Number.isNaN(value);
    });
    let med = median(formed2);
    let MAD =
      L *
      median(
        formed2.map(function (e) {
          return Math.abs(e - med);
        })
      );
    if (Math.abs(data[i] - med) / MAD > threshold) {
      data_copy[i] = med;
      ind = ind.concat(i);
    }
  }
  return {
    data: data_copy,
    outliers: ind,
  };
}

function readTextFile(file) {
  let allText;
  let rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        allText = rawFile.responseText;
      }
    }
  };
  rawFile.send(null);
  return allText;
}
function cleanDoubleSpaces(str) {
  return str.replace(/\s{2,}/g, " ").trim();
}
function csvToArray(str, delimiter = ",") {
  let headers = cleanDoubleSpaces(str.slice(0, str.indexOf("\n"))).split(
    delimiter
  );
  headers.unshift("NUMBERS");

  // console.log("headers=",headers)
  let rows = str.slice(str.indexOf("\n") + 1).split("\n");
  let inorder = 0;
  // rows2 = rows.map(function (el) {
  //   inorder++
  //   el=inorder.toString()+delimiter+el
  //   console.log("el1=",el)
  //   return el
  // });
  rows = rows.filter(function (el) {
    // inorder++
    // predel=el
    // el=inorder.toString()+delimiter+el
    // console.log("el2=",el)
    return (el != null && el != "") || el === 0;
  });
  // console.log("rows=",rows)

  rows = rows.map(function (row) {
    inorder++;
    row = inorder.toString() + delimiter + row;
    return row;
  });
  // console.log("rows=",rows)
  const arr = rows.map(function (row) {
    const values = cleanDoubleSpaces(row).split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    // inorder++
    // el2=inorder.toString()+delimiter+el
    return el;
  });
  // console.log("csvToArray -2")
  // console.log("arr=",arr)
  return arr;
}

function guessDelimiters(text, possibleDelimiters) {
  return possibleDelimiters.filter(weedOut);

  function weedOut(delimiter) {
    let cache = -1;
    return text.split("\n").every(checkLength);

    function checkLength(line) {
      if (!line) {
        return true;
      }
      let length = line.split(delimiter).length;
      if (cache < 0) {
        cache = length;
      }
      return cache === length && length > 1;
    }
  }
}

function convertToCsv(fName, rows) {
  let csv = "";
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    for (let j = 0; j < row.length; j++) {
      let val = row[j] === null ? "" : row[j].toString();
      val = val.replace(/\t/gi, " ");
      if (j > 0) csv += ",";
      csv += val;
    }
    csv += "\n";
  }
  // for UTF-16
  let cCode,
    bArr = [];
  bArr.push(255, 254);
  for (let i = 0; i < csv.length; ++i) {
    cCode = csv.charCodeAt(i);
    bArr.push(cCode & 0xff);
    bArr.push((cCode / 256) >>> 0);
  }

  let blob = new Blob([new Uint8Array(bArr)], {
    type: "text/csv;charset=UTF-16LE;",
  });
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, fName);
  } else {
    let link = document.createElement("a");
    if (link.download !== undefined) {
      let url = window.URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
}

function stepround(value, step) {
  step || (step = 1.0);
  let inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

function roundNumber(num, scale) {
  if (!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + scale) + "e-" + scale);
  } else {
    let arr = ("" + num).split("e");
    let sig = "";
    if (+arr[1] + scale > 0) {
      sig = "+";
    }
    let i = +arr[0] + "e" + sig + (+arr[1] + scale);
    let j = Math.round(i);
    let k = +(j + "e-" + scale);
    return k;
  }
}
function newfilename(str) {
  // m = str.search(/\S\(([0-9_]+)\)/)+1
  // str2 = str.replace(/\(([0-9_]+)\)/,'')
  let m = str.search(/_\#([0-9]+)/) + 1;
  let str2 = str.replace(/_\#([0-9]+)/, "");
  // console.log(m,str,str2)
  let delta = str.length - str2.length;
  let nums = str.slice(m, m + delta);
  let num = +nums.slice(1, nums.length) + 1;
  let nums2 = "_#" + num.toString();
  let str3 = str2 + nums2;
  // str3=str2+nums2
  // console.log(m,str,str2,delta,nums,num,nums2,str3)
  return str3;
}

function num_word(value, words) {
  value = Math.abs(value) % 100;
  let num = value % 10;
  if (value > 10 && value < 20) return words[2];
  if (num > 1 && num < 5) return words[1];
  if (num == 1) return words[0];
  return words[2];
}
