(function($, undefined) {
    kendo.data.binders.srcPath = kendo.data.Binder.extend( {
        refresh: function() {
            var value = this.bindings["srcPath"].get();

            if (value) {
                $(this.element).attr("src", "content/images/200/" + value);
            }
        }
    });

    kendo.data.binders.format = kendo.data.Binder.extend( {
        refresh: function() {
            var value = this.bindings["format"].get();

            if (value) {
                $(this.element).text(kendo.toString(value, "c"));
            }
        }
    });

    kendo.data.binders.innerText = kendo.data.Binder.extend( {
        refresh: function() {
            var value = this.bindings["innerText"].get();

            if (value) {
                $(this.element).text("Item added to cart " + value + " times.");
            }
        }
    });

    var app;
    var schema = {
        model: {
            fields: {
                id: {},
                name: {},
                price: {},
                image: {},
                category: {},
                description: {},
                featured: {},
                ordered: {}
            }
        }
    };
    var ds = kendo.data.DataSource.create({
        schema: schema,
        transport: { read: { url: "content/menu.json", dataType: "json" } }
    });

    //home view model
    var homeViewModel = kendo.observable({
        featured: [],
        addToCart: addToCart,
        init: function() {
            var that = this;

            ds.one("change", function() {
                that.set("featured", this.view());
            })
            .filter({ field: "featured", operator: "eq", value: true});
        }
    });

    //menu view model
    var menuViewModel = kendo.observable({
        all: new kendo.data.DataSource({
            group: "category"
        }),
        addToCart: addToCart,
        init: function() {
            var that = this;
            ds.one("change", function() {
                that.all.data(this.data());
            }).fetch();
        }
    });

    function addToCart(e) {
        var item = e.data,
            ordered = item.get("ordered") || 0;

        ordered += 1;

        item.set("ordered", ordered);

        if (ordered === 1) {
            cartViewModel.added.add(item);
        }

        e.preventDefault();
    }

    //cart view model
    var cartViewModel = kendo.observable({
        added: new kendo.data.DataSource(),
        removeItem: function(e) {
            var item = e.data;

            item.set("ordered", 0);
            this.added.remove(item);

            app.view.scroller.reset();
            e.preventDefault();
        },
        checkout: function() {
            var dataSource = this.added,
                items = dataSource.data(),
                length = items.length,
                idx = 0;

            setTimeout(function () {
                for (; idx < length; idx++) {
                    items[0].set("ordered", 0);
                }

                dataSource.data([])
            }, 400);
        },
        showCheckout: function() {
            var button = $("#checkout");

            if (this.added.data()[0]) {
                button.show();
            } else {
                button.hide();
            }
        }
    });

    //detail view model
    var detailViewModel = kendo.observable({
        currentItem: null,
        addToCart: function(e) {
            var item = this.currentItem,
                ordered = item.get("ordered") || 0;

            ordered += 1;

            item.set("ordered", ordered);

            if (ordered === 1) {
                cartViewModel.added.add(item);
            }

            e.preventDefault();
        },
        showLabel: function() {
            return this.get("currentItem") && this.get("currentItem").get("ordered") > 0;
        }
    });

    function initHomeView() {
        homeViewModel.init();
    }

    function initMenuView() {
        menuViewModel.init();
    }

    function showCartView() {
        cartViewModel.showCheckout();
    }

    function showDetailsView(e) {
        var view = e.view;

        ds.fetch(function() {
            var model = view.model,
                item = ds.get(view.params.id);

            model.set("currentItem", item);
        });
    }

    $.extend(window, {
        homeViewModel: homeViewModel,
        menuViewModel: menuViewModel,
        cartViewModel: cartViewModel,
        detailViewModel: detailViewModel,
        initHomeView: initHomeView,
        initMenuView: initMenuView,
        showCartView: showCartView,
        showDetailsView: showDetailsView
    });
})(jQuery);
