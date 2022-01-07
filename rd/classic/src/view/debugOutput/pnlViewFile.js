Ext.define('Rd.view.logViewer.pnlViewFile', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlViewDebug',
    html    : '',
    autoScroll : true,
    autoCreate: true,
    border  : '5 5 5 5',
    bodyCls : 'fileViewer',
    tbar: [
        { xtype: 'buttongroup', title: i18n('sAction'), items : [ 
            { xtype: 'button',  iconCls: 'b-clear', glyph: Rd.config.icnClear,    scale: 'large', itemId: 'clear',    tooltip:    i18n('sClear_screen')   }
            
        ]},
        { xtype: 'buttongroup', title: i18n('sStart_fs_Stop'), items : [ 
            { xtype: 'button',  iconCls: 'b-start', glyph: Rd.config.icnStart,    scale: 'large', itemId: 'start',    tooltip:    i18n('sStart_FreeRADIUS'),
                toggleGroup     : 'start_stop',
                enableToggle    : true,
                pressed         : true

            },
            { xtype: 'button',  iconCls: 'b-stop', glyph: Rd.config.icnStop,     scale: 'large', itemId: 'stop',     tooltip:    i18n('sStop_FreeRADIUS'),
                toggleGroup     : 'start_stop',
                enableToggle    : true,
                pressed         : false
            },
            { xtype: 'button',  iconCls: 'b-btn_info', glyph: Rd.config.icnInfo, scale: 'large', itemId: 'info',     tooltip:    i18n('sFreeRADIUS_info')}
        ]}
    ],
    bbar: [
        {   xtype: 'component', itemId: 'feedback',  tpl: '{message}',   style: 'margin-right:5px', cls: 'lblYfi'  }
    ],
    initComponent: function(){
        var me = this;
        //We need to souce the socket library
        
        
        me.callParent(arguments);
    }
});

