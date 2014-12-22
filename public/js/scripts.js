$(function () {

    // Fixed nav after certain point
    $(window).scroll(function () {
        var scale = (Math.abs(scroll) / 1000) < 3 ? (Math.abs(scroll) / 1000) : 1;
        var scroll = $(this).scrollTop();

        if (scroll > 456) {
            $('nav.menu:not(.simple)').addClass("f-nav");
        } else {
            $('nav.menu:not(.simple)').removeClass("f-nav");
        }
        if (scroll < 0) {
            $('.icon32').css({
                '-webkit-transform': 'scale(' + (1 + scale) + ')',
                'transform': 'scale(' + (1 + scale) + ')'
            })
        } else {
            $('.icon32').css({
                '-webkit-transform': 'scale(1)',
                'transform': 'scale(1)'
            })
        }
    });

    $(".nav-btn").click(function () {
        console.log("clickky!")
        $('nav.menu > input[type=checkbox]').removeAttr('checked');
    });
});
