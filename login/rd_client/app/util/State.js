Ext.define('AmpConf.util.State', {

    singleton: true,
    
//HEADUP FIXME So for the auto captive potal we could not use localstorage on the light browser
//We then had to use the cookie sotrage... so here you can comment out one or the other to swap between them...
//Later we'll make it more elequinet    
    
/*
    requires: [
        'Ext.util.Cookies'
    ],

    get: function(key, defaultValue) {
        var value = Ext.util.Cookies.get(key);
        return value === undefined? defaultValue : Ext.decode(value);
    },

    set: function(key, value) {
        if (value == null) {    // !== undefined && !== null
            Ext.util.Cookies.clear(key);
        } else {
            Ext.util.Cookies.set(key, Ext.encode(value));
        }
    },

    clear: function(key) {
        Ext.util.Cookies.set(key, null);
    }
    
*/
    
    requires: [
        'Ext.util.LocalStorage'
    ],

    store: new Ext.util.LocalStorage({
        id: 'app-state'
    }),

    get: function(key, defaultValue) {
        var value = this.store.getItem(key);
        return value === undefined? defaultValue : Ext.decode(value);
    },

    set: function(key, value) {
        if (value == null) {    // !== undefined && !== null
            this.store.removeItem(key);
        } else {
            this.store.setItem(key, Ext.encode(value));
        }
    },

    clear: function(key) {
        this.set(key, null);
    }
        
});
