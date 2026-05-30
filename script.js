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
