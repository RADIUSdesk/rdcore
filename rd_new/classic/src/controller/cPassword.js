Ext.define('Rd.controller.cPassword', {
    extend: 'Ext.app.Controller',
    actionIndex: function(data){
        var me = this;
        me.setUserData(data);
        
        if(!Ext.WindowManager.get('passwordWin')){
            var win = Ext.widget({
                xtype       : 'window',
                id          : 'passwordWin',
                title       : "Password manager",
                width       : 600,
                height      : 450,
                resizable   : true,
                iconCls     : 'rights',
                glyph: Rd.config.icnKey,
                animCollapse: false,
                border      : false,
                constrainHeader:true,
                layout      : 'border',
                stateful    : true,
                stateId     : 'passwordWin',
                items       : [
                    {
                        region  : 'center',
                        layout  : {
                            type    : 'hbox',
                            align   : 'stretch'
                        },
                        margins : '0 0 0 0',
                        border  : false,
                        items   : [ 
                            {
                                flex        : 1,
                                xtype       : 'frmPassword',
                                user_data   : data
                            }
                        ]
                    }
                ]
            });
            win.show();
        }else{
            me.updateUser();
        }
    },

    views:  [
        'password.frmPassword'
    ],
    stores: [],
    models: ['mPermanentUser'],
    selectedRecord: null,
    config: {
        urlGetPwd           : '/cake3/rd_cake/permanent-users/view-password.json',
        urlChangePassword   : '/cake3/rd_cake/permanent-users/change-password.json',
        userData            : undefined
    },
    refs: [
        {  ref: 'frmPassword',  selector:   'frmPassword'}       
               
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'frmPassword cmbPermanentUser': {
                change:     me.userChanged,
                render:     me.renderEventCmbPermanentUser
            },
            'frmPassword #always_active' : {
                change:  me.chkAlwaysActiveChange
            },
            'frmPassword #save': {
                click:       me.changePasswordSubmit
            }
        });
    },
    userChanged: function(cmb){
        var me      = this;
        var value   = cmb.getValue();
        var form    = cmb.up('form');
        var label   = form.down('#currentPwd');
        var from    = form.down('#from_date');
        var to      = form.down('#to_date');
        var chk     = form.down('checkbox');
        Ext.Ajax.request({
            url: me.getUrlGetPwd(),
            method: 'GET',
            params: {'user_id':value},
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    label.setValue(jsonData.value);
                    if((jsonData.activate == false)&&(jsonData.expire == false)){
                        chk.setValue(true);
                    }else{
                        to.setValue(jsonData.expire);
                        from.setValue(jsonData.activate);
                        chk.setValue(false);
                    }
                   // me.chkAlwaysActiveChange(chk); //Refresh the view
                    Ext.ux.Toaster.msg(
                        i18n('sFetched password'),
                        i18n('sPassword_fetched_for_selected_user'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                }   
            },
            scope: me
        });
    },
    changePasswordSubmit: function(button){
        var me      = this;
        var window  = button.up('window');
        var form    = button.up('form');
        var cmb     = form.down("cmbPermanentUser");
        var extra_params        = {};
        extra_params['user_id'] = cmb.getValue();

        window.setLoading(true);
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlChangePassword(),
            params              : extra_params,
            success             : function(form, action) {
                me.userChanged(cmb); //Force a reload of the new value
                window.setLoading(false);
                Ext.ux.Toaster.msg(
                    i18n('sPassword_changed'),
                    i18n('sPassword_changed_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    chkAlwaysActiveChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var from    = form.down('#from_date');
        var to      = form.down('#to_date');
        var value   = chk.getValue();
        if(value){
            to.setVisible(false);
            to.setDisabled(true);
            from.setVisible(false);
            from.setDisabled(true);
        }else{
            to.setVisible(true);
            to.setDisabled(false);
            from.setVisible(true);
            from.setDisabled(false);
        }
    },
    renderEventCmbPermanentUser : function(cmb){
        var me  = this;       
        if(me.getUserData() !== undefined){
            var ud      = me.getUserData();
            var rec     = Ext.create('Rd.model.mPermanentUser', ud);
            cmb.getStore().loadData([rec],false);
            cmb.setValue(ud.id);
        }
    },
    updateUser: function(){
        var me = this;
        me.getFrmPassword();
        var cmb = me.getFrmPassword().down('cmbPermanentUser');
        if(me.getUserData() !== undefined){
            var ud      = me.getUserData();
            var rec     = Ext.create('Rd.model.mPermanentUser', ud);
            cmb.getStore().loadData([rec],false);
            cmb.setValue(ud.id);
        }
    }
});
