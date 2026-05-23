// パスワード設定
const SECRET_WORD = "nobuko64";
const pwBtn = document.getElementById('pw-btn');
const pwInput = document.getElementById('pw-input');
const pwScreen = document.getElementById('password-screen');
const pwError = document.getElementById('pw-error');

// パスワード照合
function checkPassword() {
  if (pwInput.value === SECRET_WORD) {
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
