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

    if(!title || !desc) {
      alert("タイトルと内容を刻んでください。");
      return;
    }

    await addDoc(collection(db, "jobs"), {
      title: title,
      desc: desc,
      reward: reward,
      status: "open", // open(募集中), doing(挑戦中), completed(完了済み)
      challenger: "", // 挑戦者の名前
      timestamp: Date.now() // 24時間判定に使うため現在時刻を入れる
    });

    document.getElementById('job-title').value = "";
    document.getElementById('job-desc').value = "";
  };
}

// 2. リアルタイム表示 ＆ 管理者への通知処理
if (jobBoard) {
  const jobQuery = query(collection(db, "jobs"), orderBy("timestamp", "desc"));
  onSnapshot(jobQuery, (snapshot) => {
    jobBoard.innerHTML = "";
    if (adminNoticeList) adminNoticeList.innerHTML = ""; // 通知リストをリセット
    
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; // 1日のミリ秒

    snapshot.forEach((sDoc) => {
      const data = sDoc.data();
      const id = sDoc.id;

      // 24時間経過した仕事は表示しない
      if (now - data.timestamp > ONE_DAY) return;

      // ★ 管理者の場合、挑戦中(doing)の案件を通知エリアに出す
      if (window.isAdmin && data.status === 'doing' && adminNoticeList) {
        const li = document.createElement('li');
        li.innerHTML = `${data.challenger} が挑戦中 <span>(任務: ${data.title})</span>`;
        adminNoticeList.appendChild(li);
      }

      const card = document.createElement('div');
      card.className = `job-card ${data.status === 'completed' ? 'completed' : ''}`;

      let statusHtml = '';
      let actionHtml = '';

      if (data.status === 'open') {
        statusHtml = `<span class="status-badge status-open">募集中</span>`;
        actionHtml = `
          <input type="text" id="chal-${id}" placeholder="名を刻む">
          <button onclick="acceptJob('${id}')">引き受ける</button>
        `;
      } else if (data.status === 'doing') {
        statusHtml = `<span class="status-badge status-doing">挑戦中：${data.challenger}</span>`;
        if (window.isAdmin) {
          actionHtml = `<button onclick="completeJob('${id}')" style="background:#a00;">任務完了にする</button>`;
        } else {
          actionHtml = `<span style="font-size:12px; color:#666;">完了後、管理者に報告せよ</span>`;
        }
      } else if (data.status === 'completed') {
        statusHtml = ``;
        actionHtml = `<div class="completed-stamp">完了済</div>`;
      }

      card.innerHTML = `
        <div class="job-header">
          ${statusHtml}
          <span class="job-reward">報酬: ${data.reward} スタンプ</span>
        </div>
        <h4 class="job-title">${data.title}</h4>
        <p class="job-desc">${data.desc}</p>
        <div class="job-action">${actionHtml}</div>
      `;
      jobBoard.appendChild(card);
    });
  });
}

// 3. 依頼を引き受ける処理（ボタンから呼べるようグローバルに）
window.acceptJob = async (id) => {
  const nameInput = document.getElementById(`chal-${id}`).value;
  if (!nameInput) {
    alert("名を刻みなさい。");
    return;
  }
  await updateDoc(doc(db, "jobs", id), {
    status: "doing",
    challenger: nameInput
  });
  alert("管理者に通知されました。任務を遂行してください。");
};

// 4. 依頼を完了にする処理（管理者のみ）
window.completeJob = async (id) => {
  if(!confirm("この者の任務を完了とし、スタンプを与えますか？")) return;
  await updateDoc(doc(db, "jobs", id), {
    status: "completed"
  });
};
