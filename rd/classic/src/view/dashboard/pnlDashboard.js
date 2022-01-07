Ext.define('Rd.view.dashboard.pnlDashboard', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDashboard',
    layout  : 'fit',
    dashboard_data  : undefined,
    initComponent: function () {
        var me = this;
      
        var username =  me.dashboard_data.user.username;
        
        //Some initial values
        var header  = Rd.config.headerName;
        var lA      = Rd.config.levelAColor; 
      //  var stA     = 'color:'+lA+';font-weight:200; letter-spacing: 2px;';
        var stA     = 'color:'+lA+';font-weight:200; font-size: smaller;';
        //var tpl     = new Ext.XTemplate('<h1>'+header+'<span style="'+stA+'"> | <i class="fa">{fa_value}</i> {value}</span><h1>');
        var tpl     = new Ext.XTemplate('<h1>'+header+'<span style="'+stA+'"> | <span style="font-family:FontAwesome;">{fa_value}</span> {value}</span><h1>');
        
        var footer  = Rd.config.footerName;
        var style   = {}; //Empty Style
        var imgActive = false; //No Image
        var imgFile   = '';
        var fg      = false;
        if(me.dashboard_data.white_label.active == true){
            header  = me.dashboard_data.white_label.hName;
            footer  = me.dashboard_data.white_label.fName;
            
            var bg  = me.dashboard_data.white_label.hBg;
            style   = {
                'background' : bg
            };
            
            fg              = me.dashboard_data.white_label.hFg;
            var img         = me.dashboard_data.white_label.imgFile;
            if(me.dashboard_data.white_label.imgActive == true){
                imgActive = true;
            }
            var tpl = new Ext.XTemplate(
            '<tpl if="imgActive == true">',
                '<img src="{imgFile}" alt="Logo" style="float:left; padding-right: 20px;">',
            '</tpl>',
            '<h1 style="color:{hFg};font-weight:500;">{hName}<span style="'+stA+'"> | <span style="font-family:FontAwesome;">{fa_value}</span> {value}</span><h1>');
          //  '<h1 style="color:{hFg};font-weight:500;">{hName}<span style="'+stA+'"> | <i class="fa">{fa_value}</i> {value}</span><h1>');
            
        }
        
        var h1 = {
            xtype   : 'tbtext',
            itemId  : 'tbtHeader', 
            tpl     : tpl,
            data    : { hName:header,imgFile:img,hFg:fg,imgActive: imgActive}
        };
        var h2 = {
            glyph   : Rd.config.icnWizard,
            text    : 'Setup Wizard',
            ui      : 'button-green',
            itemId  : 'btnSetupWizard'
        };
        
        var h3 = {
            xtype   : 'button',
            glyph   : Rd.config.icnMenu,
            scale   : 'medium',
            menu    : [
                {   text:i18n('sLogout'),      glyph : Rd.config.icnPower,  itemId: 'mnuLogout'},'-',
                {   text:i18n('sSettings'),    glyph : Rd.config.icnSpanner,itemId: 'mnuSettings'},
                {   text:i18n('sPassword'),    glyph : Rd.config.icnLock,   itemId: 'mnuPassword'    }
            ] 
        };
        
        var h_items = [ h1,'->',h3 ];
        if(me.dashboard_data.show_wizard){
            h_items = [ h1,'->',h2,'|',h3 ];
        }
           
        me.dockedItems = [
            {
                xtype   : 'toolbar',
                dock    : 'bottom',
                ui      : 'footer', 
                items   : [
                    '<b><i class="fa fa-graduation-cap"></i> '+username+'</b>',
                    '->', 
                    '<b>'+footer+"</b> "+Rd.config.footerLicense
                ]
            },
            {
                xtype   : 'toolbar',
                dock    : 'top',
                ui      : 'default',
                style   : style,
                items   : h_items
            }
        ];    
        this.callParent();
    }
});


