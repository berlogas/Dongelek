limit = 16;
$(() => {
  $(document).on("change", "#id_columns", function () {
    // alert("111")
    const selects = document.querySelectorAll(".columns");
    let xx = [];
    let nn = -1;
    for (let elem of selects) {
      if (elem.value && elem.checked) xx.push(elem.value);
      if (elem.value === "X" && elem.checked) {
        // console.log(elem.value,elem.checked,elem.name)
        nn = +elem.name;
      }
    }
    // console.log("1=",xx,nn)

    // let selects2 = document.querySelectorAll("#id_columns");
    // let xx2 = [];
    // let nn2 = -1;
    // for (let elem of selects2) {

    //   if (elem.value) xx2.push(elem.value);
    //   if (elem.value === "X" ) {//&& elem.checked
    //     console.log(elem.value,elem.name)
    //     nn2 = +elem.name;}
    // }
    // console.log("2=",xx2,nn2)

    const result = xx.reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1;
      return acc;
    }, {});
    // console.log(nn,result)
    let allnumber = true;
    for (let i = 0; i < limit; i++) {
      const obj = Object.values(dataarray[i])[parseInt(nn) - 1];
      if (!obj) break;
      if (obj.length === 13) allnumber = false;
      if (isNaN(obj)) allnumber = false;
      if (!allnumber) break;
    }
    if (allnumber) {
      $("#List1").val("num").change();
    } else {
      $("#List1").val("date").change();
    }
    block[lastIndex].style.display = "none";
    // Чтобы сразу делать именно его невидимым при следующей смене
    let index = select.selectedIndex; // Определить индекс выбранной опции
    block[index].style.display = "block"; // Показать блок с соответствующим индексом
    lastIndex = index; // Обновить сохраненный индекс.
    const numx = result["X"];
    if (numx === 1) {
      $(".edit-container").show();
    } else {
      $(".edit-container").hide();
    }
  });
});

const loader = document.querySelector(".loader");
const toggleLoader = (state) => {
  $("#loader").attr("hidden", state);
};

function waitValidation() {
  return new Promise((resolve) => {
    setTimeout(() => {
      formValidation();
      resolve();
    }, 0);
  });
}

function startValidation() {
  const timeout = setTimeout(toggleLoader(false), 0);
  waitValidation().then(() => {
    toggleLoader(true);
    clearTimeout(timeout);
  });
  return false;
}

function waitSmooth(chart, mydatanew) {
  return new Promise((resolve) => {
    setTimeout(() => {
      smooth(chart, mydatanew);
      resolve();
    }, 0);
  });
}

function startSmooth(chart, mydatanew) {
  const timeout = setTimeout(toggleLoader(false), 0);
  waitSmooth(chart, mydatanew).then(() => {
    toggleLoader(true);
    clearTimeout(timeout);
  });
  return false;
}

function waitSpline(chart, labels, mydatanew) {
  return new Promise((resolve) => {
    setTimeout(() => {
      spline(chart, labels, mydatanew);
      resolve();
    }, 0);
  });
}

function startSpline(chart, labels, mydatanew) {
  const timeout = setTimeout(toggleLoader(false), 0);
  waitSpline(chart, labels, mydatanew).then(() => {
    toggleLoader(true);
    clearTimeout(timeout);
  });
  return false;
}

function waitCrop(chart, format, labels, colX) {
  return new Promise((resolve) => {
    setTimeout(() => {
      crop(chart, format, labels, colX);
      resolve();
    }, 0);
  });
}

function startCrop(chart, format, labels, colX) {
  const timeout = setTimeout(toggleLoader(false), 0);
  waitCrop(chart, format, labels, colX).then(() => {
    toggleLoader(true);
    clearTimeout(timeout);
  });
  return false;
}

function waitOuts(chart, mydatanew) {
  return new Promise((resolve) => {
    setTimeout(() => {
      outs(chart, mydatanew);
      resolve();
    }, 0);
  });
}

function startOuts(chart, mydatanew) {
  const timeout = setTimeout(toggleLoader(false), 0);
  waitOuts(chart, mydatanew).then(() => {
    toggleLoader(true);
    clearTimeout(timeout);
  });
  return false;
}

function waitCancel(chart, mydataold) {
  return new Promise((resolve) => {
    setTimeout(() => {
      cancels(chart, mydataold);
      resolve();
    }, 0);
  });
}

function startCancel(chart, mydataold) {
  const timeout = setTimeout(toggleLoader(false), 0);
  waitCancel(chart, mydataold).then(() => {
    toggleLoader(true);
    clearTimeout(timeout);
  });
  return false;
}

$("#threshold").keydown(function (e) {
  if (e.keyCode === 13) {
    return false;
  }
});
$("#half").keydown(function (e) {
  if (e.keyCode === 13) {
    return false;
  }
});
$("#wincount").keydown(function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
  }
});
$("#expfile").keydown(function (e) {
  if (e.keyCode === 13) {
    return false;
  }
});

let datefor = [];
GFG_Fun();
// Нарезка списка для select
function GFG_Fun() {
  $.each(elmts, function (i, p) {
    let ap = p.split(",");
    datefor.push(ap[0]);
    $("#dateformat").append($("<option></option>").val(ap[0]).html(ap[1]));
    $("#dateformate").append($("<option></option>").val(ap[0]).html(ap[1]));
  });
}

let select = document.getElementById("List1");
let block = document.querySelectorAll(".block");
let lastIndex = 0; // После каждой смены опции, сохраняем сюда индекс предыдущего блока

select.addEventListener("change", function () {
  // console.log("изменился селект");
  block[lastIndex].style.display = "none";
  // Чтобы сразу делать именно его невидимым при следующей смене
  let index = select.selectedIndex; // Определить индекс выбранной опции
  block[index].style.display = "block"; // Показать блок с соответствующим индексом
  lastIndex = index; // Обновить сохраненный индекс.
});

// Создаем новый объект связанных списков
let syncList1 = new syncList();

// Определяем значения подчиненных списков (2 и 3 селектов)
syncList1.dataList = {
  /* Определяем элементы второго списка в зависимости 
от выбранного значения в первом списке */

  date: {
    // num: "число",
    "": "без осреднения",
    second: "секунда",
    minute: "минута",
    hour: "час",
    day: "день",
    week: "неделя",
    decade: "декада",
    month: "месяц",
    quarter: "квартал",
    year: "год",
  },

  minute: {
    1: "1 min",
    5: "5",
    10: "10",
    15: "15",
    20: "20",
    30: "30",
  },

  hour: {
    1: "1 hour",
    2: "2",
    3: "3",
    4: "4",
    6: "6",
    8: "8",
    12: "12",
  },
};

// Включаем синхронизацию связанных списков
syncList1.sync("List1", "List2", "List3");

fname = "";
// Элемент для выбора файлов.
const INPUT = document.querySelector('input[name="myfile"]');
// Элемент для вывода сгенерированной таблицы.
const PREVIEWT1 = document.querySelector("#center1");
const PREVIEWT2 = document.querySelector("#center2");
// Регулярное выражение для проверки расширения файла.
const REGEX = new RegExp("(.*?).(csv|txt)$", "i");
// Регистрируем функцию обработчика события `change`,
// срабатывающего при изменении элемента выбора файла.
INPUT.addEventListener("change", handleFile);
$(".table-container").hide();
$(".graph-container").hide();
$(".form-container").show();
$(".edit-container").hide();

// Функция, отрабатывающая при выборе файла.
function handleFile(event) {
  const file = event.target.files[0];
  // console.log(this.files[0].mozFullPath);
  if (file) {
    fname = file.name;
    if (file && REGEX.test(file.name)) {
      const reader = new FileReader();
      reader.onload = (e) => renderTable(e.target.result);
      reader.readAsText(file);
      // console.log(fname, file.moz)
      document.getElementById("fname").innerHTML = fname;
    } else {
      // alert("Файл не выбран либо его формат не поддерживается.");
      new Toast({
        title: false,
        text: "Файл не выбран либо его формат не поддерживается!",
        theme: "warning",
        autohide: true,
        interval: 10000,
      });
      event.target.value = "";
    }
  }
}
// Функция отрисовки таблицы.
function renderTable(data) {
  // $("#loader").attr("hidden",false);
  $(".table-container").show();
  // $(".edit-container").show();
  // $("#loader").attr("hidden",true);
  // console.log(cleanDoubleSpaces(data.split("\n")[0]))
  let delimiter = guessDelimiters(cleanDoubleSpaces(data.split("\n")[0]), [
    ",",
    ";",
    "\t",
    " ",
  ]);
  // console.log("data=",data)
  dataarray = csvToArray(data, delimiter);
  // console.log("dataarray=",dataarray)
  // let limit = 12;
  text1 =
    "Выберите одну колонку для оси X \
        (например, дата, глубина или давление) \
        и одну или несколько для оси Y ";
  text2 =
    "(много данных - " +
    dataarray.length +
    " строк, для просмотра взяты первые " +
    limit +
    " " +
    num_word(limit, ["строка", "строки", "строк"]) +
    ")";
  if (dataarray.length < 300) {
    limit = dataarray.length;
    text2 =
      "(всего " +
      limit +
      " " +
      num_word(limit, ["строка", "строки", "строк"]) +
      " данных)";
  }
  let h5s = document.querySelector("#h5");
  h5s.textContent = text1 + text2;
  let table1 = document.createElement("table");
  let table2 = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");
  table1.classList.add("table");
  table1.classList.add("resp-tab");
  $("table1").attr("id", "resp-tab");
  table2.classList.add("table");
  table2.classList.add("resp-tab");
  $("table2").attr("id", "resp-tab");
  tbody.classList.add("tbody");
  // Разбиваем входящие данные построчно.
  // Разделитель - перенос строки.
  // Перебираем полученный массив строк.
  let nnn = 1;
  let shouldSkip = false;
  data.split(/\r\n|\r|\n/).forEach(function (row, index) {
    // console.log(row,index)

    if (index === 0) {
      row = "NUMBERS" + delimiter + row;
    } else {
      row = index.toString() + delimiter + row;
    }
    // console.log(row,index)
    if (shouldSkip) return;
    if (index > limit) {
      shouldSkip = true;
      return;
    }
    // Создадим элемент строки для таблицы.
    let trow = document.createElement("tr");
    // Разбиваем каждую строку на ячейку.
    // Разделитель - из guessDelimiters.
    // Перебираем полученный массив будущих ячеек.
    let i = 0;
    cleanDoubleSpaces(row)
      .split(delimiter)
      .forEach(function (cell) {
        if (index === 0) {
          i++;
          nnn++;
        }
        // Создадим элемент ячейки для таблицы.
        let tcell = document.createElement(index > 0 ? "td" : "th");
        tcell.setAttribute("id", "tab" + i);
        // Заполним содержимое ячейки.
        tcell.textContent = cell;
        // Добавляем ячейку к родительской строке.
        trow.appendChild(tcell);
      });
    // Добавляем строку к родительскому элементу.
    // Если индекс строки больше нуля,
    // то родительский элемент - `tbody`,
    // в противном случае- `thead`.
    index > 0 ? tbody.appendChild(trow) : thead.appendChild(trow);
  });
  // Добавляем заголовок таблицы к родительскому элементу.
  table1.appendChild(thead);
  // Добавляем тело таблицы к родительскому элементу.
  table2.appendChild(tbody);
  // Очищаем элемент для вывода таблицы.Добавляем саму таблицу к родительскому элементу.
  PREVIEWT1.innerHTML = "";
  PREVIEWT1.appendChild(table1);
  PREVIEWT2.innerHTML = "";
  PREVIEWT2.appendChild(table2);

  for (let i = 1; i < nnn; i++) {
    let elem = document.createElement("div");
    elem.innerHTML =
      // <div class="form-group">
      //             <select  form="addColumns" id="id_columns" class="form-control" name="${i}" placeholder="columns" required>
      //               <option value="0">...</option>
      //               <option value="X">X</option>
      //               <option value="Y">Y</option>
      //             </select>
      //            </div>

      `  <div style="margin-top: 1px;" class="form-group">
          <span class="tristate tristate-switcher" id="id_columns">
            <input type="radio" class="columns" name="${i}" value="X">
            <input type="radio" class="columns" name="${i}" value="0" checked>
            <input type="radio" class="columns" name="${i}" value="Y">
            <i></i>
            
          </span>
        </div>`;

    document.querySelector("#tab" + i).appendChild(elem);
  }
  // let elem = document.createElement("div");
  // elem.innerHTML =
  //   `<input type="hidden" form="addColumns" name="columns" value="` + i + `">`;
  // document.querySelector("#preview").appendChild(elem);
}

function getDateTime(now, interval) {
  return new Date(
    Math.floor(new Date(now).getTime() / (interval * 1000)) * (interval * 1000)
  );
}

function getdateformat(tempx, datefor) {
  // console.log(datefor);
  for (let i = 0; i < tempx.length; i++) {
    // console.log("tempx=", tempx[i]);
    let newtempx = tempx[i].replace(/[\/\.]/g, "-");

    // for (let j = 0; j < datefor.length; j++) {
    //   console.log("datefor=", datefor[j]);
    //   console.log(newtempx, moment(newtempx, datefor[j], true).isValid());
    //   console.log(moment(newtempx).format(datefor[j]));
    // }
  }
  let dateformat = "123";
  return dateformat;
}

function formValidation() {
  // $("#loader").attr("hidden",false);
  let x = "0";
  let y = "0";
  // let selects = document.querySelectorAll("select");
  let seltri = document.querySelectorAll("input");
  // console.log(selects)
  // console.log(seltri)
  let xx = [];
  let yy = [];
  // for (let elem of selects) {
  //   // console.log(elem.value,elem.name)
  //   if (elem.value === "X") xx.push(elem.name);
  //   if (elem.value === "Y") yy.push(elem.name);
  // }
  // // console.log(xx,yy)
  // xx = [];
  // yy = [];
  for (let elem of seltri) {
    // console.log(elem.value,elem.name,elem.checked)
    if (elem.value === "X" && elem.checked) xx.push(elem.name);
    if (elem.value === "Y" && elem.checked) yy.push(elem.name);
  }
  // console.log(xx,yy)

  xx.length === 1 ? (x = xx[0]) : (x = "0");
  yy.length === 0 ? (y = "0") : (y = yy[0]);

  if (x !== "0" && y !== "0") {
    let accuracy1 = +Number(document.getElementById("accuracy1").value);
    let format = document.getElementById("List1").value;
    let list2 = document.getElementById("List2").value;
    let list3 = document.getElementById("List3").value;
    let dateformat = document.getElementById("dateformat").value;
    let dateformate = dateformat; //document.getElementById("dateformate").value;
    xtitle = Object.keys(dataarray[0])[parseInt(x) - 1];
    yytitle = [];
    yy.forEach(function (element) {
      yytitle.push(Object.keys(dataarray[0])[parseInt(element) - 1]);
    });
    ytitle = yytitle[0];

    let XArr = [];
    let Accu = [];
    let arr = [];
    nnan = 0;
    for (let i = 0; i < dataarray.length; i++) {
      const obj = Object.values(dataarray[i])[parseInt(x) - 1];
      // console.log("x=",x,obj)
      if (format === "num") {
        if (accuracy1 === 0) {
          arr = !isNaN(obj) ? [+Number(obj)] : [NaN];
        } else {
          const f1 = ~(accuracy1 + "").indexOf(".")
            ? (accuracy1 + "").split(".")[1].length
            : 0;
          arr = [roundNumber(stepround(+Number(obj), accuracy1), f1)];
        }
      }

      if (format === "date") {
        const xdate = moment(obj, dateformat).format("x");
        arrtemp = moment(
          moment(obj, dateformat).format(dateformat),
          dateformat,
          true
        ).isValid()
          ? +xdate
          : NaN;
        switch (list2) {
          case "second":
            arr = [+moment(getDateTime(new Date(arrtemp), 1)).format("x")];
            //Здесь выполняются инструкции, если результат выражения равен value1
            break;
          case "minute":
            minute = +moment(new Date(arrtemp)).minute();
            minute = Math.trunc(minute / +list3) * +list3;
            arrtemp = moment(new Date(arrtemp)).set("minute", minute);
            arr = [+moment(moment(arrtemp).startOf("minute")).format("x")];
            break;
          case "hour":
            hour = +moment(new Date(arrtemp)).hour();
            hour = Math.trunc(hour / +list3) * +list3;
            arrtemp = moment(new Date(arrtemp)).set("hour", hour);
            arr = [+moment(moment(arrtemp).startOf("hour")).format("x")];
            break;
          case "day":
            mno = 86400;
            arr = [+moment(getDateTime(new Date(arrtemp), mno)).format("x")];
            break;
          case "week":
            arr = [+moment(moment(arrtemp).startOf("isoWeek")).format("x")];
            break;
          case "decade":
            day = moment(new Date(arrtemp)).date();
            if (day < 11) arrtemp = moment(new Date(arrtemp)).set("date", 1);
            if (day > 10 && day < 21)
              arrtemp = moment(new Date(arrtemp)).set("date", 11);
            if (day > 20) arrtemp = moment(new Date(arrtemp)).set("date", 21);
            arr = [+moment(moment(arrtemp).startOf("day")).format("x")];
            break;
          case "month":
            arr = [+moment(moment(arrtemp).startOf("month")).format("x")];
            break;
          case "quarter":
            arr = [+moment(moment(arrtemp).startOf("quarter")).format("x")];
            break;
          case "year":
            arr = [+moment(moment(arrtemp).startOf("year")).format("x")];
            break;
          default:
            arr = [+moment(arrtemp).format("x")];
            break;
        }
      }
      let acc = [];
      yy.forEach(function (element) {
        let obj = Object.values(dataarray[i])[parseInt(element) - 1];
        let value = Number(obj);
        const length = value.toString().match(/\.(\d+)/)?.[1].length;
        const f = ~(value + "").indexOf(".")
          ? (value + "").split(".")[1].length
          : 0;
        if (!obj) value = null;
        arr.push(value);
        acc.push(f);
      });

      if (Object.values(dataarray[i])[parseInt(x) - 1]) {
        if (!isNaN(arr[0])) {
          XArr.push(arr);
          Accu.push(acc);
        } else nnan++;
      }
    }
    if (nnan > 2) {
      new Toast({
        title: false,
        text: "Много неформатных данных по X, проверьте исходные данные или подберите формат даты!",
        theme: "warning",
        autohide: true,
        interval: 10000,
      });
      return false;
    }
    accuracy = [];
    for (let j = 0; j < yy.length; j++) {
      let ac = Accu.map(function (value, index) {
        return value[j];
      });
      let count5 = Object.create(null);
      for (let q = 0; q < ac.length; ++q) {
        if (!count5[ac[q]]) {
          count5[ac[q]] = { i: q, n: 1 };
        } else {
          ++count5[ac[q]].n;
        }
      }
      let order5 = Object.keys(count5).sort(function (x5, y5) {
        return count5[y5].n - count5[x5].n || count5[x5].i - count5[y5].i;
      });
      let res = [];
      for (let q = 0; q < order5.length; ++q) {
        for (let w = 0; w < count5[order5[q]].n; ++w) {
          res.push(+order5[q]);
        }
      }
      accuracy.push(res[j]);
    }
    // console.log(XArr)
    XArr.sort(
      (function (index) {
        return function (a, b) {
          return a[index] === b[index] ? 0 : a[index] < b[index] ? -1 : 1;
        };
      })(0)
    );
    // alert(XArr)
    let NewArr = [];
    let NArr = [];
    const col = XArr[0].length;
    let itog = [NaN];
    for (let i = 1; i < col; i++) {
      itog.push([NaN, NaN]);
    }
    // console.log("XArr=",XArr)
    XArr.forEach((item, j) => {
      // console.log(j,item[0],item[1])
      if (itog[0] != item[0]) {
        if (j > 0) {
          // console.log("itog=",j,itog)
          NArr[0] = itog[0];
          for (let i = 1; i < col; i++) {
            NArr[i] = +(itog[i][1] / itog[i][0]).toFixed(accuracy[i - 1]);
            // console.log(j,NArr[i],itog[i][1],itog[i][1],accuracy[i - 1])
          }
          NewArr.push(NArr);
          NArr = [];
        }

        itog = [NaN];
        for (let i = 1; i < col; i++) {
          itog.push([NaN, NaN]);
        }
        itog[0] = item[0];
      }
      // console.log("y=",item)
      item.forEach((y, i) => {
        // console.log(i, "!isNaN(y)=",y, !isNaN(y),!!y)
        if (i > 0 && !isNaN(y) && !!y) {
          //
          itog[i][0] = (itog[i][0] || 0) + 1;
          itog[i][1] = (itog[i][1] || 0) + y;
        }
        // console.log(itog[i][0],itog[i][1])
      });
    });
    NArr[0] = itog[0];
    for (let i = 1; i < col; i++) {
      NArr[i] = +(itog[i][1] / itog[i][0]).toFixed(accuracy[i - 1]);
    }

    NewArr.push(NArr);
    NArr = [];
    // console.log("NewArr=",NewArr)
    let colX = NewArr.map(function (value, index) {
      return value[0];
    });
    colYs = [];
    for (let i = 1; i <= yy.length; i++) {
      colYs.push(
        NewArr.map(function (value, index) {
          return value[i];
        })
      );
    }

    NewArr.length > 0
      ? Graph(colX, colYs)
      : new Toast({
          title: false,
          text: "Не выбраны данные!",
          theme: "warning",
          autohide: true,
          interval: 10000,
        });
    return false;
  }
  new Toast({
    title: false,
    text: "Не выбраны данные!",
    theme: "warning",
    autohide: true,
    interval: 10000,
  });
  return false;
}
