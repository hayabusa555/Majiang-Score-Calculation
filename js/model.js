(function(){
  Hand = function(purehand) {
      this._hidehand = {
          m: [0,0,0,0,0,0,0,0,0,0],
          p: [0,0,0,0,0,0,0,0,0,0],
          s: [0,0,0,0,0,0,0,0,0,0],
          z: [0,0,0,0,0,0,0,0],
      };
      this._fulou = [];
      this._zimo  = null;
      if (! purehand) return;
      for (let p of purehand) {
          this._hidehand[p[0]][p[1]]++;
          if (p[1] == '0') this._hidehand[p[0]][5]++;
      }
  }
  Hand.fromString = function(hands) {
    let purehand   = [];
      let openhand   = hands.split(',');
      let hidehand = openhand.shift();
      for (let substr of hidehand.match(/[mpsz]\d+/g) || []) {
          let s = substr[0];
          for (let n of substr.match(/\d/g)) {
              if (s == 'z' && (n < 1 || 7 < n)) continue;
              purehand.push(s+n);
          }
      }
      let debt = hidehand.match(/[mpsz]\d+[\-\+\=]?$/g);
      if(debt[0][2] == '+'||debt[0][2] == '-'||debt[0][2] == '='){
        purehand.pop();
        for (let substr of hidehand.match(/[mpsz]\d+[\-\+\=]?$/g) || []) {
            let s = substr[0];
            let nn = substr[2];
                for (let n of substr.match(/\d/g)) {
                    if (s == 'z' && (n < 1 || 7 < n)) continue;
                    if(hidehand.match(/[mpsz]\d+[\-\+\=]?$/g))purehand.push(s+n+nn);
                }
        }
      }
      while (purehand.length > 14 - openhand.length * 3) purehand.pop();
      let draw = (purehand.length - 2) % 3 == 0 && purehand.pop();
      let hand = new Hand(purehand);
      if (draw) hand.draw(draw);
      for (let m of openhand) {
          let h = m.replace(/0/g, '5');
          if (h.match(/^[mpsz](\d)\1\1[\-\+\=]?\1?$/) ||
              h.match(/^[mpsz](\d)\1\1\1[\-\+\=]?$/))
          {
              m = m.replace(/([mps])05/, '$1'+'50');
              hand._fulou.push(m);
          }
          else if (h.match(/^[mpsz]\d+\-\d*$/)) {
              let akadora = m.match(/0/);
              let s = h[0];
              let nn = h.match(/\d[\-\+\=]?/g).sort();
              if (nn.length != 3) continue;
              let n = nn[0][0] - 0;
              if (n + 1 != nn[1][0] || n + 2 != nn[2][0]) continue;
              m = s+nn.join('');
              if (akadora) m = m.replace(/5/, '0');
              hand._fulou.push(m);
          }
      }
      return hand;
  }
  
  Hand.fromTenhouString = function(tenhoustr) {
      let openhand   = tenhoustr.split(',');
      let hidehand = openhand.shift();
      let hands  = hidehand;
      if (openhand.length) {
          hands += ','
                + openhand.join(',').match(/./g).join('');
      }
      return Hand.fromString(hands);
  }
  

  
  Hand.prototype.toString = function() {
      let hands = '';
      for (let s of ['m','p','s','z']) {
          let substr = s;
          let hidehand = this._hidehand[s];
          let akadora = hidehand[0];
          for (let n = 1; n < hidehand.length; n++) {
              let num = hidehand[n];
              this._zimo = this._zimo.replace(/[\-\+\=]/g,'');
              if (this._zimo && s+n == this._zimo) num--;
              if (this._zimo && n == 5 && s+'0' == this._zimo) {
                  akadora--;
                  num--;
              }
              for (let i = 0; i < num; i++) {
                  if (n == 5 && akadora > 0) { substr += '0'; akadora-- }
                  else                         substr += n;
              }
          }
          if (substr.length > 1) hands += substr;
      }
      if (this._zimo && this._zimo.length == 2) {
          hands += this._zimo;
      }
      for (let m of this._fulou) {
          hands += ',' + m;
      }
      return hands;
  }
  
  
  Hand.prototype.draw = function(p) {
      if (! this._zimo) {
          this._zimo = p;
          this._hidehand[p[0]][p[1]]++;
          if (p[0] != 'z' && p[1] == '0') this._hidehand[p[0]][5]++;
      }
  }
  
  })();

  (function(){
  Shan = function(akadora) {
      if (! akadora) akadora = { m: 0, p: 0, s: 0 };
      let pai = [];
      for (let s of ['m','p','s','z']) {
          for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
              for (let i = 0; i < 4; i++) {
                  if (akadora[s] && n == 5 && i < akadora[s]) pai.push(s+'0');
                  else                                        pai.push(s+n);
              }
          }
      }
      this._pai = [];
      while (pai.length > 0) {
          let r = Math.floor(Math.random()*pai.length);
          let p = pai[r];
          pai.splice(r, 1);
          this._pai.push(p);
      }
      this._dora   = [this._pai[4]];
      this._uradora = [this._pai[9]];
      this._weikaigang = false;
  }
  
  Shan.indora = function(p) {
      if (p[0] == 'z') return p[1] < 5
                              ? p[0] + (p[1] % 4 + 1)
                              : p[0] + ((p[1] - 4) % 3 + 5);
      else             return p[1] == '0'
                              ? p[0] + '6'
                              : p[0] + (p[1] % 9 + 1);
  }
})();
