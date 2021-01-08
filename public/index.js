(function () {})();
const createArr = () => {
  let arr = [];
  for (let i = 1; i <= 75; i++) {
    arr.push(i);
  }
  return arr;
};
const rouletteStart = (num) => {
  // dom 操作
  domOperation("init");
  listStateCheck();
  music.play();
  roulette = setInterval(changeNum, 100);
  setTimeout(() => {
    clearInterval(roulette);
    dom.numberDisplay.textContent = num;
    let out = Number(dom.numberDisplay.textContent);
    // dom 操作
    domOperation("shuffle");
    outNum.push(out);
    if (isHost === "host") {
      socket.emit("save", [out, localStorage.getItem("bg")]);
    }
    // numArrを更新
    numArr.splice(numArr.indexOf(out), 1);
    outNumCheck();
    // 数字の読み上げ
    speakNumber(out);
    showHistory();
    if (numArr.length === 0) {
      dom.toTopBtn.style.display = "flex";
      dom.startBtn.style.display = "none";
    }
  }, 4000);
};
const bingoReset = () => {
  numArr = createArr();
  outNum = [];
  // keyを初期化
  localStorage.setItem("outNum", outNum);
  localStorage.setItem("bg", "");
  // dom 操作
  domOperation("reset");
};
const domOperation = (instruction) => {
  switch (instruction) {
    case "init":
      dom.numberDisplay.classList.remove("text-scale");
      dom.startBtn.classList.add("shuffle");
      dom.resetBtn.classList.add("shuffle");
      dom.numberList.classList.add("shuffle");
      listBtn.classList.add("shuffle");
      dom.history.innerHTML = "";
      break;
    case "shuffle":
      let num = Number(dom.numberDisplay.textContent);
      let columnName = document.createElement("span");
      columnName.className = "column-name";
      dom.numberDisplay.dataset.num = num;
      columnName.textContent = setColumnName(num);
      dom.numberDisplay.appendChild(columnName);
      dom.numberDisplay.classList.add("text-scale");
      dom.startBtn.classList.remove("shuffle");
      dom.resetBtn.classList.remove("shuffle");
      dom.numberList.classList.remove("shuffle");
      listBtn.classList.remove("shuffle");
      break;
    case "reset":
      let numberList = Array.from(dom.numberList.children);
      dom.numberDisplay.textContent = "Bingo";
      dom.body.style.backgroundImage = `url("img/bg-init.jpg")`;
      dom.numberDisplay.dataset.num = "";
      dom.numberDisplay.classList.remove("text-scale");
      listBtn.classList.remove("bt-menu-open");
      dom.numberList.style.transform = "translateX(calc(-100% - 10px))";
      numberList.forEach((el, i) => {
        dom.numberList.children[i].classList.remove("out");
      });
      dom.history.innerHTML = "";
      break;
    case "end":
      dom.toTopBtn.style.display = "none";
      window.location.href = "/";
      break;
  }
};
const speakNumber = (text) => {
  setTimeout(() => {
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }, 1000);
};
const changeNum = () => {
  dom.numberDisplay.textContent = Math.floor(Math.random() * 75);
};
const outNumCheck = () => {
  outNum.forEach((el) => {
    dom.numberList.children[el - 1].classList.add("out");
  });
};
const showHistory = () => {
  let historyArr = outNum.slice(-5).reverse();
  for (let i = 0; i < historyArr.length; i++) {
    let li = document.createElement("li");
    li.innerHTML = `<p>${
      outNum.length - i
    }回目:</p><span style="position: absolute;left: 65px;">${setColumnName(
      historyArr[i]
    )}</span><span>${historyArr[i]}</span>`;
    dom.history.appendChild(li);
  }
};
const listStateCheck = () => {
  if (listBtn.classList.length === 1) {
    listBtn.classList.toggle("bt-menu-open");
    dom.numberList.style.transform = "translateX(0)";
  } else {
    listBtn.classList.remove("bt-menu-open");
    dom.numberList.style.transform = "translateX(calc(-100% - 10px))";
  }
};
const setColumnName = (num) => {
  let word;
  if (num >= 1 && num <= 15) {
    word = "B";
  } else if (num >= 16 && num <= 30) {
    word = "I";
  } else if (num >= 31 && num <= 45) {
    word = "N";
  } else if (num >= 46 && num <= 60) {
    word = "G";
  } else if (num >= 61 && num <= 75) {
    word = "O";
  }
  return word;
};
const slideAnimation = (imgArr) => {
  let images = imgArr.map((el) => {
    let img = document.createElement("img");
    img.className = "display-none";
    img.src = el;
    dom.imgWrapper.appendChild(img);
    return img;
  });
  slide(images[0], "to-right");
  setTimeout(() => {
    slide(images[1], "to-left");
  }, 500);
  setTimeout(() => {
    slide(images[2], "to-right");
  }, 1000);
  setTimeout(() => {
    slide(images[3], "to-left");
  }, 1500);
  // giv画像
  setTimeout(() => {
    images[4].classList.add("video");
    dom.body.style.backgroundImage = `url(${imgArr[5]})`;
  }, 2500);
  // 4秒後リセット
  setTimeout(() => {
    images.forEach((el) => {
      el.classList.add("display-none");
      el.classList.remove("display", "video");
    });
  }, 5500);
};
const slide = (img, direction, time = 500) => {
  img.classList.remove("display-none");
  img.classList.add(direction);
  setTimeout(() => {
    img.classList.remove(direction);
    img.classList.add("display");
  }, time);
};
const readData = () => {
  for (let i = 0; i < outNum.length; i++) {
    for (let j = 0; j < numArr.length; j++) {
      if (numArr[j] === outNum[i]) {
        numArr.splice(j, 1);
      }
    }
  }
};
let roulette;
const url = window.location.href;
let isHost = url.slice(url.lastIndexOf("/") + 1) === "host" ? "host" : "guest";
let guestUrl = `${url.slice(0, url.lastIndexOf("/") + 1)}guest`;
console.log(guestUrl);
let socket = io();
let numArr = createArr();
let music = new Audio("audio/m1-v5.mp3");
const dom = {
  body: document.querySelector("body"),
  imgWrapper: document.querySelector(".img-wrapper"),
  numberDisplay: document.querySelector(".number-display span"),
  numberList: document.querySelector(".number-list"),
  resetBtn: document.querySelector(".reset"),
  startBtn: document.querySelector(".start"),
  history: document.querySelector(".history"),
  toTopBtn: document.querySelector(".to-top"),
};
const images = [
  [
    "img/tanziro/img-1.jpg",
    "img/tanziro/img-2.jpg",
    "img/tanziro/img-3.jpg",
    "img/tanziro/img-4.jpg",
    "img/tanziro/gif.gif",
    "img/tanziro/bg.jpg",
  ],
  [
    "img/zenitu/img-1.jpg",
    "img/zenitu/img-2.jpg",
    "img/zenitu/img-3.jpg",
    "img/zenitu/img-4.jpg",
    "img/zenitu/gif.gif",
    "img/zenitu/bg.jpg",
  ],
  [
    "img/tanziroMizu/img-1.jpg",
    "img/tanziroMizu/img-2.jpg",
    "img/tanziroMizu/img-3.jpg",
    "img/tanziroMizu/img-4.jpg",
    "img/tanziroMizu/gif.gif",
    "img/tanziroMizu/bg.jpg",
  ],
];

if (isHost !== "host") {
  dom.startBtn.remove();
  dom.resetBtn.remove();
  dom.history.style = "top: 20px";
}

socket.on("readData", function (data) {
  let arr = data.value;
  localStorage.setItem("outNum", arr[0]);
  localStorage.setItem("bg", arr[1]);
  if (arr[2] === "reset") {
    bingoReset();
  }
  if (localStorage.getItem("outNum").split(",").length === 75) {
    dom.toTopBtn.style.display = "flex";
    dom.startBtn.style.display = "none";
  }
});

if (localStorage.getItem("bg")) {
  let imgArr = images[localStorage.getItem("bg")];
  dom.body.style.backgroundImage = `url(${imgArr[imgArr.length - 1]})`;
}
// keyを取得
let outNum = localStorage.getItem("outNum")
  ? localStorage
      .getItem("outNum")
      .split(",")
      .map((el) => Number(el))
  : [];

if (localStorage.getItem("outNum") != "") {
  readData();
  // 履歴表示
  dom.numberDisplay.textContent = outNum[outNum.length - 1];
  let columnName = document.createElement("span");
  columnName.className = "column-name";
  dom.numberDisplay.dataset.num = Number(outNum[outNum.length - 1]);
  columnName.textContent = setColumnName(Number(outNum[outNum.length - 1]));
  dom.numberDisplay.appendChild(columnName);
  showHistory();
} else {
  dom.numberDisplay.textContent = "Bingo";
}

socket.on("roulette start", function (num) {
  rouletteStart(num);
});

socket.on("slide animation", function (num) {
  slideAnimation(images[num]);
});

socket.on("reset", function (data) {
  bingoReset();
});

outNumCheck();
dom.startBtn.addEventListener("click", function () {
  let randomNumber = Math.floor(Math.random() * numArr.length);
  socket.emit("roulette start", numArr[randomNumber]);
});
dom.startBtn.addEventListener("click", function () {
  let randomNumber = Math.floor(Math.random() * 3);
  localStorage.setItem("bg", randomNumber);
  socket.emit("slide animation", randomNumber);
});

dom.resetBtn.addEventListener("click", function () {
  if (confirm("ビンゴを最初からやり直しますがよろしいですか？")) {
    socket.emit("reset", ["", ""]);
    bingoReset();
  }
});

dom.toTopBtn.addEventListener("click", function () {
  socket.emit("reset", ["", ""]);
  bingoReset();
  domOperation("end");
});

// list icon
let listBtn = document.querySelector(".bt-menu-trigger");
listBtn.addEventListener("click", function () {
  listStateCheck();
});
