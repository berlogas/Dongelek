function outs(chart) {
  // Выбросы Hampel Filter
  let ma = [];
  for (let i = 0; i < rightIndex - leftIndex; ++i) {
    ma.push(mydatanew[i + leftIndex]);
  }
  // console.log(mydatanew,"ma1=",ma)
  let half = $("#half").val();
  let threshold = $("#threshold").val();
  ma = hampelFilter(ma, parseInt(half, 10), parseInt(threshold, 10)).data;
  for (let i = 1; i < rightIndex - leftIndex; ++i) {
    mydatanew[i + leftIndex] = ma[i];
  }
  // console.log("ma2=",ma)
  chart.data.datasets[0].data = [];
  for (let i = 0; i < rightIndex - leftIndex; ++i) {
    chart.data.datasets[0].data.push(mydatanew[i + leftIndex]);
  }
  chart.update();
}

function smooth(chart) {
  // Скользящее среднее
  let wincount = $("#wincount").val();
  let wincountint = parseInt(wincount, 10);
  // console.log(leftIndex,rightIndex,mydatanew,mydatanew.length)
  // console.log(leftIndex!=0 || rightIndex!=mydatanew.length)
  if (wincountint != 3 && (leftIndex != 0 || rightIndex != mydatanew.length)) {
    // alert ("Скользящее среднее с размером окна не равным 3 возможно только для всего ряда")
    new Toast({
      title: false,
      text: "Скользящее среднее с размером окна не равным 3 возможно только для всего ряда! Для работы со всем рядом сделайте двойной клик на слайдере.",
      theme: "warning",
      autohide: true,
      interval: 10000,
    });
  } else {
    let ma = [];
    for (let i = 0; i < rightIndex - leftIndex; ++i) {
      ma.push(mydatanew[i + leftIndex]);
    }
    // console.log("ma1=",ma)
    ma = movingAvg(ma, wincountint);
    // console.log("ma2=",ma)
    let n = 0;
    chart.data.datasets[0].data = [];
    if (wincountint === 3) {
      chart.data.datasets[0].data.push(mydatanew[leftIndex]);
      n = 1;
    }

    for (let i = parseInt(wincount / 2, 10) + n; i < ma.length; ++i) {
      // console.log(ma[i],wincount,i,mydatanew[i])
      chart.data.datasets[0].data.push(ma[i]);
    }
    if (n === 1) {
      chart.data.datasets[0].data.push(mydatanew[ma.length + leftIndex - 1]);
    } else {
      for (let i = 0; i < parseInt(wincount / 2, 10); ++i) {
        chart.data.datasets[0].data.push(NaN);
      }
    }
    for (let i = 0; i < rightIndex - leftIndex; ++i) {
      mydatanew[i + leftIndex] = chart.data.datasets[0].data[i];
    }

    chart.update();
  }
}

function spline(chart, labels) {
  // Заполнение пропусков c помощью Akima-interpolator
  // 1.Выбираем не пустые для Akima
  const mma = [...mydatanew];
  let ma = [];
  let labelsclean = [];
  let dataclean = [];
  let firsti = 0;
  let lasti = labels.length;
  for (let i = 0; i < labels.length; ++i) {
    if (!isNaN(mma[i])) {
      labelsclean.push(labels[i]);
      dataclean.push(mma[i]);
      if (firsti === 0) firsti = i;
    }
  }
  for (let i = labels.length; i > 0; --i) {
    if (!isNaN(mma[i])) {
      if (lasti === labels.length) {
        lasti = i;
        break;
      }
    }
  }
  // 2.Заполнение видимых
  if (dataclean.length < mydatanew.length) {
    var akima = new SplineInterpolatorAkima();
    var f = akima.createInterpolator(labelsclean, dataclean);
    for (let i = 0; i < rightIndex - leftIndex; ++i) {
      if (
        isNaN(mydatanew[i + leftIndex]) &&
        i + leftIndex > firsti &&
        i + leftIndex <= lasti
      ) {
        ma.push(f(labels[i + leftIndex]));
      } else {
        ma.push(mydatanew[i + leftIndex]);
      }
    }
    for (let i = 0; i < ma.length; ++i) {
      mydatanew[i + leftIndex] = ma[i];
    }
    chart.data.datasets[0].data = [...ma];
    chart.update();
  }
}

function crop(chart, format, labels, colX) {}

function cancels(chart, mydataold) {
  // Отмена изменений
  mydatanew = [...mydataold];
  chart.data.datasets[0].data = [];
  for (let i = 0; i < DATA_COUNT; ++i) {
    chart.data.datasets[0].data.push(mydatanew[i + leftIndex]);
  }
  chart.update();
}

function getssm(mydata) {
  const omin = (values) =>
    values.reduce((m, v) => (v != null && v < m ? v : m), Infinity);
  const omax = (values) =>
    values.reduce((m, v) => (v != null && v > m ? v : m), -Infinity);
  let mindata = omin(mydata),
    maxdata = omax(mydata);
  let mmin = mindata - (maxdata - mindata) * 0.01;
  let mmax = maxdata + (maxdata - mindata) * 0.01;
  if (mmin === mmax) {
    mmin = mmin * 0.99;
    mmax = mmax * 1.01;
  }
  return smartScale(mmin, mmax, 11);
}

function getssl(minlabel, maxlabel) {
  let lmin = minlabel - (maxlabel - minlabel) * 0.01;
  // lmin = lmin < 0 ? 0 : lmin;
  let lmax = maxlabel + (maxlabel - minlabel) * 0.01;
  // console.log("getssl",minlabel,lmin)
  return smartScale(lmin, lmax, 17);
}

function redraw(chart, labels, mydata, leftIndex, rightIndex) {
  // console.log("redraw")
  DATA_COUNT = rightIndex - leftIndex;
  mydataold = [...mydata];
  mydatanew = [...mydata];
  const ssm = getssm(mydata);
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.data.datasets[1].data = [];
  for (let i = 0; i < DATA_COUNT; ++i) {
    chart.data.labels.push(labels[i + leftIndex]);
    chart.data.datasets[0].data.push(mydatanew[i + leftIndex]);
    chart.data.datasets[1].data.push(mydataold[i + leftIndex]);
  }
  let minlabelchart = Math.min(...chart.data.labels),
    maxlabelchart = Math.max(...chart.data.labels);
  const ssl = getssl(minlabelchart, maxlabelchart);
  // console.log(minlabelchart,maxlabelchart,ssl.niceMinimum,ssl.niceMaximum);
  // console.log(ssl.tickSpacing,ssm.tickSpacing);
  chart.options.scales.yAxes.ticks.stepSize = ssm.tickSpacing;
  chart.options.scales.yAxes.min = ssm.niceMinimum;
  chart.options.scales.yAxes.max = ssm.niceMaximum;
  chart.options.scales.xAxes.ticks.stepSize = ssl.tickSpacing;
  chart.options.scales.xAxes.min = ssl.niceMinimum;
  chart.options.scales.xAxes.max = ssl.niceMaximum;
  chart.options.scales.yAxes.title.text = yytitle[dataindex];
  chart.update();
  small.options.scales.yAxes.min = ssm.niceMinimum;
  small.options.scales.yAxes.max = ssm.niceMaximum;
  small.options.scales.xAxes.min = Math.min(...labels);
  small.options.scales.xAxes.max = Math.max(...labels);
  small.data.labels = [];
  small.data.datasets[0].data = [];
  for (let i = 0; i < mydataold.length; ++i) {
    small.data.datasets[0].data.push(mydataold[i]);
    small.data.labels.push(labels[i]);
  }
  small.update();
}

mydataold = [];
mydatanew = [];
function Graph(colX, colYs) {
  dataindex = 0;
  leftIndex = 0;
  rightIndex = colX.length - 1;
  $(".table-container").hide();
  $(".graph-container").show();
  $(".form-container").hide();
  const b = {
    handler(chart, index) {
      dataindex = index;
      let colY = colYs[index];
      let labels = [...colX];
      const mydata = [...colY];
      redraw(chart, labels, mydata, leftIndex, rightIndex);
    },
  };

  const actions = [
    {
      name: "Вырезать",
      title: "Ограничения по оси X, параметры по клику правой кнопки мыши",
      bcolor: "LightBlue",
      handler(chart) {
        if ($("#start").val() && $("#finish").val()) {
          let minlimit = moment($("#start").val(), "YYYY-MM-DD").valueOf();
          let maxlimit = moment($("#finish").val(), "YYYY-MM-DD").valueOf();
          if (format === "date") {
            minlimit = moment($("#start").val(), "YYYY-MM-DD").valueOf();
            maxlimit = moment($("#finish").val(), "YYYY-MM-DD").valueOf();
          } else {
            minlimit = +$("#start").val();
            maxlimit = +$("#finish").val();
          }
          if (minlimit < labels[0]) minlimit = labels[0];
          if (maxlimit > labels[labels.length - 1])
            maxlimit = labels[labels.length - 1];
          const minlimind = labels.findIndex((el) => minlimit <= el);
          let maxlimind = labels.findIndex((el) => maxlimit <= el);
          // console.log(maxlimit,labels[labels.length - 1])
          // if (maxlimit < labels[labels.length - 1]) maxlimind--;
          // console.log(maxlimind)
          let colYstemp = [];
          for (let i = 0; i < colYs.length; i++) {
            colY = colYs[i];
            const colYtemp = colY.slice(minlimind, maxlimind + 1);
            colYstemp.push(colYtemp);
          }
          const colXtemp = colX.slice(minlimind, maxlimind + 1);
          colX = [...colXtemp];
          colYs = [...colYstemp];
          const mydatacrop = mydatanew.slice(minlimind, maxlimind + 1);
          const mylabelscrop = labels.slice(minlimind, maxlimind + 1);
          // console.log(mylabelscrop)
          labels = [...mylabelscrop];
          leftIndex = 0;
          rightIndex = mydatacrop.length;
          // small.data.datasets[0].data=[...chart.data.datasets[0].data]
          redraw(chart, labels, mydatacrop, leftIndex, rightIndex);
          var event = new MouseEvent("dblclick", {
            view: window,
            bubbles: true,
            // 'cancelable': true
          });
          document.getElementById("tgslider").dispatchEvent(event);
        }
      },
      contextmenu() {
        if (format === "date") {
          $("#start").attr({
            value: moment(labels[0]).format("YYYY-MM-DD"),
            min: moment(labels[0]).format("YYYY-MM-DD"),
            max: moment(labels[labels.length - 1]).format("YYYY-MM-DD"),
            type: "date",
          });
          $("#finish").attr({
            value: moment(labels[labels.length - 1]).format("YYYY-MM-DD"),
            min: moment(labels[0]).format("YYYY-MM-DD"),
            max: moment(labels[labels.length - 1]).format("YYYY-MM-DD"),
            type: "date",
          });
        } else {
          $("#start").attr({
            value: labels[0],
            min: labels[0],
            max: labels[labels.length - 1],
            type: "number",
          });
          $("#finish").attr({
            value: labels[labels.length - 1],
            min: labels[0],
            max: labels[labels.length - 1],
            type: "number",
          });
        }
        $("#crop").modal();
      },
    },
    {
      name: "Пропуски",
      title:
        "Заполнение пропущенных значений Y при наличии X сплайнами методом Акимы",
      bcolor: "Yellow",
      handler(chart) {
        startSpline(chart, labels);
      },
      contextmenu() {},
    },
    {
      name: "Выбросы",
      title:
        "Срезка методом Hampel Filter, параметры по клику правой кнопки мыши",
      bcolor: "#FFCCF9",
      handler(chart) {
        startOuts(chart);
      },
      contextmenu() {
        $("#out").modal();
      },
    },
    {
      name: "Сгладить",
      title: "Скользящее среднее, параметры по клику правой кнопки мыши",
      bcolor: "LightCyan",
      handler(chart) {
        startSmooth(chart);
      },
      contextmenu() {
        $("#smooth").modal();
      },
    },
    {
      name: "Отменить",
      title: "Возврат к исходным данным или зафиксированым",
      bcolor: "LightSalmon",
      handler(chart) {
        startCancel(chart, mydataold);
      },
      contextmenu() {},
    },
    {
      name: "Фиксация",
      title:
        "Фиксация проделанной работы, например, перед переходом на данные другого Y",
      bcolor: "PaleGreen",
      handler(chart) {
        mydataold = [...mydatanew];
        chart.data.datasets[0].data = [...mydatanew];
        colYs[dataindex] = [...mydatanew];
        chart.data.datasets[1].data = [...chart.data.datasets[0].data];
        small.data.datasets[0].data = [...chart.data.datasets[0].data];
        redraw(chart, labels, mydatanew, leftIndex, rightIndex);
      },
      contextmenu() {},
    },
    {
      name: "Сохранение",
      title: "Сохранение в файл, параметры по клику правой кнопки мыши",
      bcolor: "Khaki",
      handler(chart) {
        let arr5 = [xtitle];
        for (let item of yytitle) {
          arr5.push(item);
        }
        arr7 = [arr5];
        let labtemp;
        let arr6;
        if (!$("#expfile").val())
          // $("#expfile").val(fname.slice(0, -4) + "_exp" +".csv");
          // sss=newfilename(fname.slice(0, -4))
          $("#expfile").val(newfilename(fname.slice(0, -4)) + ".csv");
        let expfile = $("#expfile").val();
        let dateformate = document.getElementById("dateformate").value;
        // alert(format)

        for (let i = 0; i < labels.length; i++) {
          if (format === "date") {
            labtemp = moment(labels[i]).format(dateformate);
            arr6 = [labtemp];
          } else {
            arr6 = [labels[i]];
          }
          for (let j = 0; j < yytitle.length; j++) {
            // console.log(colYs[j][i],+Number(colYs[j][i].toFixed(accuracy[j])));
            colYs[j][i] || colYs[j][i]===0
              ? arr6.push(+Number(colYs[j][i].toFixed(accuracy[j])))
              : arr6.push(null);
            
          }
          arr7.push([arr6]);
        }
        console.log(arr7)
        convertToCsv(expfile, arr7);
      },
      contextmenu() {
        if (format === "date") {
          $("#dateexport").show();
        } else {
          $("#dateexport").hide();
        }
        if (!$("#expfile").val())
          // sss=newfilename(fname.slice(0, -4))
          $("#expfile").val(newfilename(fname.slice(0, -4)) + ".csv");
        $("#exp").modal();
      },
    },
  ];
  // written to implement actions array (from samples)
  // into buttons like from the sample
  actions.forEach((a, i) => {
    let button = document.createElement("button");
    button.id = "button" + i;
    button.href = "#ex2";
    button.rel = "modal:open";
    button.className = "buttong";
    button.innerText = a.name;
    button.title = a.title;
    button.onclick = () => {
      a.handler(big);
    };
    button.oncontextmenu = () => {
      a.contextmenu();
    };
    document.querySelector(".buttons").appendChild(button);
    document.getElementById(button.id).style.backgroundColor = a.bcolor;
  });

  let myselect = document.createElement("select");
  myselect.id = "myselect";
  yytitle.forEach((o) => {
    let opt = document.createElement("option");
    opt.value = o;
    opt.appendChild(document.createTextNode(o));
    myselect.appendChild(opt);
  });
  myselect.onchange = function () {
    let index = this.selectedIndex;
    b.handler(big, index);
  };
  document.querySelector(".select").appendChild(myselect);
  let colY = colYs[0];
  const mydata = [...colY];
  DATA_COUNT = mydata.length;
  mydataold = [...colY];
  mydatanew = [...colY];

  const ssm = getssm(mydata);
  let labels = [...colX];
  let format = document.getElementById("List1").value;
  let dateformate = document.getElementById("dateformate").value;
  let minlabel = Math.min(...labels),
    maxlabel = Math.max(...labels);

  const ssl = getssl(minlabel, maxlabel);
  const data = {
    labels: labels,
    datasets: [
      {
        label: "new",
        data: mydatanew,
        tension: 0.4,
        borderWidth: 1,
        pointHitRadius: 12,
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.3)",
        fill: 1,
        spanGaps: true,
      },
      {
        label: "old",
        data: mydataold,
        fill: false,
        tension: 0.4,
        borderWidth: 1,
        pointHitRadius: 0,
        borderColor: "green",
        pointRadius: 0,
        spanGaps: true,
      },
    ],
  };
  let config = {
    type: "line",
    data: data,
    options: {
      scales: {
        yAxes: {
          position: "left",
          title: {
            display: true,
            text: ytitle,
          },
          min: ssm.niceMinimum,
          max: ssm.niceMaximum,
          display: true,
          ticks: {
            stepSize: ssm.tickSpacing,
            callback: function (value, index, values) {
              let numberFormat = new Intl.NumberFormat("en-GB", {
                maximumFractionDigits: 1,
                useGrouping: false,
              });
              return numberFormat.format(value);
            },
            //count: 10,
          },
        },
        xAxes: {
          type: "linear",
          position: "bottom",
          min: ssl.niceMinimum,
          max: ssl.niceMaximum,
          title: {
            display: true,
            text: xtitle,
          },
          display: true,
          ticks: {
            callback: function (value, index, values) {
              let numberFormat = new Intl.NumberFormat("en-GB", {
                maximumFractionDigits: 1,
                useGrouping: false,
              });
              if (format === "num") {
                return numberFormat.format(value);
              } else {
                return [
                  moment(value).format("DD.MM.YY"),
                  moment(value).format("HH:mm"),
                ];
              }
            },
            stepSize: ssl.tickSpacing,
          },
        },
      },
      onHover: function (e) {
        const point = e.chart.getElementsAtEventForMode(
          e,
          "nearest",
          { intersect: true },
          false
        );
        if (point.length) e.native.target.style.cursor = "grab";
        else e.native.target.style.cursor = "default";
      },
      plugins: {
        title: {
          display: true,
          text: fname,
        },
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#32a88e",
          displayColors: false,
          callbacks: {
            title: function (tooltipItem, data) {
              return "";
            },
            label: function (context) {
              let clab;

              const newLocal = "num";
              if (format === newLocal) {
                clab = context.label.replace(",", ".");
                // clab = new Intl.NumberFormat('en-GB').format(context.label);
              } else {
                // console.log(moment(value).format("YYYY-MM-DD HH:mm"));
                clab = context.label;
                clab = clab.split(" ").join("");
                // console.log("clab=",clab)
                clab = moment(+clab).format("DD.MM.YY HH:mm");
                // clab=  [moment(+clab).format("DD.MM.YY"),moment(+clab).format("HH:mm")];
              }
              let label = clab + ": " + context.raw; //formattedValue
              // label = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
              return label;
            },
          },
        },
        interaction: {
          intersect: false,
        },
        dragData: {
          round: 3,
          showTooltip: true,
          onDragStart: function (e, datasetIndex, index, value) {
            if (datasetIndex === 1) return false;
          },
          onDrag: function (e, datasetIndex, index, value) {
            if (datasetIndex === 1) return false;
            e.target.style.cursor = "grabbing";
          },
          onDragEnd: function (e, datasetIndex, index, value) {
            if (datasetIndex === 1) return false;
            e.target.style.cursor = "default";
            mydatanew[leftIndex + index] = value;
          },
        },
      },
    },
  };
  let config2 = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "oldslider",
          data: mydataold,
          tension: 0.4,
          borderWidth: 1,
          pointHitRadius: 0,
          pointRadius: 0,
          borderColor: "red",
          fill: 1,
          spanGaps: true,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: false,
          text: "Custom Chart Title",
        },
        legend: {
          display: false,
        },
      },
      scales: {
        yAxes: {
          min: ssm.niceMinimum,
          max: ssm.niceMaximum,
          display: false,
          ticks: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
        xAxes: {
          type: "linear",
          min: minlabel,
          max: maxlabel,
          display: false,
        },
      },
    },
  };
  const WIDTH = 800;
  const HEIGHT = 400;
  const DPI_WIDTH = WIDTH * 2;
  const DPI_HEIGHT = HEIGHT * 2;
  const root = document.getElementById("chart");
  const canvas = root.querySelector('[data-el="main"]');
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = DPI_WIDTH;
  ctx.canvas.height = DPI_HEIGHT;
  css(canvas, {
    width: WIDTH + "px",
    height: HEIGHT + "px",
  });

  big = new Chart(ctx, config);
  const canvas2 = root.querySelector('[data-el="slider"]');
  const ctx2 = canvas2.getContext("2d");
  ctx2.canvas.width = window.innerWidth;
  ctx2.canvas.height = window.innerWidth / 20;

  small = new Chart(ctx2, config2);
  const slider = sliderChart(mydataold);
  slider.subscribe((pos) => {
    let minlabelg = Math.min(...labels),
      maxlabelg = Math.max(...labels);
    const leftvalue = ((maxlabelg - minlabelg) * pos[0]) / 100 + minlabelg;
    const rightvalue = ((maxlabelg - minlabelg) * pos[1]) / 100 + minlabelg;

    let val = leftvalue;
    const left = labels.reduce(function (a, c, i) {
      return Math.abs(a - val) < Math.abs(c - val) ? a : c;
    });
    val = rightvalue;
    const right = labels.reduce(function (a, c, i) {
      return Math.abs(a - val) < Math.abs(c - val) ? a : c;
    });
    leftIndex = labels.indexOf(left);
    rightIndex = labels.indexOf(right) + 1;
    DATA_COUNT = rightIndex - leftIndex;
    big.data.datasets[0].data = [];
    for (let i = 0; i < DATA_COUNT; ++i) {
      big.data.datasets[0].data.push(mydatanew[i + leftIndex]);
    }
    big.data.datasets[1].data = [];
    for (let i = 0; i < DATA_COUNT; ++i) {
      big.data.datasets[1].data.push(mydataold[i + leftIndex]);
    }
    big.data.labels = [];
    for (let i = 0; i < DATA_COUNT; ++i) {
      big.data.labels.push(labels[i + leftIndex]);
    }
    let minlabel = Math.min(...big.data.labels),
      maxlabel = Math.max(...big.data.labels);
    const ssl = getssl(minlabel, maxlabel);
    big.options.scales.xAxes.ticks.stepSize = ssl.tickSpacing;
    big.options.scales.xAxes.min = ssl.niceMinimum;
    big.options.scales.xAxes.max = ssl.niceMaximum;
    big.options.scales.xAxes.title.text = xtitle + " (" + labels.length + ")";
    big.update();
  });

  function css(el, styles = {}) {
    Object.assign(el.style, styles);
  }

  function noop() {}

  function sliderChart(data) {
    const MIN_WIDTH = WIDTH * 0.03;
    let nextFn = noop;
    const $left = root.querySelector('[data-el="left"]');
    const $window = root.querySelector('[data-el="window"]');
    const $right = root.querySelector('[data-el="right"]');
    // const $slider = root.querySelector('[data-el="slider2"]')
    function next() {
      nextFn(getPosition());
    }

    function mousedown(event) {
      event.preventDefault();
      // console.log('mousedown')
      clearTimeout(timer);
      const el = event.target.dataset.el;
      const type = event.target.dataset.type;
      // console.log(event.target.dataset)
      const dimensions = {
        left: parseInt($window.style.left),
        right: parseInt($window.style.right),
        width: parseInt($window.style.width),
      };
      if (el === "window") {
        const startX = event.pageX;
        document.onmousemove = (e) => {
          delta = startX - e.pageX;
          if (delta === 0) {
            return;
          }
          const left = dimensions.left - delta;
          const right = WIDTH - left - dimensions.width;
          setPosition(left, right, 1);
          next();
        };
      } else if (
        type === "left" ||
        type === "right" ||
        el === "left" ||
        el === "right"
      ) {
        const startX = event.pageX;
        document.onmousemove = (e) => {
          delta = startX - e.pageX;
          if (delta === 0) {
            return;
          }
          if (type === "left" || el === "left") {
            const left = WIDTH - (dimensions.width + delta) - dimensions.right;
            const right = WIDTH - (dimensions.width + delta) - left;
            setPosition(left, right, 2);
          } else {
            const right = WIDTH - (dimensions.width - delta) - dimensions.left;
            setPosition(dimensions.left, right, 3);
          }
          next();
        };
      }
    }

    function mouseup(event) {
      clearTimeout(timer);
      event.preventDefault();
      document.onmousemove = null;
      if (delta !== 0) {
        window.addEventListener(
          "click",
          captureClick,
          true // <-- This registeres this listener for the capture
          //     phase instead of the bubbling phase!
        );
      }
      delta = 0;
    }

    function captureClick(e) {
      e.stopPropagation(); // Stop the click from being propagated.
      window.removeEventListener("click", captureClick, true); // cleanup
    }

    function mouseclick(event) {
      if (event.detail === 1) {
        timer = setTimeout(() => {
          event.preventDefault();
          let left;
          const el = event.target.dataset.el;
          const dimensions = {
            left: parseInt($window.style.left),
            right: parseInt($window.style.right),
            width: parseInt($window.style.width),
          };
          if (el === "window" || el === "slider" || el === "left") {
            const startX = event.pageX;
            const start2X =
              event.offsetX || event.pageX - $(event.target).offset().left;

            if (el === "window" || el === "slider") {
              left = start2X + dimensions.left;
            } else if (el === "left") {
              left = start2X;
            }
            const right = dimensions.right;
            setPosition(left, right, 4);
            next();
          }
        }, 100);
      }
    }

    function rmouseclick(event) {
      clearTimeout(timer);
      event.preventDefault();
      let right;
      const type = event.target.dataset.type;
      const el = event.target.dataset.el;
      const dimensions = {
        left: parseInt($window.style.left),
        right: parseInt($window.style.right),
        width: parseInt($window.style.width),
      };
      if (el === "window" || el === "slider" || el === "right") {
        const startX = event.pageX;
        const start2X =
          event.offsetX || event.pageX - $(event.target).offset().left;
        if (el === "window" || el === "slider") {
          right = WIDTH - start2X - dimensions.left;
        } else if (el === "right") {
          right = dimensions.right - start2X;
        }
        const left = dimensions.left; //WIDTH - left - dimensions.width
        setPosition(left, right, 5);
        next();
      }
    }

    function dblclick(event) {
      clearTimeout(timer);
      event.preventDefault();
      const el = event.target.dataset.el;
      if (
        el === "window" ||
        el === "slider" ||
        el === "left" ||
        el === "right" ||
        !event.isTrusted
      ) {
        const left = 0;
        const right = 0;
        setPosition(left, right, 0);
        next();
      }
    }

    let timer;
    let delta = 0;
    document.addEventListener("dblclick", dblclick);
    root.addEventListener("mousedown", mousedown);
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("click", mouseclick);
    document.addEventListener("contextmenu", rmouseclick);

    const Swidth = 100; //30%
    const defaultWidth = (WIDTH * Swidth) / 100;

    setPosition(0, WIDTH - defaultWidth, 0);

    Sp: function setPosition(left, right, flag) {
      let left0 = left;
      let right0 = right;
      let w = WIDTH - right0 - left0;

      let leftp = (left * 100) / WIDTH;
      let rightp = 100 - (right * 100) / WIDTH;

      if (leftp >= 0 && rightp <= 100 && leftp < rightp) {
        css($window, {
          width: w + "px",
          left: left0 + "px",
          right: right0 + "px",
        });
        css($right, { width: right0 + "px" });
        css($left, { width: left0 + "px" });
        return;
      }

      leftp = leftp < 0 ? 0 : leftp;
      leftp = leftp > 100 ? 100 : leftp;
      leftp = leftp > rightp && flag === 2 ? rightp : leftp; // если двигали левый
      rightp = rightp < 0 ? 0 : rightp;
      rightp = rightp > 100 ? 100 : rightp;
      rightp = rightp < leftp && flag === 3 ? leftp : rightp; // если двигали правый

      let minlabelg = Math.min(...labels),
        maxlabelg = Math.max(...labels);
      const leftvalue = ((maxlabelg - minlabelg) * leftp) / 100 + minlabelg;
      const rightvalue = ((maxlabelg - minlabelg) * rightp) / 100 + minlabelg;

      let val = leftvalue;
      const leftv = labels.reduce(function (a, c, i) {
        return Math.abs(a - val) < Math.abs(c - val) ? a : c;
      });
      val = rightvalue;
      const rightv = labels.reduce(function (a, c, i) {
        return Math.abs(a - val) < Math.abs(c - val) ? a : c;
      });
      leftIndex = labels.indexOf(leftv);
      rightIndex =
        labels.indexOf(rightv) < labels[labels.length - 1]
          ? labels.indexOf(rightv) + 1
          : labels.indexOf(rightv);
      DATA_COUNT = rightIndex - leftIndex;
      if (DATA_COUNT < 3 && flag === 2) {
        leftIndex = rightIndex - 2;
      }
      if (DATA_COUNT < 3 && flag === 3) {
        rightIndex = leftIndex + 2;
      }
      const leftsmes = 0; //labels[0]
      left0 =
        leftIndex > 0
          ? parseInt(
              ((labels[leftIndex] - leftsmes) * WIDTH) /
                labels[labels.length - 1]
            )
          : 0;
      right0 =
        WIDTH -
        parseInt((labels[rightIndex] * WIDTH) / labels[labels.length - 1]);
      w = WIDTH - right0 - left0;
      if (left < 0) {
        css($window, { left0: "0px" });
        css($left, { width0: "0px" });
        return;
      }
      if (right < 0) {
        css($window, { right0: "0px" });
        css($right, { width0: "0px" });
        return;
      }
      css($window, {
        width: w + "px",
        left: left0 + "px",
        right: right0 + "px",
      });
      css($right, { width: right0 + "px" });
      css($left, { width: left0 + "px" });
    }
    function getPosition() {
      const left = parseInt($left.style.width);
      const right = WIDTH - parseInt($right.style.width);
      return [(left * 100) / WIDTH, (right * 100) / WIDTH];
    }
    return {
      subscribe(fn) {
        nextFn = fn;
        fn(getPosition());
      },
    };
  }
}
