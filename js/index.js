$(function(){
    function get_input_value() {
        let hands  = $('input[name="hands"]').val();
        let draw    = $('input[name="draw"]:checked').val() == 1;
        let hand = Hand.fromTenhouString(hands);
        let ron = draw ? null : hand._zimo;
        let riich   = $('input[name="riich"]:checked').val() -0 || 0;
        let dora  = $.makeArray($('input[name="dora"]')
                                .map(function(){return $(this).val()}))
                        .filter(function(p){return p})
                        .map(function(p){return p[0]+p[1]});
        let uradora = $.makeArray($('input[name="uradora"]')
                                .map(function(){return $(this).val()}))
                        .filter(function(p){return p})
                        .map(function(p){return p[0]+p[1]});
        let param = {
            field: $('select[name="field"] option:selected').val() -0,
            seat:    $('select[name="seat"] option:selected').val() -0,
            yaku: {
                riich:      riich,
                round:       $('input[name="round"]:checked').val() == 1,
                rob:  $('input[name="additional"]:checked').val() == 'rob',
                lastdiscard:  $('input[name="additional"]:checked').val() == 'lastdiscard',
                lastwall:      $('input[name="additional"]:checked').val() != 'lastwall' ? 0
                                : draw                                       ? 1
                                :                                              2,
                blessing:     $('input[name="blessing"]:checked').val() -0 || 0,
            },
            dora:     dora,
            uradora:   riich ? uradora : [],
            stack:$('input[name="stack"]').val(),
            chips:$('input[name="chips"]').val(),
        };
        return { hand: hand, ron: ron, param: param };
    }
    let view = new View.CalculateDialog($('.calculatedialog'));
    $('input[name="hands"]').focus();
    $('input[name="hands"]').val('m123z77p45p6,s999+,z111=');
    $('input[name="dora"]').first().val('z3');
    $('input[name="stack"]').val('0');
    $('input[name="chips"]').val('0');
    $('input[name="draw"][value="1"]').click(function(){
        $('input[name="additional"][value="rob"]').prop('checked', false);
    });
    $('input[name="draw"][value="0"]').click(function(){
        $('input[name="additional"][value="lastdiscard"]').prop('checked', false);
        $('input[name="blessing"]').prop('checked', false);
    });
    $('select[name="seat"]').change(function(){
        if ($(this).find(':selected').val() == 0) {
            $('.blessing').text('天和');
            $('input[name=blessing]').val(1);
        }
        else {
            $('.blessing').text('地和');
            $('input[name=blessing]').val(2);
        }
    });
    $('input[name="riich"]').on('change', function(){
        if ($(this).prop('checked')) {
            let tggle = $(this).val() == 1 ? 2 : 1;
            $(`input[name="riich"][value="${tggle}"]`).prop('checked', false);
            $('input[name="uradora"]').parent().removeClass('hide');
            $('input[name="round"]').prop('disabled', false);
            $('input[name="blessing"]').prop('checked', false);
        }
        else {
            $('input[name="uradora"]').parent().addClass('hide');
            $('input[name="round"]').prop('checked', false)
                                    .prop('disabled', true);
        }
    });
    $('input[name="round"]').click(function(){
        $('input[name="additional"][value="lastdiscard"]').prop('checked', false);
    });
    $('input[name="additional"]').click(function(){
        let self = this;
        $('input[name="additional"]').each(function(){
            if (this != self) $(this).prop('checked', false);
        });
        if ($(this).prop('checked')) {
            $('input[name="blessing"]').prop('checked', false);
        }
    });
    $('input[name="additional"][value="lastdiscard"]').click(function(){
        $('input[name="draw"][value="1"]').click();
        $('input[name="round"]').prop('checked', false);
    });
    $('input[name="additional"][value="rob"]').click(function(){
        $('input[name="draw"][value="0"]').click();
    });
    $('input[name="blessing"]').click(function(){
        $('input[name="draw"][value="1"]').click();
        $('input[name="riich"]').prop('checked', false);
        $('input[name="round"]').prop('checked', false)
                               .prop('disabled' ,true);
        $('input[name="additional"]').prop('checked', false);
        
    });
    $('input[name="first"][type="submit"]').click(function(event){
        event.preventDefault();
        let seat  = $('select[name="seat"] option:selected').val();
        let rv = get_input_value();
        let calculate = Calculation(rv.hand, rv.ron, rv.param);
        let data = {
            seat:   seat,
            hand: rv.hand,
            calculate:    calculate,
        };
        view.calculate(data);
        return false;
    });
    $('input[type="reset"]').click(function(){
        $('input[name="hands"]').focus();
    });
    $('input[name="second"][type="submit"]').click(function(event){
        event.preventDefault();
        let winds  = $('select[name="winds"] option:selected').val();
        let begin = $('input[name="begin"]:checked').val() -0 || 0;
        let rv = get_input_value();
        let calculate = Calculation(rv.hand, rv.ron, rv.param);
        let score = Score(calculate, begin);
        let score3 = [Number(score[0]),Number(score[1]),Number(score[2]),Number(score[3])];
        let riich_left   = $('input[name="riich_left"]:checked').val() -0 || 0;
        let riich_my   = $('input[name="riich_my"]:checked').val() -0 || 0;
        let riich_right   = $('input[name="riich_right"]:checked').val() -0 || 0;
        let riich_front   = $('input[name="riich_front"]:checked').val() -0 || 0;
        let data = {
            winds:   winds,
            calculate:    calculate,
            score: score3,
            seat: rv.param.seat,
            riich_left: riich_left,
            riich_my: riich_my,
            riich_right: riich_right,
            riich_front: riich_front
        };
        view.distribute(data);
        $('input[name="begin"]').prop('checked', false);
    });
});
