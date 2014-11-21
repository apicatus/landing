$(function () {
    // Fixed nav after certain point
    $(window).scroll(function () {
        var scale = (Math.abs(scroll) / 1000) < 3 ? (Math.abs(scroll) / 1000) : 1;
        var scroll = $(this).scrollTop();

        if (scroll > 456) {
            $('#menu').addClass("f-nav");
        } else {
            $('#menu').removeClass("f-nav");
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

    // Animated Scroll
    $('a[href*=#]:not([href=#])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    // Cache selectors
    var lastId,
        topMenu = $("#menu"),
        topMenuHeight = topMenu.outerHeight() + 15,
        // All list items
        menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function () {
            var item = $($(this).attr("href"));
            if (item.length) {
                return item;
            }
        });

    // Bind to scroll
    $(window).scroll(function () {
        // Get container scroll position
        var fromTop = $(this).scrollTop() + topMenuHeight;

        // Get id of current scroll item
        var cur = scrollItems.map(function () {
            if ($(this).offset().top < fromTop) {
                return this;
            }
        });

        // Get the id of the current element
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";

        if (lastId !== id) {
            lastId = id;
            // Set/remove active class
            menuItems
                .parent()
                .removeClass("active")
                .end()
                .filter("[href=#" + id + "]")
                .parent()
                .addClass("active");
        }
    });

    $(".nav-btn").click(function () {
        $('#menu .block > input[type=checkbox]').removeAttr('checked');
    });

});
