Ext.define('Rd.view.login.pnlLogin', {  
    extend      : 'Ext.panel.Panel',
    border      : false,
    autoCreate  : false,
    xtype       : 'pnlLogin',
    layout      : 'fit',
    requires    : ['Rd.view.components.compWallpaper'],
    url         : null,   //Placheholder for wallpaper URL     
    initComponent: function () {
        var me      = this;
/*
{
    "success": true,
    "data": {
        "active": true,
        "hName": "RADIUSdesk",
        "hBg": "#ffffff",
        "hFg": "#005691",
        "fName": "RADIUSdesk",
        "imgActive": true,
        "imgFile": "\/cake4\/rd_cake\/img\/access_providers\/logo.png",
        "wallpaper": "\/cake4\/rd_cake\/img\/wallpapers\/1.jpg"
    }
}
*/
        
        me.items    = [{'xtype' : 'compWallpaper','url' : me.wallpaper}];
        var lA      = '#005691'; 
        var tpl = new Ext.XTemplate(
            '<tpl if="imgActive == true">',
                '<img src="{imgFile}" alt="Logo" style="float:left; padding-right: 10px; padding-left: 10px;padding: 10px;">',
            '</tpl>',
            '<h1 style="color:{hFg};font-weight:100;padding-top: 10px;">{hName}<h1>');          

        var bg  = me.hBg;
        style   = {
            'background' : bg
        }; 
              
        var txtH = {
            xtype   : 'tbtext',
            tpl     : tpl,
            data    : { 
                hName   :me.hName,
                imgFile :me.imgFile,
                hFg     :me.hFg,
                imgActive: me.imgActive
            }
        };

        var txtF = {
            xtype   : 'tbtext',
            tpl     : new Ext.XTemplate(
            '<div style="margin:5px">',
                '<span style="color:'+me.hFg+';letter-spacing:5px;font-size:larger;">'+me.fName+'</span>',
            '</div>'
            ),
            data    : {}
        };
       
        var h_items = [txtH];
        var f_items = ['->',txtF];
        me.dockedItems = [
		    {
		        xtype   : 'toolbar',
		        height	: 70,
		        dock    : 'top',
		        ui      : 'default',
		        items   : h_items,
                style   : style
		    },
            {
		        xtype   : 'toolbar',
		        height	: 40,
		        dock    : 'bottom',
		        ui      : 'default',
		        items   : f_items,
                style   : style
		    }
		];
     
        me.add(me.loginWindow());
        me.callParent(arguments);
    },
    loginWindow: function(){
        var me = this;
        var win = Ext.create('Ext.panel.Panel', {
            layout  : "fit",
            width   : 350,
            bodyStyle   : 'background: rgba(90, 138, 184, 0.80);', 
            cls     : 'custom-rounded-panel',
            height  : 350,
            itemId  : 'winLogin',
            floating: true,
            border  : false,
            shadow  : false,
            items   : [ {
                    xtype       : 'form',
                    bodyStyle   : 'background: transparent;', 
                    border      : false,
                    layout      : 'anchor',
                    height      : '100%',
                    bodyPadding : 20,
                    fieldDefaults: {
                        msgTarget       : 'under',
                        labelAlign      : 'top',
                        anchor          : '100%',
                        labelSeparator  : '',
                        labelClsExtra   : 'lblRd',
                        padding         : 10
                    },
                    defaultType : 'textfield',
                    items: [
                        {
                            xtype       : 'component',
                            html        : 'System Login',
                            cls         : 'login-heading',
                            margin      : '10 0 10 0'
                        },
                        {
                            xtype       : 'component',
                            html        : 'Enter your credentials',
                            cls         : 'login-heading',
                            style: {
                                'font-size': '16px',
                                'color' : '#ebeff2',
                                'font-weight' : 100
                            },
                            margin      : '5 0 20 0'
                        },
                        {
                            itemId      : 'inpUsername',
                            name        : "username",
                            emptyText   : '👤 Username',
                            allowBlank  : false,
                            blankText   : 'Enter your username'
                        },
                        {
                            itemId      : 'inpPassword',                            
                            name        : 'password',
                            emptyText   : '🔒 Password',
                            inputType   : 'password',
                            allowBlank  : false,
                            blankText   : i18n('sEnter_password')
                        },
                        {
                            text        : 'Sign In' ,
                            xtype       : 'button',
                            action      : 'ok',
                            ui          : 'button-teal',
                            type        : 'submit',
                            formBind    : true,
                            scale       : 'medium',
                            width       : 290,
                            margin      : '10 0 10 10'
                        }
                    ]
                }]
        }).show();
    }
});
