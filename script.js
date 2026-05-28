// パスワード設定（一般用と管理者用の2種類）
const NORMAL_WORD = "nobuko64";      // 一般信者用の合言葉
const ADMIN_WORD = "morinami2026";   // ★管理者（森山・並木）用の合言葉

const pwBtn = document.getElementById('pw-btn');
const pwInput = document.getElementById('pw-input');
const pwScreen = document.getElementById('password-screen');
const pwError = document.getElementById('pw-error');

// 管理者かどうかのフラグ（Firebase側でも使うのでwindowオブジェクトに入れる）
window.isAdmin = false; 

// パスワード照合
function checkPassword() {
  if (pwInput.value === NORMAL_WORD || pwInput.value === ADMIN_WORD) {
    
    // 管理者パスワードだった場合、フラグを立てて管理者エリアを表示する
    if (pwInput.value === ADMIN_WORD) {
      window.isAdmin = true;
      const adminArea = document.getElementById('admin-area');
      if (adminArea) {
        adminArea.style.display = 'block';
      }
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

// ページ切り替えロジック
function showSection() {
  const hash = window.location.hash || '#home';
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  const targetSec = document.querySelector(hash);
  if (targetSec) targetSec.classList.add('active');

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('href') === hash) btn.classList.add('active');
  });
  window.scrollTo(0, 0); // 切り替え時に上端へ戻る
}

window.addEventListener('DOMContentLoaded', showSection);
window.addEventListener('hashchange', showSection);
