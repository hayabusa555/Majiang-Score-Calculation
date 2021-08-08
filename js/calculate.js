(function(){
  function set(s, hidehand, n) {
      if (n > 9) return [[]];
      if (hidehand[n] == 0) return set(s, hidehand, n+1);
      let sequence = [];
      if (n <= 7 && hidehand[n] > 0 && hidehand[n+1] > 0 && hidehand[n+2] > 0) {
          hidehand[n]--; hidehand[n+1]--; hidehand[n+2]--;
          sequence = set(s, hidehand, n);
          hidehand[n]++; hidehand[n+1]++; hidehand[n+2]++;
          for (let s_set of sequence) {
              s_set.unshift(s+(n)+(n+1)+(n+2));
          }
      }
      let identical = [];
      if (hidehand[n] >= 3) {
          hidehand[n] -= 3;
          identical = set(s, hidehand, n);
          hidehand[n] += 3;
          for (let k_set of identical) {
              k_set.unshift(s+n+n+n);
          }
      }
      return sequence.concat(identical);
  }
  
  function set_all(hand) {
      let all_set = [[]];
      for (let s of ['m','p','s']) {
          let new_set = [];
          let sub_set = set(s, hand._hidehand[s], 1);
          for (let mm of all_set) {
              for (let nn of sub_set) {
                  new_set.push(mm.concat(nn));
              }
          }
          all_set = new_set;
      }
      let sub_set_z = [];
      for (let n = 1; n <= 7; n++) {
          if (hand._hidehand.z[n] == 0) continue;
          if (hand._hidehand.z[n] != 3) return [];
          sub_set_z.push('z'+n+n+n);
      }
      let openhand = hand._fulou.map(function(m){return m.replace(/0/g ,'5')});
      for (let i = 0; i < all_set.length; i++) {
          all_set[i] = all_set[i].concat(sub_set_z)
                                       .concat(openhand);
      }
      return all_set;
  }
  
  function add_winpai(calculate_set, p) {
      let regexp   = new RegExp('^(' + p[0] + '.*' + (p[1] || '5') +')');
      let replacer = '$1' + p[2] + '!';
      let new_set = [];
      for (let i = 0; i < calculate_set.length; i++) {
          if (calculate_set[i].match(/[\-\+\=]/)) continue;
          if (i > 0 && calculate_set[i] == calculate_set[i-1]) continue;
          let m = calculate_set[i].replace(regexp, replacer);
          if (m == calculate_set[i]) continue;
          let tmp_set = calculate_set.concat();
          tmp_set[i] = m;
          new_set.push(tmp_set);
      }
      return new_set;
  }
  
  function calculate_set_normals(hand, winpai) {
      let calculate_set = [];
      for (let s in hand._hidehand) {
          let hidehand = hand._hidehand[s];
          for (let n = 1; n < hidehand.length; n++) {
              if (hidehand[n] < 2) continue;
              hidehand[n] -= 2;
              let head = s+n+n;
              for (let mm of set_all(hand)) {
                  mm.unshift(head);
                  if (mm.length != 5) continue;
                  calculate_set = calculate_set.concat(add_winpai(mm, winpai));
              }
              hidehand[n] += 2;
          }
      }
      return calculate_set;
  }
  
  function calculate_set_pairs(hand, winpai) {
      if (hand._fulou.length > 0) return [];
      let set = [];
      for (let s in hand._hidehand) {
          let hidehand = hand._hidehand[s];
          for (let n = 1; n < hidehand.length; n++) {
              if (hidehand[n] == 0) continue;
              if (hidehand[n] == 2) {
                  let p = (s+n == winpai.substr(0,2))
                              ? s+n+n + winpai[2] + '!'
                              : s+n+n;
                  set.push(p);
              }
              else return [];
          }
      }
      return (set.length == 7) ? [set] : [];
  }
  
  function calculate_set_orphans(hand, winpai) {
      let set = [];
      if (hand._fulou.length > 0) return [];
      let you_duizi = false;
      for (let s in hand._hidehand) {
          let hidehand = hand._hidehand[s];
          let nn = (s == 'z') ? [1,2,3,4,5,6,7] : [1,9];
          for (let n of nn) {
              if (hidehand[n] == 2) {
                  let p = (s+n == winpai.substr(0,2))
                              ? s+n+n + winpai[2] + '!'
                              : s+n+n;
                  set.unshift(p);
                  you_duizi = true;
              }
              else if (hidehand[n] == 1) {
                  let p = (s+n == winpai.substr(0,2))
                              ? s+n + winpai[2] + '!'
                              : s+n;
                  set.push(p);
              }
              else return [];
          }
      }
      return you_duizi ? [set] : [];
  }
  
  function calculate_set_gates(hand, winpai) {
      if (hand._fulou.length > 0) return [];
      let s = winpai[0];
      if (s == 'z') return [];
      let set = s;
      let hidehand = hand._hidehand[s];
      for (let n = 1; n <= 9; n++) {
          if ((n == 1 || n == 9) && hidehand[n] < 3) return [];
          if (hidehand[n] == 0) return [];
          let nn = (n == winpai[1]) ? hidehand[n] - 1 : hidehand[n];
          for (let i = 0; i < nn; i++) {
              set += n;
          }
      }
      if (set.length != 14) return [];
      set += winpai.substr(1) + '!';
      return [[set]];
  }
  
  function calculate_set(hand, ron) {
      if (! hand._zimo || hand._zimo.length > 2) return [];
      let winpai = ron || hand._zimo + '_';
      winpai = winpai.replace(/0/, '5');
      return [].concat(calculate_set_normals(hand, winpai))
               .concat(calculate_set_pairs(hand, winpai))
               .concat(calculate_set_orphans(hand, winpai))
               .concat(calculate_set_gates(hand, winpai));
  }
  
  function get_pattern(set, field, seat) {
      let fieldwind = new RegExp('^z' + (field + 1) + '.*$');
      let seatwind    = new RegExp('^z' + (seat + 1) + '.*$');
      let sanyuanpai    = /^z[567].*$/;
      let terminal        = /^.*[z19].*$/;
      let honours         = /^z.*$/;
      let identical          = /^[mpsz](\d)\1\1.*$/;
      let hideidentical        = /^[mpsz](\d)\1\1(?:\1|_\!)?$/;
      let equivalent        = /^[mpsz](\d)\1\1.*\1.*$/;
      let solo         = /^[mpsz](\d)\1[\-\+\=\_]\!$/;
      let kanzhang      = /^[mps]\d\d[\-\+\=\_]\!\d$/;
      let bianzhang     = /^[mps](123[\-\+\=\_]\!|7[\-\+\=\_]\!89)$/;
      let pattern = {
          fu:         20,
          concealed:    true,
          draw:       true,
          sequence: { m: [0,0,0,0,0,0,0,0],
                    p: [0,0,0,0,0,0,0,0],
                    s: [0,0,0,0,0,0,0,0]  },
          identical: { m: [0,0,0,0,0,0,0,0,0,0],
                        p: [0,0,0,0,0,0,0,0,0,0],
                        s: [0,0,0,0,0,0,0,0,0,0],
                        z: [0,0,0,0,0,0,0,0]      },
          n_sequence:   0,
          n_identical:     0,
          n_hideidentical:   0,
          n_equivalent:   0,
          n_honours:    0,
          n_terminal:   0,
          n_honours:    0,
          solo:      false,
          runs:     false,
          field: field,
          seat:    seat
      };
      
      for (let m of set) {
          if (m.match(/[\-\+\=]\!/))      pattern.draw    = false;
          if (m.match(/[\-\+\=](?!\!)/))  pattern.concealed = false;
          if (set.length == 1) continue;
        if (m.match(solo))             pattern.solo   = true;
        if (set.length == 13) continue;
        if (m.match(terminal))            pattern.n_terminal++;
        if (m.match(honours))             pattern.n_honours++;
          if (set.length != 5) continue;
          if (m == set[0]) {
                    let fu = 0;
                    if (m.match(fieldwind)) fu += 2;
                    if (m.match(seatwind))    fu += 2;
                    if (m.match(sanyuanpai))    fu += 2;
                    pattern.fu += fu;
                    if (pattern.solo)             pattern.fu += 2;
                }
          else if (m.match(identical)) {
              pattern.n_identical++;
              let fu = 2;
              if (m.match(terminal)) { fu *= 2;                  }
              if (m.match(hideidentical)) { fu *= 2; pattern.n_hideidentical++; }
              if (m.match(equivalent)) { fu *= 4; pattern.n_equivalent++; }
              pattern.fu += fu;
              pattern.identical[m[0]][m[1]] = 1;
          }
          else {
              pattern.n_sequence++;
              if (m.match(kanzhang))  pattern.fu += 2;
              if (m.match(bianzhang)) pattern.fu += 2;
            pattern.sequence[m[0]][m[1]]++;
          }
      }
      
      if (set.length == 7) {
          pattern.fu = 25;
      }
      else if (set.length == 5) {
          pattern.runs = (pattern.concealed && pattern.fu == 20);
          if (pattern.draw) {
              if (! pattern.runs)      pattern.fu +=  2;
          }
          else {
              if (pattern.concealed)       pattern.fu += 10;
              else if (pattern.fu == 20) pattern.fu  = 30;
          }
          pattern.fu = Math.ceil(pattern.fu / 10) * 10;
      }
      return pattern;
  }
  
  function get_pre_yaku(yaku) {
      let pre_yaku = [];
      if (yaku.riich == 1)   pre_yaku.push({ name: '立直', fan: 1 });
      if (yaku.riich == 2)   pre_yaku.push({ name: 'ダブル立直', fan: 2 });
      if (yaku.round)         pre_yaku.push({ name: '一発', fan: 1 });
      if (yaku.lastwall == 1)   pre_yaku.push({ name: '海底摸月', fan: 1 });
      if (yaku.lastwall == 2)   pre_yaku.push({ name: '河底撈魚', fan: 1 });
      if (yaku.lastdiscard)    pre_yaku.push({ name: '嶺上開花', fan: 1 });
      if (yaku.rob)    pre_yaku.push({ name: '槍槓', fan: 1 });
      if (yaku.blessing == 1)  pre_yaku = [{ name: '天和', fan: '*' }];
      if (yaku.blessing == 2)  pre_yaku = [{ name: '地和', fan: '*' }];
      return pre_yaku;
  }
  
  function get_yaku(set, pattern, pre_yaku) {
      function concealeddraw() {
          if (pattern.concealed && pattern.draw)
                  return [{ name: '門前清自摸和', fan: 1 }];
          return [];
      }
      function wind() {
          let winds_hanzi = ['東','南','西','北'];
          let wind_all = [];
          if (pattern.identical.z[pattern.field+1])
                  wind_all.push({ name: '場風 ' + winds_hanzi[pattern.field],
                                    fan: 1 });
          if (pattern.identical.z[pattern.seat+1])
                  wind_all.push({ name: '自風 ' + winds_hanzi[pattern.seat],
                                    fan: 1 });
          if (pattern.identical.z[5]) wind_all.push({ name: '翻牌 白', fan: 1 });
          if (pattern.identical.z[6]) wind_all.push({ name: '翻牌 發', fan: 1 });
          if (pattern.identical.z[7]) wind_all.push({ name: '翻牌 中', fan: 1 });
          return wind_all;
      }
      function runs() {
          if (pattern.runs)        return [{ name: '平和', fan: 1 }];
          return [];
      }
      function simple() {
          if (pattern.n_terminal == 0) return [{ name: '断幺九', fan: 1 }];
          return [];
      }
      function doublerun() {
          if (! pattern.concealed)     return [];
          let beikou = 0;
          for (let s in pattern.sequence) {
              for (let m in pattern.sequence[s]) {
                  if (pattern.sequence[s][m] > 3) beikou++;
                  if (pattern.sequence[s][m] > 1) beikou++;
              }
          }
          if (beikou == 1)        return [{ name: '一盃口', fan: 1 }];
          return [];
      }
      function samesequence() {
          let sequence = pattern.sequence;
          for (let m in sequence.m) {
              if (sequence.p[m] && sequence.s[m])
                  return [{ name: '三色同順', fan: (pattern.concealed ? 2 : 1) }];
          }
          return [];
      }
      function straight() {
          let sequence = pattern.sequence;
          for (let s of ['m','p','s']) {
              if (sequence[s][1] && sequence[s][4] && sequence[s][7])
                  return [{ name: '一気通貫', fan: (pattern.concealed ? 2 : 1) }];
          }
          return [];
      }
      function mixoutside() {
          if (pattern.n_terminal == 5 && pattern.n_sequence > 0 && pattern.n_honours > 0)
                  return [{ name: '混全帯幺九', fan: (pattern.concealed ? 2 : 1) }];
          return [];
      }
      function pairs() {
          if (set.length == 7)     return [{ name: '七対子', fan: 2 }];
          return [];
      }
      function triples() {
          if (pattern.n_identical == 4)       return [{ name: '対々和', fan: 2 }];
          return [];
      }
      function threeconcealed() {
          if (pattern.n_hideidentical == 3)     return [{ name: '三暗刻', fan: 2 }];
          return [];
      }
      function threequads() {
          if (pattern.n_equivalent == 3)     return [{ name: '三槓子', fan: 2 }];
          return [];
      }
      function sameidentical() {
          let identical = pattern.identical;
          for (let n = 1; n <= 9; n++) {
              if (identical.m[n] + identical.p[n] + identical.s[n] == 3)
                                      return [{ name: '三色同刻', fan: 2 }];
          }
          return [];
      }
      function terminalhonor() {
          if (pattern.n_terminal == set.length
              && pattern.n_sequence == 0 && pattern.n_honours > 0)
                                      return [{ name: '混老頭', fan: 2 }];
          return [];
      }
      function littledragon() {
          if (pattern.identical.z[5] + pattern.identical.z[6] + pattern.identical.z[7] == 2
              && set[0].match(/^z[567]/))
                                      return [{ name: '小三元', fan: 2 }];
          return [];
      }
      function mixflush() {
          for (let s of ['m','p','s']) {
              let yise = new RegExp('^[z' + s + '].*$');
              if (set.filter(function(m){return m.match(yise)}).length
                          == set.length
                  &&  pattern.n_honours > 0)
                      return [{ name: '混一色', fan: (pattern.concealed ? 3 : 2) }];
          }
          return [];
      }
      function pureoutside() {
          if (pattern.n_terminal == 5 && pattern.n_sequence > 0 && pattern.n_honours == 0)
                  return [{ name: '純全帯幺九', fan: (pattern.concealed ? 3 : 2) }];
          return [];
      }
      function twodoublerun() {
          if (! pattern.concealed)     return [];
          let beikou = 0;
          for (let s in pattern.sequence) {
              for (let m in pattern.sequence[s]) {
                  if (pattern.sequence[s][m] > 3) beikou++;
                  if (pattern.sequence[s][m] > 1) beikou++;
              }
          }
          if (beikou == 2)        return [{ name: '二盃口', fan: 3 }];
          return [];
      }
      function flush() {
          for (let s of ['m','p','s']) {
              let yise = new RegExp('^[z' + s + '].*$');
              if (set.filter(function(m){return m.match(yise)}).length
                          == set.length
                  &&  pattern.n_honours == 0)
                      return [{ name: '清一色', fan: (pattern.concealed ? 6 : 5) }];
          }
          return [];
      }
  
      function thirteenorphans() {
          if (set.length != 13)    return [];
          if (pattern.solo)     return [{ name: '国士無双十三面', fan: '**' }];
          else                return [{ name: '国士無双', fan: '*' }];
      }
      function fourconcealed() {
          if (pattern.n_hideidentical != 4)     return [];
          if (pattern.solo)     return [{ name: '四暗刻単騎', fan: '**' }];
          else                return [{ name: '四暗刻', fan: '*' }];
      }
      function bigdragon() {
          if (pattern.identical.z[5] + pattern.identical.z[6] + pattern.identical.z[7] == 3) {
              let bao_set = set.filter(function(m){
                          return m.match(/^z([567])\1\1(?:[\-\+\=]|\1)(?!\!)/)});
              let target = (bao_set[2] && bao_set[2].match(/[\-\+\=]/));
              return [{ name: '大三元', fan: '*', target: target && target[0] }];
          }
          return [];
      }
      function fourwinds() {
          let identical = pattern.identical;
          if (identical.z[1] + identical.z[2] + identical.z[3] + identical.z[4] == 4) {
              let bao_set = set.filter(function(m){
                          return m.match(/^z([1234])\1\1(?:[\-\+\=]|\1)(?!\!)/)});
              let target = (bao_set[3] && bao_set[3].match(/[\-\+\=]/));
              return [{ name: '大四喜', fan: '**', target: target && target[0] }];
          }
          if (identical.z[1] + identical.z[2] + identical.z[3] + identical.z[4] == 3
              && set[0].match(/^z[1234]/))
                              return [{ name: '小四喜', fan: '*' }];
          return [];
      }
      function honors() {
          if (pattern.n_honours == set.length)
                              return [{ name: '字一色', fan: '*' }];
          return [];
      }
      function greens() {
          if (set.filter(function(m){return m.match(/^[mp]/)}).length > 0)
                                              return [];
          if (set.filter(function(m){return m.match(/^z[^6]/)}).length > 0)
                                              return [];
          if (set.filter(function(m){return m.match(/^s.*[1579]/)}).length > 0)
                                              return [];
          return [{ name: '緑一色', fan: '*' }];
      }
      function terminals() {
          if (pattern.n_identical == 4 && pattern.n_terminal == 5 && pattern.n_honours == 0)
                              return [{ name: '清老頭', fan: '*' }];
          return [];
      }
      function fourquads() {
          if (pattern.n_equivalent == 4)
                              return [{ name: '四槓子', fan: '*' }];
          return [];
      }
      function ninegates() {
          if (set.length != 1)             return [];
          if (set[0].match(/^[mps]1112345678999/))
                              return [{ name: '純正九蓮宝燈', fan: '**' }];
          else                return [{ name: '九蓮宝燈', fan: '*' }];
      }
  
      let limit = (pre_yaku.length > 0 && pre_yaku[0].fan[0] == '*')
                          ? pre_yaku : [];
      limit = limit
                  .concat(thirteenorphans())
                  .concat(fourconcealed())
                  .concat(bigdragon())
                  .concat(fourwinds())
                  .concat(honors())
                  .concat(greens())
                  .concat(terminals())
                  .concat(fourquads())
                  .concat(ninegates());
  
      if (limit.length > 0) return limit;
      else return pre_yaku
                  .concat(concealeddraw())
                  .concat(wind())
                  .concat(runs())
                  .concat(simple())
                  .concat(doublerun())
                  .concat(samesequence())
                  .concat(straight())
                  .concat(mixoutside())
                  .concat(pairs())
                  .concat(triples())
                  .concat(threeconcealed())
                  .concat(threequads())
                  .concat(sameidentical())
                  .concat(terminalhonor())
                  .concat(littledragon())
                  .concat(mixflush())
                  .concat(pureoutside())
                  .concat(twodoublerun())
                  .concat(flush());
  }
  
  function get_post_yaku(hands, dora, uradora) {
      let post_yaku = [];
      let substr = hands.match(/[mpsz][^mpsz,]*/g) || [];
      let n_dora = 0;
      for (let p of dora) {
          p = Shan.indora(p);
          let regexp = new RegExp(p[1],'g');
          for (let str of substr) {
              if (str[0] != p[0]) continue;
              str = str.replace(/0/, '5');
              let nn = str.match(regexp);
              if (nn) n_dora += nn.length;
          }
      }
      if (n_dora) post_yaku.push({ name: 'ドラ', fan: n_dora });
      let n_hongpai = 0;
      let nn = hands.match(/0/g);
      if (nn) n_hongpai = nn.length;
      if (n_hongpai) post_yaku.push({ name: '赤ドラ', fan: n_hongpai });
      let n_uradora = 0;
      for (let p of uradora) {
          p = Shan.indora(p);
          let regexp = new RegExp(p[1],'g');
          for (let str of substr) {
              if (str[0] != p[0]) continue;
              str = str.replace(/0/, '5');
              let nn = str.match(regexp);
              if (nn) n_uradora += nn.length;
          }
      }
      if (n_uradora) post_yaku.push({ name: '裏ドラ', fan: n_uradora });
      return post_yaku;
  }

  Score = function(calculate,begin){
      let score=[];
    if(begin==1){
        score=[ 25000,25000,25000,25000 ];
      }
      else{
          let points=window.name;
          for(let i=0;i<4;i++){
            score   = points.split(',');
          }
      }
      let score2=[];
        for(let i=0;i<4;i++){
        score2[i]=Number(score[i])+calculate.distribute[i];
        }
        window.name=score2;
    return score;
  }

  Calculation = function(hand, ron, param) {
      let max = {
          yaku:      null,
          fu:         0,
          fan:     0,
          limit:  0,
          score:      0,
          distribute:     [ 0, 0, 0, 0 ]
      };
      let pre_yaku  = get_pre_yaku(param.yaku);
      let post_yaku = get_post_yaku(
                          hand.toString(), param.dora, param.uradora);
      for (let set of calculate_set(hand, ron)) {
          let pattern  = get_pattern(set, param.field, param.seat);
          let yaku = get_yaku(set, pattern, pre_yaku);
          if (yaku.length == 0) continue;
          let fu = pattern.fu;
          let fan = 0, score = 0, limit = 0;
          let target2, score2 = 0;
          if (yaku[0].fan[0] == '*') {
              for (let h of yaku) {
                  limit += h.fan.match(/\*/g).length;
                  if (h.target) {
                      target2 = h.target == '+' ? (param.seat + 1) % 4
                              : h.target == '=' ? (param.seat + 2) % 4
                              : h.target == '-' ? (param.seat + 3) % 4
                              : -1;
                      score2  = 8000 * h.fan.match(/\*/g).length;
                  }
              }
              score = 8000 * limit;
          }
          else {
              yaku = yaku.concat(post_yaku);
              for (let h of yaku) { fan += h.fan }
              if      (fan >= 13) score = 8000;
              else if (fan >= 11) score = 6000;
              else if (fan >=  8) score = 4000;
              else if (fan >=  6) score = 3000;
              else {
                  score = fu * 2 * 2;
                  for (let i = 0; i < fan; i++) { score *= 2 }
                  if (score >= 2000) score = 2000;
              }
          }
          let distribute = [ 0, 0, 0, 0 ];
   
          let stack = param.stack;
          let chips = param.chips;
          if (ron || score == 0) {
            let target = score == 0        ? target2
                       : ron[2] == '+' ? (param.seat + 1) % 4
                       : ron[2] == '=' ? (param.seat + 2) % 4
                       : ron[2] == '-' ? (param.seat + 3) % 4
                       : -1;
            score = Math.ceil(score * (param.seat == 0 ? 6 : 4) / 100) * 100;
            distribute[param.seat] +=  score + stack * 300 + chips * 1000;
            if(target==-1){
                if(param.seat == 0){
                    distribute[1]        += -score/3 - stack * 300;
                    distribute[2]        += -score/3 - stack * 300;
                    distribute[3]        += -score/3 - stack * 300;
                }
                else{
                    distribute[0]        += -score/4 - stack * 300;
                    distribute[(param.seat + 1) % 4]        += -score/4 - stack * 300;
                    distribute[(param.seat + 2) % 4]        += -score/4 - stack * 300;
                    distribute[(param.seat + 3) % 4]        += -score/4 - stack * 300;
                }
            }
            else{
            distribute[target]        += -score - stack * 300;
            }
        }
          else {
              let parent = Math.ceil(score * 2 / 100) * 100;
              let child    = Math.ceil(score     / 100) * 100;
              if (param.seat == 0) {
                  score = parent * 3;
                  for (let l = 0; l < 4; l++) {
                      if (l == param.seat)
                          distribute[l] += score + stack * 300 + chips * 1000;
                      else
                          distribute[l] += -parent - stack * 100;
                  }
              }
              else {
                  score = parent + child * 2;
                  for (let l = 0; l < 4; l++) {
                      if (l == param.seat)
                          distribute[l] += score      + stack * 300
                                                 + chips * 1000;
                      else if (l == 0)
                          distribute[l] += -parent - stack * 100;
                      else
                          distribute[l] += -child    - stack * 100;
                  }
              }
          }
          if (score + score2 > max.score) {
              max = {
                  yaku:      yaku,
                  fu:         fu,
                  fan:     fan,
                  limit:  limit,
                  score:      score + score2,
                  distribute:     distribute
              };
          }
      }
      return max;
  }
})();
