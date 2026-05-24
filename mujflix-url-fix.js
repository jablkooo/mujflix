VM147:8 Uncaught TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
    at <anonymous>:8:5
(anonymous) @ VM147:8
14(index):8855 [MFSync] Data úspěšně odeslána do cloudu
app.js?v=3:10142  HEAD https://svetserialu.to/?s=J%C3%A1%2C%20padouch 404 (Not Found)
(anonymous) @ app.js?v=3:10142
(anonymous) @ app.js?v=3:10150
findBestSource @ app.js?v=3:10133
c @ app.js?v=3:10509
(anonymous) @ app.js?v=3:10523
Promise.finally
openMovieInCinema @ app.js?v=3:10523
_showCinemaOrFinderChoice @ app.js?v=3:1411
(anonymous) @ app.js?v=3:1132
8(index):8855 [MFSync] Data úspěšně odeslána do cloudu
const obs = new MutationObserver(() => {
  const wrap = document.getElementById('cinemaFrameWrap');
  if (!wrap) return;
  const html = wrap.innerHTML;
  if (!html.includes('bombuj')) return;
  const match = html.match(/bombuj\.si\/online-film-([a-z0-9-]+-\d{4})/);
  console.log('bombuj detekován, match:', match ? match[1] : 'bez roku');
});
obs.observe(document.body, { childList: true, subtree: true });
console.log('observer aktivní — klikni na film');
VM302:10 observer aktivní — klikni na film
undefined
3VM302:7 bombuj detekován, match: ja-padouch-2010
(index):8855 [MFSync] Data úspěšně odeslána do cloudu
2VM302:7 bombuj detekován, match: ja-padouch-2010
(index):8855 [MFSync] Data úspěšně odeslána do cloudu
4VM302:7 bombuj detekován, match: ja-padouch-2010
(index):8855 [MFSync] Data úspěšně odeslána do cloudu
2VM302:7 bombuj detekován, match: ja-padouch-2010
(index):8855 [MFSync] Data úspěšně odeslána do cloudu
4VM302:7 bombuj detekován, match: ja-padouch-2010
(index):8855 [MFSync] Data úspěšně odeslána do cloudu
2VM302:7 bombuj detekován, match: ja-padouch-2010
(index):8855 [MFSync] Data úspěšně odeslána do cloudu
4VM302:7 bombuj detekován, match: ja-padouch-2010
(index):8855 [MFSync] Data úspěšně odeslána do cloudu
3VM302:7 bombuj detekován, match: ja-padouch-2010
