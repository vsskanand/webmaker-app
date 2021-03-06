var transitionEndEventName = require('../../lib/transition-end-name')();
var Hammer = require('hammerjs');
var analytics = require('../../lib/analytics');

module.exports = {
    id: 'side-menu',
    ready: function () {
        var self = this;

        var hammer = new Hammer(self.$el, {
            /* jscs: disable */
            drag_min_distance:1,
            swipe_velocity:0.1
            /* jscs: enable */
        });

        self.$on('openSideMenu', function (event) {
            self.open();
            hammer.on('swipeleft', function () {
                self.close();
            });
        });

        self.$on('closeSideMenu', function (event) {
            self.close();
            hammer.off('swipeleft');
        });

        // Closing transition will be unseen if left position is immediately set
        // Wait for CSS transitions to end before putting the menu offscreen
        function onTransitionEnd(event) {
            self.transitionsInProgress--;
            if (!self.transitionsInProgress && !self.isOpen) {
                self.$el.classList.remove('open');
                self.$emit('menuFinishedClosing');
            }
        }
        self.$el.addEventListener(transitionEndEventName, onTransitionEnd);
    },
    detached: function () {
    },
    methods: {
        onDataClick: function (event) {
            event.preventDefault();
            this.$once('menuFinishedClosing', function () {
                this.$dispatch('sideMenuDataClick');
                analytics.event({category: 'Side Menu', action: 'Data Click'});
            });

            this.close();
        },
        onShareClick: function (event) {

            event.preventDefault();

            this.$once('menuFinishedClosing', function () {
                this.$dispatch('sideMenuShareClick');
                analytics.event({category: 'Side Menu', action: 'Share Click'});
            });

            this.close();
        },
        onDeleteClick: function (event) {
            event.preventDefault();
            this.$dispatch('sideMenuDeleteClick');
            analytics.event({category: 'Side Menu', action: 'Delete Click'});
            this.close(null, true);
        },
        onRootClick: function (event) {
            if (event && this.$el === event.target) {
                this.close();
            }
        },
        open: function () {
            this.isOpen = true;
            this.transitionsInProgress = 1;
            this.$el.classList.add('open');
            this.$el.classList.add('active');
            analytics.event({category: 'Side Menu', action: 'Open'});
        },
        close: function (event, keepShimOpen) {
            this.isOpen = false;
            this.transitionsInProgress = 1;
            this.$el.classList.remove('active');
            this.$dispatch('sideMenuClosed', {keepShimOpen: keepShimOpen});
            analytics.event({category: 'Side Menu', action: 'Close'});
        }
    },
    data: {
        transitionsInProgress: 0,
        isOpen: false
    },
    template: require('./index.html')
};
