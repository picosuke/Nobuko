// パスワード設定（一般用と管理者用の2種類）
const NORMAL_WORD = "nobuko64";      // 一般信者用の合言葉
const ADMIN_WORD = "pronobuko25";


const pwBtn = document.getElementById('pw-btn');
const pwInput = document.getElementById('pw-input');
const pwScreen = document.getElementById('password-screen');
const pwError = document.getElementById('pw-error');

function checkPassword() {
  if (pwInput.value === NORMAL_WORD || pwInput.value === ADMIN_WORD) {
    
    // ★ 管理者だった場合、ブラウザに「管理神である」と記憶させる
    if (pwInput.value === ADMIN_WORD) {
      localStorage.setItem('isAdmin', 'true');
      const adminArea = document.getElementById('admin-area');
      if (adminArea) {
        adminArea.style.display = 'block';
      }
    } else {
      // 一般人の場合は念のため管理神の記憶を消す
      localStorage.removeItem('isAdmin');
    }

    pwScreen.classList.add('fade-out');
    setTimeout(() => { pwScreen.style.display = 'none'; }, 1500);
  } else {
    pwError.style.display = 'block';
    pwInput.value = "";
  }
}

pwBtn.onclick = checkPassword;
pwInput.addEventListener('keypress', (e) => { 
  if (e.key === 'Enter') checkPassword(); 
});

// （以下、ページ切り替えの showSection 等はそのまま）
function showSection() {
  const hash = window.location.hash || '#home';
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  const targetSec = document.querySelector(hash);
  if (targetSec) targetSec.classList.add('active');

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('href') === hash) btn.classList.add('active');
  });
  window.scrollTo(0, 0);
}
window.addEventListener('DOMContentLoaded', showSection);
window.addEventListener('hashchange', showSection);
2. firebase.js の修正（カード作成部分）
「ブラウザに『管理神』の記憶があるか？」をチェックして、ボタンを表示するように変えます。
firebase.js の真ん中あたり、仕事掲示板（クエスト）の処理から下を以下にまるごと差し替えてください。
code
JavaScript
/* ============================================================
   仕事掲示板（クエスト）機能
============================================================ */
const jobBoard = document.getElementById('job-board');
const addJobBtn = document.getElementById('add-job-btn');
const adminNoticeList = document.getElementById('admin-notice-list');

// 1. 依頼の追加（管理者のみ）
if (addJobBtn) {
  addJobBtn.onclick = async () => {
    const title = document.getElementById('job-title').value;
    const desc = document.getElementById('job-desc').value;
    const reward = document.getElementById('job-reward').value;

    if(!title || !desc) { alert("入力してください。"); return; }

    await addDoc(collection(db, "jobs"), {
      title: title, desc: desc, reward: reward,
      status: "open", challenger: "", timestamp: Date.now()
    });

    document.getElementById('job-title').value = "";
    document.getElementById('job-desc').value = "";
  };
}

// 2. リアルタイム表示 ＆ 通知
if (jobBoard) {
  const jobQuery = query(collection(db, "jobs"), orderBy("timestamp", "desc"));
  onSnapshot(jobQuery, (snapshot) => {
    jobBoard.innerHTML = "";
    if (adminNoticeList) adminNoticeList.innerHTML = ""; 
    
    let hasDoingTask = false; 
    const adminNoticeBoard = document.querySelector('.admin-notice-board');
    
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; 

    // ★ ここで「自分が管理者かどうか」をブラウザの記憶から確認する
    const iAmAdmin = (localStorage.getItem('isAdmin') === 'true');

    snapshot.forEach((sDoc) => {
      const data = sDoc.data();
      const id = sDoc.id;

      if (now - data.timestamp > ONE_DAY) return;

      // 管理者の場合のみ、通知エリアに出す
      if (iAmAdmin && data.status === 'doing' && adminNoticeList) {
        hasDoingTask = true;
        const li = document.createElement('li');
        li.innerHTML = `<strong>${data.challenger}</strong> <span>【${data.title}】</span>`;
        adminNoticeList.appendChild(li);
      }

      const card = document.createElement('div');
      card.className = `job-card ${data.status === 'completed' ? 'completed' : ''}`;

      let statusHtml = '';
      let actionHtml = '';
      let challengerHtml = '';

      if (data.status === 'open') {
        statusHtml = `<span class="status-badge status-open">募集中</span>`;
        actionHtml = `
          <input type="text" id="chal-${id}" placeholder="名を刻む">
          <button onclick="acceptJob('${id}')">引き受ける</button>
        `;
      } else if (data.status === 'doing') {
        statusHtml = `<span class="status-badge status-doing">進行中</span>`;
        challengerHtml = `<div class="challenger-name">挑戦者：${data.challenger}</div>`;
        
        // ★ 管理者の場合、取り下げと完了ボタンを出す
        if (iAmAdmin) {
          actionHtml = `
            <button class="btn-cancel" onclick="cancelJob('${id}')">取り下げ</button>
            <button onclick="completeJob('${id}')" style="background:#a00;">任務完了</button>
          `;
        } else {
          actionHtml = `<span style="font-size:12px; color:#666;">管理者に報告せよ</span>`;
        }
      } else if (data.status === 'completed') {
        statusHtml = ``;
        challengerHtml = `<div class="challenger-name">達成者：${data.challenger}</div>`;
        actionHtml = `<div class="completed-stamp">完了済</div>`;
      }

      card.innerHTML = `
        <div class="job-header">
          ${statusHtml}
          <span class="job-reward">報酬: ${data.reward} スタンプ</span>
        </div>
        <h4 class="job-title">${data.title}</h4>
        <p class="job-desc">${data.desc}</p>
        ${challengerHtml}
        <div class="job-action">${actionHtml}</div>
      `;
      jobBoard.appendChild(card);
    });

    if (adminNoticeBoard) {
      if (hasDoingTask && iAmAdmin) { // ★ 管理者で、かつ任務がある時だけ枠を出す
        adminNoticeBoard.style.display = 'block';
      } else {
        adminNoticeBoard.style.display = 'none';
      }
    }
  });
}

// 3. 引き受ける
window.acceptJob = async (id) => {
  const nameInput = document.getElementById(`chal-${id}`).value;
  if (!nameInput) return alert("名を刻みなさい。");
  await updateDoc(doc(db, "jobs", id), { status: "doing", challenger: nameInput });
  alert("管理者に通知されました。");
};

// 4. 完了にする
window.completeJob = async (id) => {
  if(!confirm("任務を完了としますか？")) return;
  await updateDoc(doc(db, "jobs", id), { status: "completed" });
};

// 5. 取り下げ（キャンセル）する
window.cancelJob = async (id) => {
  if(!confirm("この者の挑戦を取り消し、再び募集中に戻しますか？")) return;
  await updateDoc(doc(db, "jobs", id), { status: "open", challenger: "" });
};
