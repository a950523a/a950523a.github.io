// 海龜電能網站共用程式：線上填單（price.html）、現貨狀態（shop.html）
(function () {
  var form = document.getElementById("orderForm");
  if (!form) return;
  var PLAN = { retrofit: "原廠充電器改裝（控制盒 NT$3,200 ＋ 鑽孔費 NT$300）", xt90: "XT90 版（控制盒 NT$3,300，免施工費）", holder: "只買 TES 充電槍掛座 NT$250（運費另計）" };
  var PSU = { buy: "代購 1.5 kW 電源（請報價）", own: "自備電源" };
  var PAY = { transfer: "轉帳（寄回免運）", famistore: "好賣+下單（寄回運費 NT$60）", cash: "面交付現" };
  var PAY_HINT = {
    transfer: "確認訂單後，我會私訊轉帳帳號和金額。",
    famistore: "確認訂單後，我會告訴你怎麼在好賣+賣場下單、一起結帳。",
    cash: "面交時當面付清。"
  };
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
  // 寄送資訊只有店到店要填；來源選「其他」才顯示文字框
  var shipInfo = document.getElementById("shipInfo"), heardEl = document.getElementById("oHeard");
  var heardWrap = document.getElementById("oHeardOtherWrap");
  function isStore() { return val("ship") === "店到店寄送"; }
  // 付款方式：店到店可選轉帳或好賣+；面交可選轉帳或付現
  var payFami = document.getElementById("payFamiOpt"), payCash = document.getElementById("payCashOpt");
  // 只買充電槍掛座：不用問電源、原廠充電器，也不會再加購自己；運費另計
  function isHolder() { return val("plan") === "holder"; }
  function syncOrderFields() {
    var h = isHolder();
    document.getElementById("fsPsu").hidden = h;
    document.getElementById("fsCharger").hidden = h;
    document.getElementById("addGunHolderOpt").hidden = h;
    if (h) document.getElementById("addGunHolder").checked = false;
    Array.prototype.forEach.call(form.querySelectorAll(".svc-only"), function (el) { el.hidden = h; });
    shipInfo.hidden = !isStore();
    heardWrap.hidden = heardEl.value !== "other";
    payFami.hidden = !isStore(); payCash.hidden = isStore();
    var hiddenPick = form.querySelector('input[name="pay"]:checked');
    if (!hiddenPick || hiddenPick.closest("label").hidden) form.querySelector('input[name="pay"][value="transfer"]').checked = true;
    document.getElementById("payHint").textContent = (h && val("pay") === "transfer") ? "確認訂單後，我會私訊轉帳帳號和含運費的金額。" : (PAY_HINT[val("pay")] || "");
  }
  // 商品頁連過來：price.html?plan=holder 先選好方案
  var want = /[?&]plan=(retrofit|xt90|holder)\b/.exec(location.search);
  if (want) form.querySelector('input[name="plan"][value="' + want[1] + '"]').checked = true;
  form.addEventListener("change", syncOrderFields);
  syncOrderFields();
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = document.getElementById("oName"), name = nameEl.value.trim(), err = document.getElementById("oErr");
    var recvEl = document.getElementById("oRecv"), phoneEl = document.getElementById("oPhone"), storeEl = document.getElementById("oStore");
    var recv = recvEl.value.trim(), phone = phoneEl.value.replace(/[\s-]/g, ""), store = storeEl.value.trim();
    if (isStore()) {
      if (!recv) { err.textContent = "請填收件人姓名，取貨時要核對證件。"; recvEl.focus(); return; }
      if (!/^09\d{8}$/.test(phone)) { err.textContent = "請填 09 開頭的 10 碼手機號碼。"; phoneEl.focus(); return; }
      if (!store) { err.textContent = "請填取件門市。"; storeEl.focus(); return; }
    }
    if (!name) { err.textContent = "請填稱呼，我才知道是誰的訂單。"; nameEl.focus(); return; }
    err.textContent = "";
    var no = orderNo(), note = document.getElementById("oNote").value.trim();
    var heard = heardEl.value === "other" ? document.getElementById("oHeardOther").value.trim() : heardEl.value;
    var lines = [
      "【海龜電能 填單】",
      "單號：" + no,
      "稱呼：" + name,
      "方案：" + PLAN[val("plan")]
    ];
    if (!isHolder()) lines.push(
      "主電源：" + PSU[val("psu")] + (val("psu") === "own" ? (val("plan") === "retrofit" ? "（需確認是指定型號，會附型號或照片）" : "（會附型號或照片）") : ""),
      "原廠充電器：" + val("charger") + (document.getElementById("chargerBroken").checked ? "（電源板已燒掉，充電槍完好）" : ""));
    lines.push("交貨方式：" + val("ship"), "付款方式：" + (isHolder() ? PAY[val("pay")].replace(/（.*）$/, "") : PAY[val("pay")]));
    if (document.getElementById("addGunHolder").checked) lines.push("加購：TES 充電槍掛座 NT$200");
    if (document.getElementById("addPlateLed").checked) lines.push("加購：iE125 牌照燈 LED（T10，白光）NT$50");
    if (isStore()) lines.push("收件人：" + recv, "收件手機：" + phone, "取件門市：" + store);
    if (heard) lines.push("從哪裡知道我們：" + heard);
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
