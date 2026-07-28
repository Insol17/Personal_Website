const button = document.querySelector('#changeButton');
const description = document.querySelector('#description');

button.addEventListener('click', function () {
  description.textContent = '버튼이 정상적으로 작동했습니다.';
});