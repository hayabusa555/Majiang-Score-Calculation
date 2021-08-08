(function(){
  View = {
      imgHtml: function(p) {
          return p ? '<img class="pai" data-pai="' + p
                          + '" src="img/' + p + '.gif">'
                   : '<img class="pai" src="img/pai.gif">';
      }
  };
})();

(function(){
  let imgHtml = View.imgHtml;
  View.Hand = function(node, hand, open) {
      this._node = node;
      this._hand = hand;
      this._open = open;
  }
  
  View.Hand.prototype.redraw = function() {
      let hidehand = this._node.find('.hidehand');
      hidehand.empty();
      for (let s of ['m','p','s','z']) {
          let akadora = this._hand._hidehand[s][0];
          for (let n = 1; n < this._hand._hidehand[s].length; n++) {
              let num = this._hand._hidehand[s][n];
              if (this._hand._zimo && s+n == this._hand._zimo) num--;
              if (this._hand._zimo && n == 5 && s+'0' == this._hand._zimo) {
                  akadora--;
                  num--;
              }
              for (let i = 0; i < num; i++) {
                  let p;
                  if (n == 5 && akadora > 0) { p = s+'0'; akadora-- }
                  else                         p = s+n;
                  hidehand.append(imgHtml(this._open ? p : null));
              }
          }
      }
      if (this._hand._zimo && this._hand._zimo.length == 2) {
          hidehand.append(
                '<span class="draw">'
              + imgHtml(this._open ? this._hand._zimo : null)
              + '</span>'
          );
      }
   
      let openhand = this._node.find('.openhand');
      openhand.empty();
      for (let m of this._hand._fulou) {
          let s = m[0];
          let html = '<span class="set">';
          if (m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1\1$/)) {
              let nn = m.match(/\d/g);
              html += imgHtml() + imgHtml(s+nn[2]) + imgHtml(s+nn[3]) + imgHtml();
          }
          else if (m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1\1?[\-\+\=]\1?$/)) {
              let jiagang = (m.match(/[\-\+\=]\d$/) != null);
              let d       = m.match(/[\-\+\=]/).shift();
              let img     = m.match(/\d/g).map(function(n){return imgHtml(s+n)});
              let img_r   = '<span class="rotate">'
                          + (jiagang ? img[2] + img[3] : img[img.length - 1])
                          + '</span>';
              let daminggang = ! jiagang && img.length == 4;
              if (d == '-')
                  html += img_r + img[0] + img[1] + (daminggang ? img[2] : '');
              if (d == '=')
                  html += img[0] + img_r + img[1] + (daminggang ? img[2] : '');
              if (d == '+')
                  html += img[0] + img[1] + (daminggang ? img[2] : '') + img_r;
          }
          else {
              let nn = m.match(/\d(?=\-)/).concat(m.match(/\d(?!\-)/g));
              html += '<span class="rotate">' + imgHtml(s + nn[0]) + '</span>';
              html += imgHtml(s + nn[1]) + imgHtml(s + nn[2]);
          }
          html += '</span>';
          openhand.append(html);
      }
  }
})();

  (function(){
    View.Shan = function(dora, uradora){
        this._dora   = dora   || [];
        this._uradora = uradora || [];
        dora = function(){ return this._dora}
        uradora = function(){ return this._uradora }
    }
  View.CalculateDialog = function(node) {
      this._node      = node;
      this.hide();
  }
  
  View.CalculateDialog.prototype.distribute = function(info) {
      let distribute = this._node.find('.distribute table');
      distribute.empty();
      let point = info.calculate.distribute;
      let have = info.score;
      let winds_hanzi = ['上家','自家','下家','対面'];
      let winds = ['東','南','西','北'];
      let ronwinds = info.seat;
      let mywinds = info.winds;
      let riich_p_left =  info.winds;
      let riich_p_right =  info.winds;
      let riich_p_front =  info.winds;
      let t=0;
      if(info.riich_left==1){
          if(riich_p_left<1)riich_p_left= Number(riich_p_left)+4;
        point[riich_p_left-1]=point[riich_p_left-1]-1000;
      }
      if(info.riich_my==1) point[mywinds]=point[mywinds]-1000;
      if(info.riich_right==1){
        if(riich_p_right>2)riich_p_right-=4;
            point[Number(riich_p_right)+1]=point[Number(riich_p_right)+1]-1000;
      }
      if(info.riich_front==1){
        if(riich_p_front>1)riich_p_front-=4;
          point[Number(riich_p_front)+2]=point[Number(riich_p_front)+2]-1000;
      }
        if(ronwinds==mywinds){
            t=ronwinds-1;
        }
        else if(ronwinds-mywinds==-1||ronwinds-mywinds==3){
            t=ronwinds;
        }
        else if(ronwinds-mywinds==-2||ronwinds-mywinds==2){
            t=ronwinds+1;
        }
        else if(ronwinds-mywinds==-3||ronwinds-mywinds==1){
            t=ronwinds+2;
        }
        for (let s=0; s<4;s++) {
            let node = $('<tr><td class="name"></td>'
                    + '<td class="mywinds"></td>'
                    + '<td class="before"></td>'
                    + '<td class="move"></td>'
                    + '<td class="after"></td></tr>');
            node.find('.name').text(winds_hanzi[s]);
            if(t>3)t=t-4;
            if(t<0)t=t+4;
            node.find('.mywinds').text(winds[t]);
            node.find('.before').text(have[t]);
            node.find('.move').text(point[t]);
            let sum = have[t] + point[t];
            node.find('.after').text(sum);
            t=t+1;
            distribute.append(node);
        }
      this._node.find('.distribute').show();
      this._node.fadeIn();
  }

  View.CalculateDialog.prototype.calculate = function(info) {
      this.hide();
      let hand = this._node.find('.hand');
      new View.Hand(hand, info.hand, true).redraw();
      hand.show();
      let yaku = this._node.find('.yaku table');
      yaku.empty();
      if (! info.calculate.yaku) {
          let node = $('<tr><td>役なし</td></tr>');
          yaku.append(node);
      }
      else {
          for (let h of info.calculate.yaku) {
              let node = $('<tr><td class="name"></td>'
                              + '<td class="fan"></td></tr>');
              node.find('.name').text(h.name);
              if (info.calculate.limit)
                      node.find('.fan').text(h.fan);
              else    node.find('.fan').text(h.fan + '翻');
              yaku.append(node);
          }
          let node = $('<tr><td colspan="2" class="score"></td></tr>');
          let text = info.calculate.fu + '符 ' + info.calculate.fan + '翻 ';
          if      (info.calculate.fan >= 13)    text += '数え役満 ';
          else if (info.calculate.fan >= 11)    text += '三倍満 ';
          else if (info.calculate.fan >=  8)    text += '倍満 ';
          else if (info.calculate.fan >=  6)    text += '跳満 ';
          else if (info.seat == 0 && info.calculate.score >= 12000
                || info.seat != 0 && info.calculate.score >=  8000)
                                              text += '満貫 ';
          if      (info.calculate.limit == 1)  text  = '役満 ';
          else if (info.calculate.limit == 2)  text  = 'ダブル役満 ';
          else if (info.calculate.limit == 3)  text  = 'トリプル役満 ';
          else if (info.calculate.limit == 4)  text  = '四倍役満 ';
          else if (info.calculate.limit == 5)  text  = '五倍役満 ';
          else if (info.calculate.limit == 6)  text  = '六倍役満 ';
          text += info.calculate.score + '点';
          node.find('.score').text(text);
          yaku.append(node);
      }
      this._node.find('.yaku').show();
      this._node.fadeIn();
  }
  
  
  View.CalculateDialog.prototype.hide = function() {
      this._node.hide();
      this._node.find('.hand').hide();
      this._node.find('.yaku').hide();
  }
})();
