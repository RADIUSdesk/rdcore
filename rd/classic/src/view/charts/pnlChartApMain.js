Ext.define('Rd.view.charts.pnlChartApMain', {
    extend      : 'Ext.panel.Panel',
    xtype       : 'pnlChartApMain',
    layout: {
        type    : 'hbox',
        pack    : 'start',
        align   : 'stretch'
    },
    defaults: {
        frame: false,
        bodyPadding: 10
    },
    requires    : [
        'Rd.view.charts.pnlChartBase',
        'Rd.view.charts.pnlChartApData',
        'Rd.view.charts.pnlChartApUsers'
    ],
    url : '/cake3/rd_cake/ap-reports/view_overview.json',
    apId: '',
    initComponent: function(){
        var me = this;
        
        me.items= [
            {
                flex        : 1,
                margin      : '0 10 0 0',
                frame       : false,
                border      : false,
                layout      : 'fit',
                title       : 'Hardware',
                ui          : 'light',
                glyph       : Rd.config.icnGears,
                itemId      : 'pnlOverview',
                //bodyStyle   : {backgroundColor : 'red' },
                tpl         : new Ext.XTemplate(
                    '<div style="color:grey;  background-color:white; padding:5px;">',
                    '<img src="resources/images/MESHdesk/{img}.png" alt="dragino" height="72" style="float: left; padding-right: 20px;">',
                    '<h2>{name}</h2>',
                    '<span>{model}</span>',
                    '</div>',
                    "<div class='twoColumnContainer'>",
                        '<tpl for="components">', 
                            "<div class='twoColumnItem'>",
                                '<div class="sectionHeader">',
                                    '<h2>{name}</h2>',
                                 '</div>',
                                 '<ul class="fa-ul">',
                                    '<tpl for="items">',
                                        '<tpl if="style == \'rdOk\'">',
                                            "<li style='color:green;'><i class='fa-li fa  fa-check-circle'></i>",
                                            "{description} <b>{value}</b>.</li>",
                                        "</tpl>",
                                        '<tpl if="style == \'rdWarn\'">',
                                            "<li style='color:red;'><i class='fa-li fa  fa-exclamation-circle'></i>",
                                            "{description} <b>{value}</b>.</li>",
                                        "</tpl>",
                                        '<tpl if="style == \'rdInfo\'">',
                                            "<li><i class='fa-li fa fa-arrow-circle-right'></i>",
                                            "{description} <b>{value}</b>.</li>",
                                        "</tpl>",
                                    '</tpl>',
                                '</ul>',
                            "</div>",    
                        '</tpl>',
                    "</div>"
                ),
                tools:[
                    {
                        type:'refresh',
                        tooltip: 'Refresh',
                        handler: function(event, toolEl, panelHeader) {
                            me.refresh();
                        }
                    }   
                ]
            },     
            {
                flex        : 1,
                frame       : false,
                border      : false,
                xtype       : 'panel',
              //  layout      : 'accordion',
                layout: {
                    type    : 'vbox',
                    pack    : 'start',
                    align   : 'stretch'
                },
                items       : [
                    {
                        title   : i18n("sData_Usage"),
                        glyph   : Rd.config.icnData,
                        margins : '0 0 0 0',
                        plain   : false,
                        border  : false,  
                     //z   xtype   : 'pnlChartApData',
                        apId    : me.apId,
                        flex    : 1
                    },
                    {
                        title   : i18n("sUsers_Connected"),
                        glyph   : Rd.config.icnUser,
                        margins : '0 0 0 0',
                        plain   : true,
                     //   xtype   : 'pnlChartApUsers',
                        apId    : me.apId,
                        flex    : 1  
                    }
                ]
            }
        ];  
        
        me.fetchData();
        me.callParent(arguments); 
        
    },
    refresh: function(){
        var me = this; 
        me.down('#pnlOverview').setLoading(true);
        me.fetchData(); 
    },
    fetchData: function(){
        var me = this; 
        Ext.Ajax.request({
            url     : me.url,
            method  : 'GET',
            params  : {
				ap_id   : me.apId
			},
            success : 'dataToGui',
            scope   : me
        });  
    },
    
    dataToGui: function(response){
        var me          = this;
        var jsonData    = Ext.JSON.decode(response.responseText);
        me.down('#pnlOverview').setLoading(false); 
        if(jsonData.success == true){
            me.down('#pnlOverview').setData(jsonData.data);
        }
    }
});
