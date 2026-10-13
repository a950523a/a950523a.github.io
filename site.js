// 海龜電能網站共用程式：線上填單（price.html）、現貨狀態（price.html）
(function () {
  var form = document.getElementById("orderForm");
  if (!form) return;
  var PLAN = { retrofit: "原廠充電器改裝（控制盒 NT$3,200 ＋ 鑽孔費 NT$300）", xt90: "XT90 版（控制盒 NT$3,300，免施工費）" };
  var PSU = { buy: "代購 1.5 kW 電源（請報價）", own: "自備電源" };
  function val(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  // 單號：HG-年月日-4 碼。字母表拿掉 0/O/1/I/L，口頭唸、手抄都不會混
  function orderNo() {
    var abc = "23456789ABCDEFGHJKMNPQRSTUVWXYZ", d = new Date(), r = "", bytes = new Uint8Array(4), i;
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
    for (i = 0; i < 4; i++) r += abc[bytes[i] % abc.length];
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return "HG-" + p(d.getFullYear() % 100) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + r;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = document.getElementById("oName"), name = nameEl.value.trim(), err = document.getElementById("oErr");
    if (!name) { err.textContent = "請填稱呼，我才知道是誰的訂單。"; nameEl.focus(); return; }
    err.textContent = "";
    var no = orderNo(), note = document.getElementById("oNote").value.trim();
    var lines = [
      "【海龜電能 填單】",
      "單號：" + no,
      "稱呼：" + name,
      "方案：" + PLAN[val("plan")],
      "主電源：" + PSU[val("psu")] + (val("psu") === "own" ? (val("plan") === "retrofit" ? "（需確認是指定型號，會附型號或照片）" : "（會附型號或照片）") : ""),
      "原廠充電器：" + val("charger") + (document.getElementById("chargerBroken").checked ? "（電源板已燒掉，充電槍完好）" : ""),
      "交貨方式：" + val("ship")
    ];
    if (note) lines.push("備註：" + note);
    document.getElementById("orderNo").textContent = no;
    document.getElementById("orderText").textContent = lines.join("\n");
    document.getElementById("copyMsg").textContent = "";
    var out = document.getElementById("orderOut");
    out.hidden = false;
    out.scrollIntoView({ block: "start" });
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var pre = document.getElementById("orderText"), msg = document.getElementById("copyMsg");
    function fallback() {
      var range = document.createRange(), sel = window.getSelection();
      range.selectNodeContents(pre); sel.removeAllRanges(); sel.addRange(range);
      msg.textContent = "已選取訂單內容，請按「複製」後貼到私訊。";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pre.textContent).then(function () { msg.textContent = "已複製，到粉專私訊貼上就好。"; }, fallback);
    } else fallback();
  });
})();

// 現貨狀態：stock.json 由客戶紀錄後台的庫存（只取「成品」）產生，只有狀態、沒有數量
(function () {
  var sec = document.getElementById("stock");
  if (!sec || !window.fetch) return;
  var LABEL = { "in": "有現貨", low: "少量", out: "缺貨，可預訂" };
  fetch("stock.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.items || !d.items.length) return;
    var ul = document.getElementById("stockList");
    d.items.forEach(function (it) {
      var li = document.createElement("li"), name = document.createElement("span"), st = document.createElement("span");
      name.textContent = it.name;
      st.className = "st " + (LABEL[it.status] ? it.status : "out");
      st.textContent = LABEL[it.status] || "請私訊確認";
      li.appendChild(name); li.appendChild(st); ul.appendChild(li);
    });
    document.getElementById("stockUpdated").textContent = "更新於 " + d.updated + "。實際庫存以私訊確認為準。";
    sec.hidden = false;
  }).catch(function () {});
})();
