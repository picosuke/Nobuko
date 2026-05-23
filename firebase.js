import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
