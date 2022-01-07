Ext.define('AmpConf.util.State', {

    singleton: true,

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
});
