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
    
        var win = Ext.create('Ext.panel.Panel', {
            layout  : "fit",
            width   : 300,
            title   : 'Dashboard Login',
            glyph   : Rd.config.icnLock,
            height  : 270,
            itemId  : 'winLogin',
            floating: true,
            border  : false,
            shadow  : false,
            items   : [ {
                    xtype       : 'form',
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
                        padding         : 6
                    },
                    defaultType : 'textfield',
                    items: [
                        {
                            itemId      : 'inpUsername',
                            name        : "username",
                          //  fieldLabel  : 'Email',
                            emptyText   : 'Email',
                            allowBlank  : false,
                            blankText   : 'Enter Your Email'
                        },
                        {
                            itemId      : 'inpPassword',                            
                            name        : 'password',
                          //  fieldLabel  : i18n('sPassword'),
                            emptyText   : 'Password',
                            inputType   : 'password',
                            allowBlank  : false,
                            blankText   : i18n('sEnter_password')
                        },
						/*{
							xtype: 'container',
							layout: 'hbox',
							items: [
								{
									xtype: 'box',
									flex : 1,
									height: 30,
									html: '  ' // TODO '<a href="#passwordreset" > Forgot Password ?</a>'
								},
								{
									xtype: 'box',
									html: '<a href="#register/nr" ><b> Register </b></a>'
								}
							]
						}*/
                    ],
                    dockedItems: [{
                        xtype   : 'toolbar',
                        dock    : 'bottom',
                        ui      : 'footer',
                        padding : 0,
                        items: [ '->',
                            {
                                text    : i18n('sOK'),
                                margin  : Rd.config.buttonMargin,
                                action  : 'ok',
                                ui      : 'button-teal',
                                type    : 'submit',
                                formBind: true,
                                scale   : 'large',
                                glyph   : Rd.config.icnYes
                            }  
                        ]
                    }]
                }]
        }).show();
    }
});
