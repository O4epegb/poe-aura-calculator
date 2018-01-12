var new_auras_encode = [
    [
        ['local_reduced', 7],
        ['bla', 3],
        ['enlighten', 4],
        ['bmg', 5],
        ['cla', 5],
        ['mul', 10]
    ],
    [
        ['covenant', 1],
        ['envy', 1],
        ['heretic', 1],
        ['essence_worm', 1],
        ['enhance', 1],
        ['victario', 1],
        ['gen', 1],
        ['emp', 1],
        ['prg', 1],
        ['wra', 1],
        ['vit', 1],
        ['aa', 1],
        ['pol', 1],
        ['poi', 1],
        ['pof', 1],
        ['poe', 1],
        ['hol', 1],
        ['hoi', 1],
        ['hoa', 1],
        ['hat', 1],
        ['has', 1],
        ['gra', 1],
        ['dis', 1],
        ['det', 1],
        ['ang', 1]
    ]
];
var old_auras_encode = [
    ['heretic', 1],
    ['essence_worm', 1],
    ['enhance', 1],
    ['bla', 3],
    ['victario', 1],
    ['gen', 1],
    ['emp', 1],
    ['prg', 1],
    ['wra', 1],
    ['vit', 1],
    ['aa', 1],
    ['pol', 1],
    ['poi', 1],
    ['pof', 1],
    ['poe', 1],
    ['hol', 1],
    ['hoi', 1],
    ['hoa', 1],
    ['hat', 1],
    ['has', 1],
    ['gra', 1],
    ['dis', 1],
    ['det', 1],
    ['ang', 1],
    ['legacy', 1],
    ['enlighten', 4],
    ['bmg', 5],
    ['cla', 5],
    ['mul', 10]
];
var settings_encode = [
    ['perfect_form', 1],
    ['cef', 1],
    ['ic2', 1],
    ['ich', 1],
    ['mi2', 1],
    ['mid', 1],
    ['alp', 1],
    ['mcs', 1],
    ['bms', 1],
    ['skyforth', 1],
    ['rms', 6],
    ['mana', 15],
    ['life', 15]
];
var alpha = {
    index: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ=_-',
    encode: function(encnum) {
        var ret = '';
        for (
            var i = Math.floor(
                Math.log(parseInt(encnum)) / Math.log(alpha.index.length)
            );
            i >= 0;
            i--
        ) {
            ret =
                ret +
                alpha.index.substr(
                    Math.floor(
                        parseInt(encnum) / alpha.bcpow(alpha.index.length, i)
                    ) % alpha.index.length,
                    1
                );
        }
        return ret.reverse();
    },
    decode: function(decstr) {
        var str = decstr.reverse();
        var ret = 0;
        for (var i = 0; i <= str.length - 1; i++) {
            ret =
                ret +
                alpha.index.indexOf(str.substr(i, 1)) *
                    alpha.bcpow(alpha.index.length, str.length - 1 - i);
        }
        return ret;
    },
    bcpow: function(_a, _b) {
        return Math.floor(Math.pow(parseFloat(_a), parseInt(_b)));
    }
};
String.prototype.reverse = function() {
    return this.split('')
        .reverse()
        .join('');
};
var pad = function(num, amount) {
    var zeros = new Array(amount + 1).join('0');
    return (zeros + '' + num).slice(amount * -1);
};
$.fn.restricted_val = function() {
    var obj = $(this);
    var val = parseInt(obj.val());
    var lower = parseInt(obj.attr('min'));
    var upper = parseInt(obj.attr('max'));
    if (isNaN(val)) {
        obj.val('');
        return 0;
    }
    if (val < lower) {
        obj.val(lower);
        return lower;
    }
    if (val > upper) {
        obj.val(upper);
        return upper;
    }
    if (val == 0) {
        obj.val('');
        return 0;
    }
    return val;
};
var disable_field = function(field) {
    $(field)
        .prop('checked', false)
        .prop('disabled', true)
        .parents('label')
        .addClass('disabled');
};
var enable_field = function(field) {
    $(field)
        .prop('disabled', false)
        .parents('label')
        .removeClass('disabled');
};
var recalculate = function(nohash) {
    if ($('#viewing').is(':visible')) {
        return false;
    }
    var flat = [0, 0];
    var perc = [0, 0];
    var hands_used = 0;
    enable_field(
        '[data-melee], [data-shield], [data-helm], [data-wand], [data-body], [data-item]'
    );
    enable_field('.aura input, .misc input');
    $('[data-depends]').each(function() {
        if ($(this).is(':checked')) {
            enable_field('.' + $(this).data('depends') + ' input');
        } else {
            disable_field('.' + $(this).data('depends') + ' input');
        }
    });
    if ($('[data-melee]:checked').length) {
        hands_used += $('#skills [data-melee]:checked').length;
        disable_field('#skills [data-wand]');
    }
    if ($('#skills [data-melee]:checked').length) {
        disable_field('[data-wand]');
    }
    if ($('[data-shield]:checked').length) {
        hands_used += $('#skills [data-shield]:checked').length;
        disable_field('#skills [data-shield]:not(:checked)');
    }
    if ($('[data-wand]:checked').length) {
        hands_used += $('#skills [data-wand]:checked').length;
        disable_field('#skills [data-melee]');
    }
    if ($('#skills [data-wand]:checked').length) {
        disable_field('[data-melee]');
    }
    if (hands_used >= 2) {
        disable_field(
            '#skills [data-wand]:not(:checked), #skills [data-melee]:not(:checked), #skills [data-shield]:not(:checked)'
        );
    }
    if (
        $(
            '#skills [data-wand]:checked, #skills [data-melee]:checked, #skills [data-shield]:checked'
        ).length >= 2
    ) {
        disable_field(
            '[data-wand]:not(:checked), [data-melee]:not(:checked), [data-shield]:not(:checked)'
        );
    }
    if ($('#skills [data-helm]:checked').length) {
        disable_field('[data-helm]:not(:checked)');
    }
    if ($('#skills [data-body]:checked').length) {
        disable_field('[data-body]:not(:checked)');
    }
    if (
        $(
            '.aura-grp [data-wand]:checked, .aura-grp [data-melee]:checked, .aura-grp [data-shield]:checked'
        ).length
    ) {
        disable_field('[name=mi2], [name=ic2]');
    }
    if ($('[data-helm]:checked').length) {
        var ignore_class = $('[data-helm]:checked')
            .parents('label')
            .attr('class');
        ignore_class = $.trim(ignore_class.replace('edited', ''));
        disable_field(
            'label:not(.' + ignore_class + ') [data-helm]:not(:checked)'
        );
    }
    if ($('[data-body]:checked').length) {
        var ignore_class = $('[data-body]:checked')
            .parents('label')
            .attr('class');
        ignore_class = $.trim(ignore_class.replace('edited', ''));
        disable_field(
            'label:not(.' + ignore_class + ') [data-body]:not(:checked)'
        );
    }
    if ($('[data-boots]:checked').length) {
        var ignore_class = $('[data-boots]:checked')
            .parents('label')
            .attr('class');
        ignore_class = $.trim(ignore_class.replace('edited', ''));
        disable_field(
            'label:not(.' + ignore_class + ') [data-boots]:not(:checked)'
        );
    }
    $('label.edited').removeClass('edited');
    $('input[type=number]').each(function() {
        var val = parseInt($(this).val());
        val = isNaN(val) ? 0 : val;
        if (val != parseInt($(this).data('default'))) {
            $(this)
                .parents('label')
                .addClass('edited');
        }
    });
    $('input[type=checkbox]:checked')
        .parents('label')
        .addClass('edited');
    $('label.selected').removeClass('selected');
    $('*[data-reserved] input:checked').each(function() {
        var name = $(this)
            .attr('name')
            .replace(/\[[0-9]*\]/, '');
        $('label.' + name + ':not(.edited)').addClass('selected');
    });
    if ($('.cla.edited').length) {
        $('.cla:not(.edited)').addClass('selected');
    }
    var reduced_mana = 100 + $('.rms input[type=number]').restricted_val() * -1;
    var mortal_conv = $('.mcs input:checked').length ? 50 : 100;
    reduced_mana += $('.essence_worm input:checked').length * 40;
    if ($('.essence_worm input:checked').length == 2) {
        disable_field($('.essence_worm input:not(:checked)'));
    }
    reduced_mana -= $('.alp input:checked').length ? 8 : 0;
    reduced_mana -= $('.ich input:checked').length ? 5 : 0;
    reduced_mana -= $('.ic2 input:checked').length ? 5 : 0;
    reduced_mana -= $('.cef input:checked').length ? 2 : 0;
    reduced_mana -= $('.skyforth input:checked').length ? 6 : 0;
    perc[1] += $('.mid input:checked').length ? 30 : 0;
    perc[1] += $('.mi2 input:checked').length ? 30 : 0;
    $('.aura-grp').each(function() {
        if ($('[data-item]:checked', this).length) {
            disable_field($('[data-item]:not(:checked)', this));
        }
        if (
            $(
                '.misc .edited:not(.essence_worm):not(.mul), .aura .bla.edited',
                this
            ).length ||
            $('.aura .edited', this).length > 1
        ) {
            disable_field($('.essence_worm input', this));
        } else if ($('.misc .edited.essence_worm', this).length) {
            disable_field($('.misc label:not(.essence_worm) input', this));
            disable_field($('.aura label.bla input', this));
            if ($('.aura .edited', this).length) {
                disable_field($('.aura label:not(.edited) input', this));
            }
        }
        var bm_gem_multipliers = [
            2.45,
            2.42,
            2.39,
            2.37,
            2.34,
            2.32,
            2.29,
            2.26,
            2.24,
            2.21,
            2.18,
            2.16,
            2.13,
            2.11,
            2.08,
            2.05,
            2.03,
            2.0,
            1.97,
            1.96,
            1.93,
            1.9,
            1.87,
            1.84,
            1.81,
            1.78,
            1.75,
            1.72,
            1.69,
            1.66
        ];
        var bm_gem_lvl = $('.bmg input[type=number]', this).restricted_val();
        var bm_gem_multi =
            bm_gem_lvl == 0
                ? 100
                : Math.round(bm_gem_multipliers[bm_gem_lvl - 1] * 100);
        $('.bmg .multi', this).html('x' + bm_gem_multi.toString() + '%');
        var blood_magic = false;
        if (
            $('.swo input:checked', this).length ||
            $('.bms input:checked').length ||
            bm_gem_lvl ||
            $('.covenant input:checked', this).length
        ) {
            blood_magic = true;
        }
        var rm_gem_lvl = $(
            '.enlighten input[type=number]',
            this
        ).restricted_val();
        var rm_gem_multi = [100, 100, 96, 92, 88, 84, 80, 76, 72, 68, 64][
            rm_gem_lvl
        ];
        $('.enlighten .multi', this).html('x' + rm_gem_multi.toString() + '%');
        var other_multi = $('.mul input[type=number]', this).restricted_val();
        var additional_reduced_mana = $(
            '.local_reduced input[type=number]',
            this
        ).restricted_val();
        if ($('.emp input:checked', this).length) {
            other_multi += 25;
        }
        if ($('.enhance input:checked', this).length) {
            other_multi += 15;
        }
        if ($('.prg input:checked', this).length) {
            additional_reduced_mana += 25;
            blood_magic = true;
        }
        if ($('.victario input:checked', this).length) {
            additional_reduced_mana += 30;
        }
        $('.aura', this).removeClass('bm');
        if (blood_magic) {
            $('.aura', this).addClass('bm');
        }
        var calculate_aura = function(aura) {
            var calc_reduced =
                Math.floor(
                    (reduced_mana - additional_reduced_mana) *
                        mortal_conv /
                        100 -
                        100
                ) * -1;
            var calc_reserved = Math.floor(
                aura *
                    (rm_gem_multi / 100) *
                    (bm_gem_multi / 100) *
                    (other_multi / 100)
            );
            var total =
                calc_reserved - Math.floor(calc_reduced / 100 * calc_reserved);
            if (total < 0) {
                return 0;
            } else {
                return total;
            }
        };
        if ($('.essence_worm input:checked', this).length) {
            calculate_aura = function(aura) {
                return 0;
            };
        }
        var clarity_lvl = $('.cla input[type=number]', this).restricted_val();
        var clarity_mana_cost = [
            0,
            34,
            48,
            61,
            76,
            89,
            102,
            115,
            129,
            141,
            154,
            166,
            178,
            190,
            203,
            214,
            227,
            239,
            251,
            265,
            279,
            293,
            303,
            313,
            323,
            333,
            343,
            353,
            363,
            373,
            383,
            383
        ];
        var clarity_mana =
            clarity_lvl == 0
                ? 0
                : calculate_aura(clarity_mana_cost[clarity_lvl]);
        flat[+blood_magic] += clarity_mana;
        $('.cla .reserved-mana', this).html(clarity_mana.toString());
        $('.cla', this).data(
            'reserved-calculated',
            calculate_aura(clarity_mana_cost[clarity_lvl + 1]) -
                calculate_aura(clarity_mana_cost[clarity_lvl])
        );
        var bla_num = $('.bla input[type=number]', this).restricted_val();
        var additional_reduced_mana_tmp = additional_reduced_mana;
        if ($('.heretic input:checked', this).length) {
            additional_reduced_mana += 12;
        }
        var bla_reserved = calculate_aura(35) * bla_num;
        $('.bla', this).data(
            'reserved-calculated',
            calculate_aura(35) * (bla_num + 1)
        );
        perc[+blood_magic] += bla_reserved;
        $('.bla .reserved', this).html(bla_reserved + '%');
        additional_reduced_mana = additional_reduced_mana_tmp;
        $('*[data-reserved]', this).each(function() {
            if (
                $(this).hasClass('aa') &&
                $('input[name=perfect_form]:checked').length
            ) {
                var additional_reduced_mana_tmp = additional_reduced_mana;
                additional_reduced_mana = additional_reduced_mana + 100;
            }
            var reserved_mana = calculate_aura($(this).data('reserved'));
            if (
                $(this).hasClass('aa') &&
                $('input[name=perfect_form]:checked').length
            ) {
                additional_reduced_mana = additional_reduced_mana_tmp;
            }
            if ($('input:checked', this).length) {
                perc[+blood_magic] += reserved_mana;
            }
            $('.reserved', this).html(reserved_mana + '%');
            $(this).data('reserved-calculated', reserved_mana);
        });
    });
    var life = $('input[name=life]').restricted_val();
    var mana = $('input[name=mana]').restricted_val();
    mana = mana ? mana : 1;
    life = life ? life : 1;
    var life_reserved_numeric = Math.ceil(life * (perc[1] / 100)) + flat[1];
    var mana_reserved_numeric = Math.ceil(mana * (perc[0] / 100)) + flat[0];
    if (life_reserved_numeric == 0 && life == 1 && perc[1]) {
        life_reserved_numeric = 1;
    }
    if (mana_reserved_numeric == 0 && mana == 1 && perc[0]) {
        mana_reserved_numeric = 1;
    }
    var life_reserved_percent = Math.round(life_reserved_numeric / life * 100);
    var mana_reserved_percent = Math.round(mana_reserved_numeric / mana * 100);
    $('#hp, #mana').removeClass('error');
    if (life - life_reserved_numeric <= 0) {
        $('#hp').addClass('error');
    }
    if (mana - mana_reserved_numeric < 0) {
        $('#mana').addClass('error');
    }
    $('#hp_f .total, #hp .total').html(
        life - life_reserved_numeric + '/' + life.toString()
    );
    $('#mana_f .total, #mana .total').html(
        mana - mana_reserved_numeric + '/' + mana.toString()
    );
    $('#hp_f .reserved, #hp .reserved').html(life_reserved_percent.toString());
    $('#mana_f .reserved, #mana .reserved').html(
        mana_reserved_percent.toString()
    );
    $('#guardian_armour').html(Math.round(life_reserved_numeric * 1.6));
    $('#guardian_es').html(Math.round(mana_reserved_numeric * 0.15));
    var aura_count = $('.aura .a.edited').length;
    $('.bla.edited').each(function() {
        aura_count += $('input[type=number]', $(this)).val() - 1;
    });
    $('#guardian_physreduction').html(aura_count);
    $('#guardian_liferegen').html((aura_count * 0.2).toFixed(1));
    $('#necromancer_speed').html(aura_count * 3);
    $('#hp div').css(
        'height',
        (life_reserved_percent > 100 ? 100 : life_reserved_percent) * 2
    );
    $('#mana div').css(
        'height',
        (mana_reserved_percent > 100 ? 100 : mana_reserved_percent) * 2
    );
    $('.total_mana')
        .parent()
        .show();
    if ($('.bms input:checked').length) {
        $('.total_mana')
            .parent()
            .hide();
        $('#mana div').css('height', 200);
        $('#mana_f .total, #mana .total').html('0/0');
        $('#mana_f .reserved, #mana .reserved').html('0');
    }
    $('.aura-grp').each(function() {
        var bm = $('.aura.bm', this).length;
        $('label.dim', this).removeClass('dim');
        $('*[data-reserved]', this).each(function() {
            if (
                (bm &&
                    life_reserved_percent +
                        $(this).data('reserved-calculated') >=
                        100) ||
                (!bm &&
                    mana_reserved_percent +
                        $(this).data('reserved-calculated') >
                        100)
            ) {
                $(this).addClass('dim');
            }
        });
        if (
            (bm &&
                life_reserved_percent +
                    $('.bla', this).data('reserved-calculated') >=
                    100) ||
            (!bm &&
                mana_reserved_percent +
                    $('.bla', this).data('reserved-calculated') >
                    100)
        ) {
            $('.bla', this).addClass('dim');
        }
        var tmp_life_reserved_numeric =
            Math.ceil(life * (perc[1] / 100)) +
            flat[1] +
            $('.cla', this).data('reserved-calculated');
        var tmp_mana_reserved_numeric =
            Math.ceil(mana * (perc[0] / 100)) +
            flat[0] +
            $('.cla', this).data('reserved-calculated');
        var tmp_life_reserved_percent = Math.round(
            tmp_life_reserved_numeric / life * 100
        );
        var tmp_mana_reserved_percent = Math.round(
            tmp_mana_reserved_numeric / mana * 100
        );
        if (
            (bm && tmp_life_reserved_percent >= 100) ||
            (!bm && tmp_mana_reserved_percent > 100)
        ) {
            $('.cla', this).addClass('dim');
        }
    });
    if (nohash != true) {
        var bin = '';
        var hash = [];
        $.each(settings_encode, function(i, v) {
            if ($('input[name=' + v[0] + ']').is('[type=checkbox]')) {
                bin += pad(
                    $('input[name=' + v[0] + ']').is(':checked') ? 1 : 0,
                    1
                );
            } else {
                var val = $('input[name=' + v[0] + ']').val();
                bin += pad((val ? parseInt(val) : 0).toString(2), v[1]);
            }
        });
        hash.push(alpha.encode(parseInt(bin, 2)));
        $('.aura-grp').each(function() {
            var hash_grp = [];
            var grp = $(this);
            $.each(new_auras_encode, function(x, aura) {
                var bin = '';
                for (i = 0; i <= aura.length - 1; i++) {
                    var v = aura[i];
                    if ($('.' + v[0] + ' input', grp).is('[type=checkbox]')) {
                        bin += pad(
                            $('.' + v[0] + ' input', grp).is(':checked')
                                ? 1
                                : 0,
                            1
                        );
                    } else {
                        var val = $('.' + v[0] + ' input', grp).val();
                        bin += pad((val ? parseInt(val) : 0).toString(2), v[1]);
                    }
                }
                hash_grp.push(alpha.encode(parseInt(bin, 2)));
            });
            hash.push(hash_grp.join('.'));
        });
        location.replace('#' + hash.join('/'));
    }
};
var activate_aura_group = function(grp) {
    $('input', grp).change(recalculate);
    $('input', grp).keyup(recalculate);
    $('.del', grp).click(function() {
        var section = $(this).parents('section');
        if (
            confirm(
                'Are you sure you want to delete: "' +
                    $('h3 span', section).html() +
                    '"?'
            )
        ) {
            section.remove();
            $('section.aura-grp h3 span').each(function(x) {
                $(this).html('Aura Group ' + (x + 1));
            });
            $('input[name=auras]').val($('.aura-grp').length);
            recalculate();
        }
    });
    $('.tog', grp).click(function() {
        $('.collapsible', $(this).parents('section')).slideToggle(200);
    });
};
var aura_group = '';
$().ready(function() {
    var hash = window.location.hash.substr(1).replace(/&amp;/g, '&');
    $("#skills input[name!='bms']").change(recalculate);
    $('#skills input').keyup(recalculate);
    $("#skills input[name='bms']").change(function() {
        recalculate();
        if ($(this).is(':checked')) {
            $(".mcs input[type='checkbox']").click();
        }
    });
    aura_group = $('#aura_1').html();
    activate_aura_group($('#aura_1'));
    $('a[rel=external]').attr('target', '_blank');
    $('#add').click(function() {
        var new_grp_id = $('.aura-grp').length + 1;
        $('.aura-grp:last').after(
            '<section id="aura_' +
                new_grp_id +
                '" class="row aura-grp">' +
                aura_group.replace(/\[1\]/g, '[' + new_grp_id + ']') +
                '</section>'
        );
        $('.aura-grp:last h3 span').html('Aura Group ' + new_grp_id.toString());
        $('input[name=auras]').val(new_grp_id);
        activate_aura_group($('.aura-grp:last'));
        recalculate();
        $(this).blur();
        return false;
    });
    $('#reset').click(function() {
        if (confirm('Are you sure you want to reset the entire form?')) {
            $('.aura-grp:gt(0)').remove();
            $('input[type=checkbox]').prop('checked', false);
            $('input[type=number]').each(function() {
                $(this).val(
                    $(this).data('default') == 0 ? '' : $(this).data('default')
                );
            });
            $('input[type=number][name=rms]').val('0');
            recalculate();
            location.replace('#');
        }
        $(this).blur();
        return false;
    });
    var loaded_from_url = false;
    if (hash.indexOf('&') !== -1) {
        var map = {};
        $.each(hash.split('&'), function() {
            var nv = this.split('='),
                n = decodeURIComponent(nv[0]),
                v = nv.length > 1 ? decodeURIComponent(nv[1]) : null;
            if (!(n in map)) {
                map[n] = [];
            }
            map[n].push(v);
        });
        var auras = parseInt(map['auras']);
        if (auras > 1) {
            for (var i = 0; i < auras - 1; i++) {
                $('#add').click();
            }
        } else {
            auras = 1;
        }
        $.each(map, function(n, v) {
            $("[name='" + n + "'][type=text]").val(
                v.toString().replace(/\+/g, ' ')
            );
            $("[name='" + n + "'][type=number]").val(parseInt(v));
            if ($("[name='" + n + "'][type=checkbox]").length) {
                $("[name='" + n + "'][type=checkbox]").prop('checked', true);
            }
        });
        loaded_from_url = true;
        recalculate();
    } else if (hash.length > 0) {
        data = hash.split('/');
        var bin = pad(alpha.decode(data[0]).toString(2), 65);
        var pos = 0;
        for (i = settings_encode.length - 1; i >= 0; i--) {
            pos += settings_encode[i][1];
            var bindata = parseInt(
                bin
                    .substr(pos * -1 ? pos * -1 : 0, settings_encode[i][1])
                    .toString(),
                2
            );
            if (
                $('input[name=' + settings_encode[i][0] + ']').is(
                    '[type=checkbox]'
                )
            ) {
                $('input[name=' + settings_encode[i][0] + ']').prop(
                    'checked',
                    bindata ? true : false
                );
            } else {
                $('input[name=' + settings_encode[i][0] + ']').val(bindata);
            }
        }
        auras = data.length - 1;
        for (a = 1; a <= auras; a++) {
            if (a != 1) {
                $('#add').click();
            }
            if (hash.indexOf('.') !== -1) {
                var aura_data = data[a].split('.');
                for (d = 0; d <= aura_data.length - 1; d++) {
                    var bin = pad(alpha.decode(aura_data[d]).toString(2), 65);
                    var pos = 0;
                    for (i = new_auras_encode[d].length - 1; i >= 0; i--) {
                        pos += new_auras_encode[d][i][1];
                        var bindata = parseInt(
                            bin
                                .substr(
                                    pos * -1 ? pos * -1 : 0,
                                    new_auras_encode[d][i][1]
                                )
                                .toString(),
                            2
                        );
                        if (
                            $(
                                '.' + new_auras_encode[d][i][0] + ' input',
                                '#aura_' + a
                            ).is('[type=checkbox]')
                        ) {
                            $(
                                '.' + new_auras_encode[d][i][0] + ' input',
                                '#aura_' + a
                            ).prop('checked', bindata ? true : false);
                        } else {
                            $(
                                '.' + new_auras_encode[d][i][0] + ' input',
                                '#aura_' + a
                            ).val(bindata);
                        }
                    }
                }
            } else {
                var bin = pad(alpha.decode(data[a]).toString(2), 65);
                var pos = 0;
                for (i = old_auras_encode.length - 1; i >= 0; i--) {
                    pos += old_auras_encode[i][1];
                    var bindata = parseInt(
                        bin
                            .substr(
                                pos * -1 ? pos * -1 : 0,
                                old_auras_encode[i][1]
                            )
                            .toString(),
                        2
                    );
                    if (
                        $(
                            '.' + old_auras_encode[i][0] + ' input',
                            '#aura_' + a
                        ).is('[type=checkbox]')
                    ) {
                        $(
                            '.' + old_auras_encode[i][0] + ' input',
                            '#aura_' + a
                        ).prop('checked', bindata ? true : false);
                    } else {
                        $(
                            '.' + old_auras_encode[i][0] + ' input',
                            '#aura_' + a
                        ).val(bindata);
                    }
                }
                if ($('.legacy', '#aura_' + a).val() != 0) {
                    $('.enlighten input', '#aura_' + a).val(0);
                    $('.legacy', '#aura_' + a).val(0);
                }
            }
        }
        loaded_from_url = true;
        recalculate();
    } else {
        recalculate(true);
    }
    if (loaded_from_url && $('.edited').length) {
        $('#viewing').show();
        $('.aura-grp label')
            .not('.edited')
            .parent()
            .hide();
        $('button')
            .not('#edit, .ascendancy')
            .hide();
        $('input[type=checkbox]')
            .hide()
            .prop('readonly', true)
            .prop('disabled', true);
        $('input[type=number]').prop('disabled', true);
        $('#edit').click(function() {
            $('#viewing').hide();
            $('.aura-grp label')
                .not('.edited')
                .parent()
                .show();
            $('button')
                .not('#edit, #aura_1 .del')
                .show();
            $('input[type=checkbox]')
                .show()
                .prop('readonly', false)
                .prop('disabled', false);
            $('input[type=number]').prop('disabled', false);
            recalculate();
        });
    }
    $('#info .tog').click(function() {
        $('.collapsible', $(this).parents('section')).slideToggle(200);
    });
});
