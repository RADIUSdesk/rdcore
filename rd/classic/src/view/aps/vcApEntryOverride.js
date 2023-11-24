Ext.define('Rd.view.aps.vcApEntryOverride', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcApEntryOverride',
    config : {
        UrlApStaticOverrides        : '/cake4/rd_cake/ap-profiles/ap-static-entry-overrides-view.json'
    },
    init: function() {
        var me = this;
    },
    control: {
        '#btnPickGroup': {
             //click: 'btnPickGroupClick'
        },
        '#chkEnableSchedules' : {
            //change:  'chkEnableSchedulesChange'
        }
    }
});
