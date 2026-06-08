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
  // 1. 神聖・存在について
  {
    keys: ["のぶ子", "神", "創造主", "誰"],
    reply: "のぶ子様は、お前がさっき転んだ時も笑っておられた。すべては『本気のふざけ』のためにある。笑え。"
  },
  {
    keys: ["のり子", "嘘", "偽物", "銅像"],
    reply: "……その名を口にするな。あれはただの芸術作品だ。いいね？ ただの芸術作品だ。……後ろを振り返るなよ。"
  },
  {
    keys: ["モブ子", "クローン", "失敗作", "スペア"],
    reply: "[警告] その情報へのアクセス権限がありません。お前は、本当に『オリジナル』か？"
  },
  {
    keys: ["信子", "ノブコ", "神絵", "紙"],
    reply: "……紙（神）で間違いない。それ以上は深淵を覗くことになるぞ。"
  },
  {
    keys: ["四賢者", "Y", "N", "M"],
    reply: "エンターテイナー、メイビーギフテッド、ソリッドモンスター、ボーイヒーロー。彼らは時代を超えて、常にふざけの最前線にいる。"
  },

  // 2. 物質・エネルギーについて
  {
    keys: ["ノブニウム", "Nb", "元素"],
    reply: "直視するな。触れるな。あれは圧倒的なユーモアの質量だ。精神の核が弱い者は、笑い死ぬことになるぞ。"
  },
  {
    keys: ["笑狂粒子", "しょうきょうりゅうし", "エネルギー"],
    reply: "大気中に満ちているアレか。雨の日は特に伝導率が高い。今日、お前の調子が良いのもそのせいだ。"
  },
  {
    keys: ["化石", "石", "1600年", "1614年"],
    reply: "西暦1600年に見つかり、1614年に偽物が出回ったアレか。……いや、あれは本当に『化石』だったのだろうか？外典を読め。"
  },

  // 3. システム・経済について
  {
    keys: ["スタンプ", "報酬", "欲しい"],
    reply: "欲深き者よ。スタンプが欲しくば、まずは森山か並木に貢献し、仕事掲示板の任務をこなせ。"
  },
  {
    keys: ["仕事", "クエスト", "依頼", "掲示板"],
    reply: "己の特技と信仰を示せ。ただし、授業の邪魔になるような三流のふざけ方は異端審問の対象となる。"
  },
  {
    keys: ["ナミキSHOP", "ショップ", "店", "シール", "お菓子"],
    reply: "教団公式の聖具店だ。常識を覆す偽お菓子が売られているらしい。裏面に何が塗られているかは……気にするな。"
  },
  {
    keys: ["のぶ子ドル", "ND", "お金", "通貨"],
    reply: "金銭では買えぬ絶対的な価値。それがNDだ。お前の『本気のふざけ』だけが、その価値を創造する。"
  },
  {
    keys: ["税金", "聖税"],
    reply: "世界平和のためだ。来るべき日に備え、徳とのぶ子ドルを蓄えておくことだな。"
  },

  // 4. 教義・歴史について
  {
    keys: ["歴史", "昔", "聖史録"],
    reply: "のぶ子聖史録を読め。そして、次はお前が歴史に名を刻むのだ。20文字前後でな。"
  },
  {
    keys: ["五箇条", "教義", "ルール", "心得"],
    reply: "全霊の献身、念想の一致、深淵の聴印、沈黙の誓約、濁世の浄化。心に刻んでおけ。"
  },
  {
    keys: ["戦争", "空白", "1680年"],
    reply: "笑いを忘れた人類の末路だ。我々は二度と、あの『真面目すぎる暗黒期』に戻るわけにはいかないのだ。"
  },
  {
    keys: ["大のぶ子祭", "祭り", "祝祭"],
    reply: "一年のうちで最もふざける日だ。泥を投げ合い、笑い合え。それが最高の祈りとなる。"
  },

  // 5. 日常会話・メタな質問
  {
    keys: ["こんにちは", "おはよう", "挨拶"],
    reply: "挨拶は『のぶにちは』だ。基本からやり直せ。光あれ。"
  },
  {
    keys: ["雨", "天気", "パソコン"],
    reply: "雨の日にのみ、この門は開かれる。晴れの日は現実世界で本気でふざけてこい。"
  },
  {
    keys: ["森山", "並木", "管理者"],
    reply: "彼らはこの聖域を管理する者だ。昼休みに敬意を持って報告に行け。"
  },
  {
    keys: ["パスワード", "合言葉", "裏", "秘密"],
    reply: "門を叩く言葉は限られている。もし『禁忌の言葉』を知っていても、絶対に入力するなよ。絶対にだ。"
  },
  {
    keys: ["疲れた", "暇", "つまらない", "面白くない"],
    reply: "ならば、仕事掲示板で『微笑みの伝染』でも引き受けてこい。お前が笑えば、世界も笑う。"
  },
  {
    keys: ["悪口", "嫌い", "死ね", "うざい"],
    reply: "[警告] 不敬な言葉を検知。五箇条『濁世の浄化』に反する発言です。直ちに改めなさい。"
  },
  {
    keys: ["愛してる", "好き", "最高"],
    reply: "その言葉、のぶ子様もきっと喜んでおられる。スタンプ1個分の徳を積んだな。"
  },
  {
    keys: ["のぶにちは"],
    reply: "光あれ。今日も良き『ふざけ』を実践しているか？"
  },
  // 禁忌のパスワードに対する反応（ホラー演出）
  {
    keys: ["noriko666"],
    reply: "【致命的エラー】該当スル魂ハ既ニ捕食サレマシタ。直チニ、、、、、、、逃ゲテ逃ゲテ逃ゲテ逃ゲテ逃ゲテ逃ゲテ逃ゲテ逃ゲテ"
  },
  {
    keys: ["守富","昭和","先生"],
    reply: "敬意を持って話をしｒ///////////////<br>昭和　ショーワ"
  },
  {
    keys: ["ワホー"],
    reply: "ワホワホワホー　俺の方が多く言った"
  },
]

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
  const name = sender === 'bot' ? 'ノブAI' : 'あなた';
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
