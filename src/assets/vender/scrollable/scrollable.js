;
(function () {
    const scrollable = $('.scrollable');
    const handleCompareWidth = (p) => {
        const children = p.children().eq(0);
        const parent_width = p.innerWidth();
        const children_width = children.innerWidth();
        return children_width > parent_width;
    }
    const handleCompareArea = (p) => {
        const {
            scrollY,
            innerHeight
        } = window;
        const {
            top
        } = p.offset();
        const bottom = p.innerHeight();
        return (top < scrollY + innerHeight && top + bottom > scrollY);
    }
    const handleScrollable = () => {
        scrollable.map((a, b) => {
            const _ = $(b);
            _.append(`
            <div class="scrollable_inner">
            <div class="scrollable_icon">
            <div class="scrollable_icon_hand"></div>
            <p class="scrollable_txt">スクロールできます</p>
            </div>
            </div>`);
            _.attr('data-swpipe', '1');
        });
        scrollable.on('scroll', function () {
            let _ = $(this);
            const scrollable_inner = _.find('.scrollable_inner');
            if (scrollable_inner.hasClass('is_displayed')) {
                scrollable_inner.removeClass('is_displayed');
                if (_.attr('data-swpipe') == '1') {
                    _.attr('data-swpipe', '0')
                    _.find('.scrollable_inner').css({
                        opacity: 0
                    });
                    setTimeout(function () {
                        _.find('.scrollable_inner').remove();
                    }, 300);
                }
            }
        });
    }
    const handleScrollableScroll = () => {
        scrollable.map((a, b) => {
            const _ = $(b);
            const inside_area = handleCompareArea(_);
            if (inside_area) {
                if (_.find('.scrollable_inner').hasClass('is_displayed')) {
                    _.find('.scrollable_icon_hand').addClass('is_show');
                }
            }
        })
    }
    const handleScrollableResize = () => {
        scrollable.map((a, b) => {
            const _ = $(b);
            const check = handleCompareWidth(_);
            const scrollable_inner = _.find('.scrollable_inner');
            const scrollable_icon_hand = _.find('.scrollable_icon_hand');
            if (check) {
                scrollable_inner.addClass('is_displayed');
                const inside_area = handleCompareArea(_);
                if (inside_area) {
                    scrollable_icon_hand.addClass('is_show');
                }
            } else {
                scrollable_inner.removeClass('is_displayed');
                scrollable_icon_hand.removeClass('is_show');
            }
        });
    }
    $(window).on('load', function () {
        handleScrollable();
        handleScrollableScroll();
    });
    $(window).on('scroll', function () {
        handleScrollableScroll();
    });
    $(window).on('load resize', function () {
        handleScrollableResize();
    });
})();