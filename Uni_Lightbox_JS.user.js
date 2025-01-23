// ==UserScript==
// @name        Uni Lightbox JS
// @namespace        http://tampermonkey.net/
// @version        1.6
// @description        ネット上の画像の高精細な暗転拡大表示
// @author        Net User
// @match        https://*/*
// @match        http://*/*
// @exclude        https://ameblo.jp/*
// @exclude        https://*.ameba.jp/*
// @exclude        https://abema.tv/*
// @exclude        https://x.com/*
// @noframes
// @grant        none
// @updateURL        https://github.com/personwritep/Uni_Lightbox_JS/raw/main/Uni_Lightbox_JS.user.js
// @downloadURL        https://github.com/personwritep/Uni_Lightbox_JS/raw/main/Uni_Lightbox_JS.user.js
// ==/UserScript==


let disp_mode=0; // 拡張ディスプレイモードの判別
let view_w; // 拡大率
let view_ac; // クリック操作 0: Ctrl+Click　1: Click
let c_press=false; // Ctrlキー押下フラグ


view_w=sessionStorage.getItem('UL_w')*1;
if(!view_w){
    view_w=200; // 🔴拡大率の初期値
    sessionStorage.setItem('UL_w', view_w); }

view_ac=sessionStorage.getItem('UL_ac')*1;
if(!view_ac){
    view_ac=0; // 🔴クリック動作の初期値
    sessionStorage.setItem('UL_ac', view_ac); }

let html_=document.documentElement;



document.addEventListener('mousedown', function(event){
    if(disp_mode==0){ // Lightbox非表示
        if(view_ac==0){
            if(event.ctrlKey){ //「Ctrl+Click」
                lightbox(event); }}
        if(view_ac==1){
            if(!event.ctrlKey){ //「Click」
                lightbox(event); }}}
}, true );



function lightbox(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    let elem=document.elementFromPoint(event.clientX, event.clientY);
    if(elem){
        box_env();
        if(event.shiftKey){ //「+Shift」
            set_img(elem, 1); }
        else{
            set_img(elem, 0); } //「not Shift」
        set_link(elem);
        ex_mag(); }}



function box_env(){

    let ud_SVG=
        '<svg height="23" width="23" viewBox="0 0 40 50">'+
        '<path style="fill: #000;" d="M20 6L13 21L28 21C25.9 15.9 23.5 '+
        '10.3 20 6M13 28L20 43C23.5 38.7 25.9 33.1 28 28L13 28z"></path>'+
        '</svg>';

    let help_SVG=
        '<svg height="28" width="28" viewBox="0 0 256 256">'+
        '<path style="fill: #000;" d="M114 12C96 15 79 '+
        '20 64 30C51 38 42 48 34 60C1 105 6 170 45 210C60 225 80 235 '+
        '100 241C114 245 129 245 144 243C160 241 175 235 188 227C201 '+
        '219 212 208 221 196C260 143 245 65 190 30C179 23 166 17 153 '+
        '15C140 12 127 11 114 12z"></path>'+
        '<path style="fill: #fff;" d="M115 26C100 29 85 34 72'+
        ' 42C60 49 51 57 43 69C16 109 19 167 54 202C66 213 81 223 97 '+
        '227C111 231 128 233 142 231C156 229 170 224 182 216C233 184 '+
        '246 110 208 63C194 47 175 36 155 30C143 26 128 25 115 26z"></path>'+
        '<path style="fill: #000;" d="M85 94C94 93 102 '+
        '88 110 85C121 82 143 85 137 102C134 111 125 116 119 122C110 '+
        '131 106 142 105 155L140 155C143 141 154 134 163 123C172 111 '+
        '176 95 171 81C162 57 133 55 111 58C104 59 94 60 88 65C82 71 '+
        '85 86 85 94M108 176L108 205C115 204 122 205 129 205C131 205 '+
        '136 205 138 204C140 202 139 198 139 196L139 176L108 176z"></path>'+
        '</svg>';

    let link_SVG=
        '<svg class="link_UL" height="22" width="22" viewBox="0 0 512 512">'+
        '<path d="M327 185c60 60 59 156.7.36 215-.11.12-.24.25-.36.37l-67 '+
        '67c-59 59-156 59-215 0-59-59-59-156 0-215l37-37c10-10 27-3 27 '+
        '10.6.6 18 4 36 10 53 2 5.8.6 12-4 17l-13 13c-28 28-29 74-1 102 28 '+
        '29 74 29 102.3.5l67-67c28-28 28-74 0-102-4-4-7-7-10-9a16 16 0 0 '+
        '1-7-13c-0-11 3-21 12-30l21-21c6-6 14-6 21-2a152 152 0 0 1 21 '+
        '17zM468 44c-59-59-156-59-215 0l-67 67c-.1.1-.3.3-.4.4-59 59-59 '+
        '154.8.4 215a152 152 0 0 0 21 17c6 4 15 4 21-2l21-21c8-8 12-19 '+
        '12-30a16 16 0 0 0-7-13c-3-2-7-5-10-9-28-28-28-74 0-101l67-67c28-28 '+
        '74-28 102.3.5 28 28 27 74-1 102l-13 13c-4 4-6 11-4 17 6 17 9 35 10 '+
        '52.7.5 14 17 20 27 11l37-37c59-59 59-155.7.0-215z"></path></svg>';

    let lightbox=
        '<div id="lightbox">'+
        '<div id="photo_sw">'+
        '<a id="photo_link">'+ link_SVG +' Linked Page</a>'+
        '<div id="mag_sw">'+
        '<p id="ws" class="bc" title="拡大率：マウスホイールで調節">Gz '+
        '<span id="wsv"></span>'+ ud_SVG +'</p>'+
        '<p id="ac" class="bc" title="Lightboxの起動操作"></p>'+
        '<a id="help_svg">'+ help_SVG +'</a>'+
        '</div></div>'+
        '<img id="box_img">'+
        '<style>'+
        '@keyframes fadeIn { 0% {opacity: 0} 100% {opacity: 1}} '+
        '.fin { animation: fadeIn .5s ease 0s 1 normal; animation-fill-mode: both; } '+
        '@keyframes fadeOut { 0% {opacity: 1} 100% {opacity: 0}} '+
        '.fout { animation: fadeOut .2s ease 0s 1 normal; animation-fill-mode: both; } '+
        '#lightbox { position: fixed; top: 0; left: 0; visibility: hidden; z-index: calc(infinity); '+
        'display: grid; place-items: center; overflow: auto; user-select: none; '+
        'background: black; width: 100vw; height: 100vh; text-align: center; } '+
        '#photo_sw { position: fixed; top: 0; width: 100%; height: 15%; } '+
        '#photo_link { font: bold 21px Meiryo; position: absolute; top: 16px; left: 30px; '+
        'padding: 4px 12px 1px 10px; color: #000; background: #fff; cursor: pointer; '+
        'border: 2px solid #000; border-radius: 6px; text-decoration: none; opacity: 0; } '+
        '#photo_sw:hover #photo_link { opacity: 1; } '+
        '#photo_link:not([href]) { visibility: hidden; } '+
        '.link_UL{ height: 22px; vertical-align: -3px; fill: red; } '+
        '#mag_sw { position: fixed; top: 0; right: 20px; display: flex; padding: 20px; '+
        'width: auto; justify-content: flex-end; box-sizing: content-box; opacity: 0; } '+
        '#photo_sw:hover #mag_sw { opacity: 1; } '+
        '#help_svg { margin-left: 20px; cursor: pointer; } '+
        '.bc { height: 24px; padding: 0 5px; margin: 0 4px; font: bold 22px/28px Meiryo; '+
        'border: 2px solid #000; border-radius: 4px; color: #000; background: #fff; '+
        'cursor: pointer; box-sizing: content-box !important; overflow: hidden; } '+
        '#wsv { font: inherit; } '+
        '#ws svg { margin-right: -4px; vertical-align: -4px; } '+
        '#box_img { width: 98vw; height: 98vh; padding: 1vh 1vw; object-fit: contain; '+
        'box-sizing: content-box; max-width: unset; max-height: unset; } '+
        'img { pointer-events: auto !important; } '+
        '</style></div>';

    if(!document.querySelector('#lightbox')){
        document.body.insertAdjacentHTML('beforeend', lightbox); }


    let wsv=document.querySelector('#wsv');
    if(wsv){
        wsv.textContent=view_w; }

    zoom_set();

    ctrl_act();

    let help_svg=document.querySelector('#help_svg');
    if(help_svg){
        help_svg.onclick=function(event){
            event.stopImmediatePropagation();
            window.open('https://ameblo.jp/personwritep/entry-12871389541.html',
                        null, 'width=820,height=800'); }}

} // box_env()



function zoom_set(){
    let photo_sw=document.querySelector('#photo_sw');
    let wsv=document.querySelector('#wsv');

    if(photo_sw && wsv){
        photo_sw.onwheel=function(event){ // マスウホイールで設定
            if(ws_check()){
                if(event.deltaY<0 && view_w<381){
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    view_w=view_w*1 +20;
                    let box_img=document.querySelector('#box_img');
                    if(box_img){
                        box_img.style.width=view_w +'vw';
                        trim(view_w); }
                    wsv.textContent=view_w;
                    sessionStorage.setItem('UL_w', view_w); }

                else if(event.deltaY>0 && view_w>119){
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    view_w=view_w*1 -20;
                    let box_img=document.querySelector('#box_img');
                    if(box_img){
                        box_img.style.width=view_w +'vw';
                        trim(view_w); }
                    wsv.textContent=view_w;
                    sessionStorage.setItem('UL_w', view_w); }}}}


    function ws_check(){
        let ws=document.querySelector('#ws');
        if(ws){
            if(ws.style.display=='block'){
                return true; }}}


    function trim(view_z){
        let lightbox=document.querySelector('#lightbox');
        let box_img=document.querySelector('#box_img');
        let i_width=box_img.naturalWidth;
        let i_height=box_img.naturalHeight;
        let w_width= window.innerWidth;
        let w_height= window.innerHeight;

        let view_width=w_width*view_z/100;
        lightbox.scrollTo((view_width - w_width)/2,
                          ((view_width*i_height)/i_width - w_height)/2); }

} // zoom_set()



function ctrl_act(){
    let ac=document.querySelector('#ac');
    if(ac){
        if(view_ac==0){
            ac.textContent='Ctrl+Click'; }
        else{
            ac.textContent='Click'; }

        ac.onclick=function(event){
            event.stopImmediatePropagation();
            if(view_ac==0){
                view_ac=1;
                ac.textContent='Click'; }
            else{
                view_ac=0;
                ac.textContent='Ctrl+Click'; }
            sessionStorage.setItem('UL_ac', view_ac); } // Storage更新

    }} // ctrl_act()



function set_link(target){
    let photo_link=document.querySelector('#photo_link');
    if(photo_link){
        let link_a=target.closest('a');
        if(link_a){
            let url=link_a.getAttribute('href');
            if(url){
                photo_link.setAttribute('href', url); }}

        photo_link.onclick=function(event){
            event.stopImmediatePropagation(); }}}



function set_img(target, n){
    let lightbox=document.querySelector('#lightbox');
    let box_img=lightbox.querySelector('#box_img');

    if(lightbox && box_img && target){
        let img_src=target.getAttribute('src');
        if(img_src){
            let img_src_=picture(target, img_src);
            if(n==1){
                img_src=img_src_; } //「+Shift」
            else{
                img_src=link_img(target, img_src_); }} //「not Shift」
        else{ // 兄弟要素のimgを探す
            if(n==1){
                let sibling_img=target.parentElement.querySelector('img');
                if(sibling_img){
                    img_src=sibling_img.getAttribute('src');
                    if(img_src){
                        img_src=picture(sibling_img, img_src); }}
                else{ // targetの background-imageの取得を試す
                    let bgr_img=window.getComputedStyle(target).getPropertyValue('background-image');
                    if(bgr_img){
                        img_src=bgr_img.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); }}}}

        if(img_src=='none'){
            img_src=null; }

        if(img_src){
            disp_mode=1; // Lightbox表示 通常拡大
            disp_ws(disp_mode);
            box_img.src=img_src;
            html_.style.overflow='hidden';
            lightbox.style.visibility='visible';
            lightbox.classList.remove('fout');
            lightbox.classList.add('fin'); }}



    function link_img(target, t_img_src){ // a要素がimgのリンクの場合 その画像を選択
        let l_url;
        let get_url;

        let link_a=target.closest('a');
        if(link_a){
            l_url=link_a.getAttribute('href');
            if(l_url){
                if(l_url.indexOf('#')!=-1){
                    l_url.substring(0, l_url.indexOf("#")); } // ハッシュ削除
                if(l_url.indexOf('?')!=-1){
                    l_url.substring(0, l_url.indexOf("?")); } // クエリ文字列削除
                let ext_reg=/\.(png|jpg|jpeg|gif)$/i; // 許容する画像拡張子
                if(ext_reg.test(l_url)){
                    get_url=l_url;
                }}}

        if(get_url && t_img_src){
            return get_url; }
        else{
            return t_img_src; }

    } // link_img()



    function picture(img_elem, img_src){
        let all_src=[];
        let max_size=0;
        let max_img_src;
        let img_parent=img_elem.parentElement;

        if(img_parent.tagName=='PICTURE'){ // pictureタグの構成
            let sources=img_parent.querySelectorAll('source'); // sourceのSRCを調査
            for(let k=0; k<sources.length; k++){
                let p_srcset=sources[k].srcset;
                if(p_srcset){
                    let p_src=p_srcset.split(',');
                    for(let s=0; s<p_src.length; s++){
                        all_src.push(p_src[s]); }}}

            let i_srcset=img_elem.srcset; // imgのSRCを調査
            if(i_srcset){
                let i_src=i_srcset.split(',');
                for(let s=0; s<i_src.length; s++){
                    all_src.push(i_src[s]); }}}

        else{ // pictureタグの無い構成
            let i_srcset=img_elem.srcset; // imgのSRCを調査
            if(i_srcset){
                let i_src=i_srcset.split(',');
                for(let s=0; s<i_src.length; s++){
                    all_src.push(i_src[s]); }}}


        for(let k=0; k<all_src.length; k++){
            let w_have=all_src[k].match(/\s\d{1,4}w/); // 100w 200w のタイプ
            if(w_have){
                let i_width=parseInt(w_have[0].replace(/[^0-9]/g, ''), 10);
                if(i_width>max_size){
                    max_size=i_width;
                    max_img_src=all_src[k].replace(/\s\d{1,4}w/, ''); }}
            else{
                let x_have=all_src[k].match(/\s\dx/); // 1x 2x 3x のタイプ
                if(x_have){
                    let i_width=parseInt(x_have[0].replace(/[^0-9]/g, ''), 10);
                    if(i_width>max_size){
                        max_size=i_width;
                        max_img_src=all_src[k].replace(/\s\dx/, ''); }}}}

        if(max_img_src){
            return max_img_src; }
        else{
            return img_src; } // srcset から max_img_srcの取得に失敗した場合

    } //picture()

} // set_img()



function ex_mag(){
    let lightbox=document.querySelector('#lightbox');
    let box_img=lightbox.querySelector('#box_img');

    if(lightbox){
        lightbox.onclick=function(event){ // 拡張ディスプレイモード
            event.preventDefault();

            if(!event.ctrlKey && !event.shiftKey){ // 元の表示に戻る
                close_box(); }
            else{
                if(disp_mode==1){
                    disp_mode=2; // 拡張拡大
                    disp_ws(disp_mode);
                    lightbox.style.overflow='auto';
                    box_img.style.height='auto';
                    box_img.style.padding='0';
                    box_img.style.width=view_w +'vw';
                    mag_point(event); }
                else{
                    disp_mode=1; // 通常拡大
                    disp_ws(disp_mode);
                    lightbox.style.overflow='hidden';
                    box_img.style.height='98vh';
                    box_img.style.width='98vw';
                    box_img.style.padding='1vh 1vw'; }}


            function mag_point(event){
                let actal_x; // Actual Pixels表示スクロールx値
                let actal_y; // Actual Pixels表示スクロールy値
                let nwidth=box_img.naturalWidth;
                let nhight=box_img.naturalHeight;
                let ratio=nwidth/nhight
                let top=event.offsetY;
                let left=event.offsetX;
                let ww=lightbox.clientWidth;
                let wh=lightbox.clientHeight;

                if(ww<wh*ratio){
                    actal_x=(left*view_w/100) - ww/2;
                    actal_y=(2*top - wh + ww/ratio)*view_w/200 - wh/2; }
                else{
                    let zk=((2*left - ww)/wh/ratio + 1)/2;
                    actal_x=(zk*view_w -50)*ww/100;
                    actal_y=(top*ww*view_w)/(wh*ratio*100) - wh/2; }

                lightbox.scrollTo(actal_x, actal_y); }

        } // onclick()
    }
} // ex_mag()




function close_box(){
    let lightbox=document.querySelector('#lightbox');
    let box_img=lightbox.querySelector('#box_img');
    if(lightbox && box_img){
        disp_mode=0; // 拡張ディスプレイモード リセット
        disp_ws(disp_mode);
        html_.style.overflow='inherit';
        lightbox.classList.remove('fin');
        lightbox.classList.add('fout');
        lightbox.style.overflow='hidden'; // overflowのリセット
        box_img.style.height='98vh';
        box_img.style.width='98vw';
        box_img.style.padding='1vh 1vw';
        setTimeout(()=>{
            lightbox.style.visibility='hidden';
            box_img.src='';
        }, 200); }}



function disp_ws(n){
    let ws=document.querySelector('#ws');
    if(ws){
        if(n==2){
            ws.style.display='block'; }
        else{
            ws.style.display='none'; }}}



function key_press(event){
    c_press=event.ctrlKey; } // Ctrlキー押下の true false を取得

document.addEventListener("keyup", key_press, {passive: false});
document.addEventListener("keydown", key_press, {passive: false});

function weel_idle(event){
    if(c_press && disp_mode>0){
        event.preventDefault(); }}

window.addEventListener("mousewheel", weel_idle, {passive: false});
window.addEventListener("wheel", weel_idle, {passive: false});
