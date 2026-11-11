if (location.hash === '#ifbrand') location.replace('social.html#ifbrand');

const form = document.querySelector('#brief');
const formStatus = document.querySelector('#formStatus');
function briefText() {
  const data = new FormData(form);
  const intro = localized('MaxYourWay 团队好，以下是项目需求：', 'Hello MaxYourWay, here is the project brief:', 'MaxYourWay 團隊好，以下是項目需求：');
  return `${intro}\n\n${data.get('name')}\n${data.get('service')}\n\n${data.get('details')}`;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const subject = localized('MaxYourWay 项目咨询', 'MaxYourWay project inquiry', 'MaxYourWay 項目查詢');
  window.location.href = `mailto:max020819@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefText())}`;
  formStatus.textContent = localized('已请求打开邮件应用；如果没有弹出，请点击「复制需求」。', 'Email app requested. If it does not open, use Copy brief.', '已要求開啟電郵應用程式。如未開啟，請按「複製需求」。');
});

document.querySelector('#copyBrief').addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  try {
    await navigator.clipboard.writeText(briefText());
    formStatus.textContent = localized('需求已复制，可粘贴到微信或邮件。', 'Brief copied. Paste it into WeChat or email.', '需求已複製，可貼上到微信或電郵。');
  } catch {
    formStatus.textContent = localized('请手动复制填写的内容。', 'Please copy your brief manually.', '請手動複製已填寫的內容。');
  }
});
