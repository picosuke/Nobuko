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
