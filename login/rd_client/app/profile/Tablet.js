Ext.define('AmpConf.profile.Tablet', {
    extend  : 'Ext.app.Profile',
    isActive    : function () {
        return !Ext.platformTags.phone;
    },
    launch  : function () {
        // Add a class to the body el to identify the phone profile so we can
        // override CSS styles easily. The framework adds x-phone so we could
        // use it but this way the app controls a class that is always present
        // when this profile isActive, regardless of the actual device type.
        Ext.getBody().addCls('tablet-profile');
    }
});
