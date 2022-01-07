Ext.define('Rd.view.logViewer.pnlViewFile', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlViewFile',
    html    : '',
    autoScroll : true,
    border  : '5 5 5 5',
    bodyCls : 'fileViewer',
    tbar: [
        { xtype: 'buttongroup', title: i18n('sAction'), items : [ 
            { xtype: 'button',  glyph: Rd.config.icnClear,scale: 'large', itemId: 'clear',    tooltip:    i18n('sClear_screen')   }
            
        ]},
        { xtype: 'buttongroup', title: i18n('sStart_fs_Stop'), width:200, items : [ 
            { xtype: 'button',  glyph: Rd.config.icnStart, scale: 'large', itemId: 'start',    tooltip:    i18n('sStart_FreeRADIUS'),
                toggleGroup     : 'start_stop',
                enableToggle    : true,
                pressed         : true

            },
            { xtype: 'button',  glyph: Rd.config.icnStop,  scale: 'large', itemId: 'stop',     tooltip:    i18n('sStop_FreeRADIUS'),
                toggleGroup     : 'start_stop',
                enableToggle    : true,
                pressed         : false
            },
            { xtype: 'button',  glyph: Rd.config.icnInfo,  scale: 'large', itemId: 'info',     tooltip:    i18n('sFreeRADIUS_info')}
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

