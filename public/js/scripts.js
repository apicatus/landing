$(function () {
    // Fixed nav after certain point
    $(window).scroll(function () {
        if ($(this).scrollTop() > 456) {
            $('#menu').addClass("f-nav");
            $('#statement').addClass("margin-top");
        } else {
            $('#menu').removeClass("f-nav");
            $('#statement').removeClass("margin-top");
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
            console.log("item: ", $(this).attr("href"))
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

        console.log("lastId: ", lastId, " id: ", id);

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

function toggleTalk(ev) {
    ev.preventDefault();
    var $speaker = $(ev.target).closest('.speaker_entity');
    var exp = "expanded_talk";
    var otherexp = "expanded_bio";

    var isExpanded = $speaker.hasClass(exp);

    if (isExpanded) {
        // hiding
        $speaker.removeClass(exp);

    } else {
        // showing
        $speaker.addClass(exp);

    }

    // hide other section if open
    if ($speaker.hasClass(otherexp)) {
        $speaker.removeClass(otherexp);

    };
    return false;
}

function toggleBio(ev) {
    ev.preventDefault();
    var $speaker = $(ev.target).closest('.speaker_entity');
    var exp = "expanded_bio";
    var otherexp = "expanded_talk";

    var isExpanded = $speaker.hasClass(exp);

    if (isExpanded) {
        // hiding
        $speaker.removeClass(exp);

    } else {
        // showing
        $speaker.addClass(exp);

    }

    // hide other section if open
    if ($speaker.hasClass(otherexp)) {
        $speaker.removeClass(otherexp);

    };
    return false;
}


$(document).on("click", ".expand_talk", toggleTalk);
$(document).on("click", ".expand_bio", toggleBio);
