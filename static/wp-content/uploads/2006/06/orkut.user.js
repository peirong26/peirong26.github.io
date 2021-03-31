// ==UserScript==
// @name                orkut in FADOM
// @namespace   http://www.leonardofaria.net
// @description allow orkut's page in FADOm
// @include             http://www.orkut.com/*
// @include             https://www.orkut.com/*
// ==/UserScript==
(function () {

var imagem = document.images;
for (var k=0; k<imagem.length; k++){
	if (imagem[k].src.substring(0,8)=="http://");
	imagem[k].src = "https://"+imagem[k].src.substring(7);
}
var hiperlink = document.links;
for (var n=0; n<hiperlink.length; n++){
	if (hiperlink[n].href.substring(0,8)=="http://");
	hiperlink[n].href = "https://"+hiperlink[n].href.substring(7);
}

})();