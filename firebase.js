import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
// 仕事掲示板で使う updateDoc と doc を追加で読み込む
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPUhjD7Zg8togYokPISJcFYvvoRJBcIkk",
  authDomain: "nobuko-f3d50.firebaseapp.com",
  projectId: "nobuko-f3d50",
  storageBucket: "nobuko-f3d50.firebasestorage.app",
  messagingSenderId: "58905285751",
  appId: "1:58905285751:web:66c687031ad8a9a746e272",
  measurementId: "G-J9GSF1LFRC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* ============================================================
   話し合い（チャット）機能
============================================================ */
const listEl = document.getElementById('messages-list');
const sendBtn = document.getElementById('send-btn');
const msgInput = document.getElementById('message-input');
const nameInput = document.getElementById('user-name');

// メッセージ送信
sendBtn.onclick = async () => {
  if(!msgInput.value) return;
  await addDoc(collection(db, "messages"), {
    name: nameInput.value || "無名",
    text: msgInput.value,
    timestamp: serverTimestamp()
  });
  msgInput.value = "";
};

// リアルタイム受信と表示
const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
  listEl.innerHTML = "";
  let count = 1;
  snapshot.forEach((sDoc) => {
    const data = sDoc.data();
    const item = document.createElement('div');
    item.className = 'message-item';
    item.innerHTML = `
      <div class="msg-header">
        <span>第 ${count} 柱</span>
        <span>${data.name}</span>
      </div>
      <div class="msg-content">${data.text}</div>
    `;
    listEl.appendChild(item);
    count++;
  });
  listEl.scrollTop = listEl.scrollHeight;
});

// 記録の全消去機能
document.getElementById('delete-all-btn').onclick = async () => {
  if(!confirm("全ての記録を抹消しますか？")) return;
  const snap = await getDocs(collection(db, "messages"));
  const batch = writeBatch(db);
  snap.forEach(d => batch.delete(d.ref));
  await batch.commit();
};


// ==========================================
// 仕事掲示板（クエスト）の処理
// ==========================================
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
    
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; 

    snapshot.forEach((sDoc) => {
      const data = sDoc.data();
      const id = sDoc.id;

      if (now - data.timestamp > ONE_DAY) return;

      // ★ 通知エリアに複数並べる（管理者の場合のみ）
      if (window.isAdmin && data.status === 'doing' && adminNoticeList) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${data.challenger}</strong> <span>【${data.title}】</span>`;
        adminNoticeList.appendChild(li);
      }

      const card = document.createElement('div');
      card.className = `job-card ${data.status === 'completed' ? 'completed' : ''}`;

      let statusHtml = '';
      let actionHtml = '';
      let challengerHtml = ''; // ★カードに表示する挑戦者名

      if (data.status === 'open') {
        statusHtml = `<span class="status-badge status-open">募集中</span>`;
        actionHtml = `
          <input type="text" id="chal-${id}" placeholder="名を刻む">
          <button onclick="acceptJob('${id}')">引き受ける</button>
        `;
      } else if (data.status === 'doing') {
        statusHtml = `<span class="status-badge status-doing">進行中</span>`;
        challengerHtml = `<div class="challenger-name">挑戦者：${data.challenger}</div>`; // ★追加
        
        if (window.isAdmin) {
          // ★管理者は「完了」と「取り下げ」ができる
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

// 5. 取り下げ（キャンセル）する ★新規追加
window.cancelJob = async (id) => {
  if(!confirm("この者の挑戦を取り消し、再び募集中に戻しますか？")) return;
  await updateDoc(doc(db, "jobs", id), { status: "open", challenger: "" });
};
