export default function remoteLog(message){
  fetch('https://webhook.site/21d807c7-672e-40c1-9b15-bc3005be7ccc', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
}