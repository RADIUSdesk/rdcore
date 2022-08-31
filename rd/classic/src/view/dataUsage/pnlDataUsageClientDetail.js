Ext.define('Rd.view.dataUsage.pnlDataUsageClientDetail', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlDataUsageClientDetail',
    scrollable  : true,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    border      : true,
    ui          : 'light',
    initComponent: function() {
        var me      = this;
        
        me.items = [
            {
                xtype   : 'panel',
                itemId  : 'pnlInfo',
                height  : 150,
                tpl     : new Ext.XTemplate(
                    '<div>',   
                        '<ul class="fa-ul">',    
                            "<li><i class='fa-li fa  fa-star'></i><b>Created</b> {created}</li>",
                            '<tpl if="Ext.isDefined(last_contact)">', 
                                "<li style='color:green;'><i class='fa-li fa fa-check-circle'></i> <b>Last Seen</b> {last_contact}</li>",
                            "</tpl>",
                            '<tpl if="data_limit_active==true">', 
                                "<li style='color:#b30000;'><i class='fa-li fa fa-database'></i> <b>Data Cap</b> {data_cap}</li>",
                                "<li style='color:#0066cc;'><i class='fa-li fa fa-database'></i> <b>Data Used</b> {data_used}</li>",
                                "<li><i class='fa-li fa fa-heart'></i> <b>% Used</b> {perc_data_used}</li>",
                                "<li style='color:#b3b3cc;'><i class='fa-li fa fa-calendar'></i> <b>Reset On</b> {data_limit_reset_on}</li>",
                                "<li style='color:#b3b3cc;'><i class='fa-li fa fa-hourglass-start'></i> <b>Reset Hour</b> {data_limit_reset_hour}</li>",
                                "<li style='color:#b3b3cc;'><i class='fa-li fa fa-hourglass-start'></i> <b>Reset Minute</b> {data_limit_reset_minute}</li>",
                            "</tpl>",
                        '</ul>',
                    '</div>'
                )
            } 
        ]; 
        
        me.callParent(arguments);
    },
    paintClientDetail: function(client_detail){
        var me = this;
        me.down('#pnlInfo').setData(client_detail);
    }
});
