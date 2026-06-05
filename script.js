// パスワード設定（一般用と管理者用の2種類）
const NORMAL_WORD = "nobuko64";      // 一般信者用の合言葉
const ADMIN_WORD = "pronobuko25";
const SECRET_DARK_WORD = "noriko666"; // ★第3の裏合言葉（好きなものに変えてください）

const pwBtn = document.getElementById('pw-btn');
const pwInput = document.getElementById('pw-input');
const pwScreen = document.getElementById('password-screen');
const pwError = document.getElementById('pw-error');

window.isAdmin = false; 

function checkPassword() {
  const input = pwInput.value;

  // ★ 裏合言葉が入力された場合の特別処理
  if (input === SECRET_DARK_WORD) {
    pwScreen.style.backgroundColor = "#000"; // 画面を急に真っ黒にする演出
    pwScreen.classList.add('fade-out');
    
    setTimeout(() => { 
      pwScreen.style.display = 'none'; 
      // 全てのページを隠して、裏ページだけを強制表示
      document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
      document.getElementById('dark-web').classList.add('active');
      // ヘッダー（メニュー）も隠すことで、完全な隔離空間にする
      document.querySelector('.header-06').style.display = 'none';
    }, 1500);
    return; // ここで処理を終わらせる
  }

  // 以下は通常のパスワード処理（変更なし）
  if (input === NORMAL_WORD || input === ADMIN_WORD) {
    if (input === ADMIN_WORD) {
      localStorage.setItem('isAdmin', 'true');
      const adminArea = document.getElementById('admin-area');
      if (adminArea) adminArea.style.display = 'block';
    } else {
      localStorage.removeItem('isAdmin');
    }
    
    // もし裏から表に戻ってきた時のためにヘッダーを再表示
    document.querySelector('.header-06').style.display = 'flex';

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

// ============================================================
// 導きの端末「ノブ・オラクル」のAIロジック
// ============================================================
const oracleInput = document.getElementById('oracle-input');
const oracleSendBtn = document.getElementById('oracle-send-btn');
const oracleChatBox = document.getElementById('oracle-chat-box');

// AIの辞書（キーワードと返答のセット）
const oracleDictionary = [
  {
    keys: ["のぶ子", "神", "創造主"],
    reply: "のぶ子様は、お前がさっき転んだ時も笑っておられた。すべては『本気のふざけ』のためにある。笑え。"
  },
  {
    keys: ["スタンプ", "報酬", "欲しい"],
    reply: "欲深き者よ。スタンプが欲しくば、まずは森山か並木の靴をピカピカに磨く想像をしてから仕事掲示板へ行け。"
  },
  {
    keys: ["のり子", "嘘", "偽物"],
    reply: "……その名を口にするな。あれはただの芸術作品だ。いいね？ ただの芸術作品だ。"
  },
  {
    keys: ["仕事", "クエスト", "依頼"],
    reply: "己の特技と信仰を示せ。ただし、授業の邪魔になるような三流のふざけ方は異端審問の対象となる。"
  },
  {
    keys: ["歴史", "昔", "化石"],
    reply: "のぶ子聖史録を読め。そして、次はお前が歴史に名を刻むのだ。20文字前後でな。"
  },
  {
    keys: ["こんにちは", "おはよう", "挨拶"],
    reply: "挨拶は『のぶにちは』だ。基本からやり直せ。光あれ。"
  }
];

// ランダムな返答（キーワードがない場合）
const randomReplies = [
  "愚問なり。もっと本気でふざけた問いを用意せよ。",
  "現在、笑狂粒子（ノブニウム）の濃度が高く、正確な演算ができない。後で出直せ。",
  "……フフッ。いや、何でもない。続けてくれ。",
  "その問いの答えは、お前の心の中（あるいは雨の日の窓の外）にある。"
];

// メッセージを画面に追加する関数
function appendOracleMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `oracle-msg ${sender}`;
  const name = sender === 'bot' ? 'ノブ・オラクル' : 'あなた';
  msgDiv.innerHTML = `<span class="oracle-name">${name}</span><p>${text}</p>`;
  oracleChatBox.appendChild(msgDiv);
  oracleChatBox.scrollTop = oracleChatBox.scrollHeight; // 一番下までスクロール
}

// 送信ボタンが押された時の処理
if (oracleSendBtn) {
  oracleSendBtn.onclick = () => {
    const text = oracleInput.value.trim();
    if (!text) return;

    // 自分の発言を表示
    appendOracleMessage('user', text);
    oracleInput.value = "";

    // 少し考えるフリ（1秒後に返信）
    setTimeout(() => {
      let replyText = "";
      
      // 辞書からキーワードを探す
      for (const item of oracleDictionary) {
        if (item.keys.some(key => text.includes(key))) {
          replyText = item.reply;
          break; // 見つかったらループ終了
        }
      }

      // キーワードがなければランダムな返答
      if (!replyText) {
        replyText = randomReplies[Math.floor(Math.random() * randomReplies.length)];
      }

      // ボットの返信を表示
      appendOracleMessage('bot', replyText);
    }, 1000);
  };
}

// Enterキーでも送信
if (oracleInput) {
  oracleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') oracleSendBtn.onclick();
  });
}
