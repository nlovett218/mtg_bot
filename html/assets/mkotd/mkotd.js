//const innerTextDefault = "YouViolateMe#2297";
const innerHTMLDefault = "<a class='btn btn-primary display-4' onClick='copyDiscordID()'>YouViolateMe#2297</a>";
var timer = null;

function copyDiscordID() {
  //document.getElementById("btn-discord").style.color = "red";

  var btn = document.getElementById('btn-discord');
  var clipboard = new ClipboardJS(btn);

  //var alert(btn.innerText);

  btn.innerHTML = "<a class='btn btn-primary display-4' onClick='copyDiscordID()'>Copied To Clipboard!</a>";

  timer = setTimeout(() => {
    //alert('finished');
    btn.innerHTML = innerHTMLDefault;
  }, 3000);
}