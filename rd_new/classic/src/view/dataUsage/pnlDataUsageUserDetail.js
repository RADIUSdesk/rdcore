Ext.define('Rd.view.dataUsage.pnlDataUsageUserDetail', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlDataUsageUserDetail',
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
                xtype   : 'progressbar',
                itemId  : 'pbData',
                text    : '<i class="fa  fa-database"></i> Data Usage',
                height  : 20,
                margin  : 5,
                //cls     : 'wifired',
                value   : 1 
            },
            {
                xtype   : 'progressbar',
                itemId  : 'pbTime',
                text    : '<i class="fa fa-clock-o"></i> Time Usage',
                height  : 20,
                margin  : 5,
                width   : '100%',
                //cls     : 'wifigreen',
                value   : 0.5
            },
            {
                xtype    : 'container',
                itemId  : 'pnlInfo',
                layout  : 'fit',
                tpl     : new Ext.XTemplate(
                    "<div>",   
                        '<ul class="fa-ul">',    
                            "<tpl if='type == \"voucher\"'>",
                            "<li style='color:#3c6cb7;'><i class='fa-li fa  fa-ticket'></i> Voucher</li>",
                            "</tpl>",
                            "<tpl if='type == \"device\"'>",
                                "<li style='color:#3c6cb7;'><i class='fa-li fa  fa-tablet'></i>{mac}",
                                "<tpl if='(!Ext.isEmpty(vendor))'>",
                                    " <span style='color:#353535;'>({vendor})</span>",
                                "</tpl>",
                                "</li>",
                                "<li style='color:#238080;'><i class='fa-li fa fa-user'></i> {username}</li>",
                            "</tpl>",
                            "<li><i class='fa-li fa  fa-cubes'></i> {profile}</li>",  
                            "<li><i class='fa-li fa  fa-star'></i><b>Created</b> {created}</li>",
                            "<tpl if='type !== \"device\"'>",
                                '<tpl if="Ext.isDefined(last_reject_time)">', 
                                    "<li style='color:red;'><i class='fa-li fa fa-warning'></i> <b>Last Failed Login</b> {last_reject_time}</li>",
                                "</tpl>",
                                '<tpl if="Ext.isDefined(last_reject_message)">', 
                                    "<li style='color:red;'><i class='fa-li fa fa-warning'></i> <b>Failed Login Message</b> {last_reject_message}</li>",
                                "</tpl>",
                                '<tpl if="Ext.isDefined(last_accept_time)">', 
                                    "<li style='color:green;'><i class='fa-li fa fa-check-circle'></i> <b>Last Good Login</b> {last_accept_time}</li>",
                                "</tpl>",
                                '<tpl if="Ext.isDefined(data_cap)">', 
                                    "<li><i class='fa-li fa fa-database'></i> <b>Data Cap</b> {data_cap}</li>",
                                "</tpl>",
                                '<tpl if="Ext.isDefined(data_used)">', 
                                    "<li style='color:#3c6cb7;'><i class='fa-li fa fa-database'></i> <b>Data Used</b> {data_used}</li>",
                                "</tpl>",
                                '<tpl if="Ext.isDefined(time_cap)">', 
                                    "<li><i class='fa-li fa fa-clock-o'></i> <b>Time Cap</b> {time_cap}</li>",
                                "</tpl>",
                                '<tpl if="Ext.isDefined(time_used)">', 
                                    "<li style='color:#3c6cb7;'><i class='fa-li fa fa-clock-o'></i> <b>Time Used</b> {time_used}</li>",
                                "</tpl>",
                            "</tpl>",
                        '</ul>',
                        "<tpl if='type == \"device\"'>",
                            "<div style='text-align:center;color:white;background-color:coral;'><b>Recent Connections</b></div>",
                            '<ul style="list-style: none;padding-left:4px;">',
                            '<tpl for="device_history">',
                                "<li style='color:#238080;'><b>{nasname}</b> <span style='color:#353535;font-size:smaller;'>{last_seen_human}</span></li>",
                            '</tpl>',
                            '</ul>',
                        "</tpl>",
                    '</div>'
                )
            } 
        ]; 
        
        me.callParent(arguments);
    },
    paintUserDetail: function(user_detail){
    
        var me = this;    
        if(Ext.isDefined(user_detail.perc_data_used)){
        
            if(user_detail.perc_data_used < 70){
                var cls = "wifigreen";
                me.down('#pbData').toggleCls("wifiyellow",false);
                me.down('#pbData').toggleCls("wifired",false);
                me.down('#pbData').toggleCls(cls,true);     
            } 
            if(user_detail.perc_data_used >= 70 && user_detail.perc_data_used < 90){
                cls = "wifiyellow";
                me.down('#pbData').toggleCls("wifigreen",false);
                me.down('#pbData').toggleCls("wifired",false);
                me.down('#pbData').toggleCls(cls,true);   
            }
            if(user_detail.perc_data_used >= 90){
                cls = "wifired"
                me.down('#pbData').toggleCls("wifigreen",false);
                me.down('#pbData').toggleCls("wifiyellow",false);
                me.down('#pbData').toggleCls(cls,true);   
            }
            var str_data_usage = '<i class="fa  fa-database"></i>  Data Usage '+user_detail.perc_data_used+' %';
            var val_data_usage = user_detail.perc_data_used / 100;
            
            me.down('#pbData').show().setValue(val_data_usage).updateText(str_data_usage);
        }else{
            me.down('#pbData').hide()
        }
        
        if(Ext.isDefined(user_detail.perc_time_used)){
        
            if(user_detail.perc_time_used < 70){
                var cls = "wifigreen";
                me.down('#pbTime').toggleCls("wifiyellow",false);
                me.down('#pbTime').toggleCls("wifired",false);
                me.down('#pbTime').toggleCls(cls,true);     
            } 
            if(user_detail.perc_time_used >= 70 && user_detail.perc_time_used < 90){
                cls = "wifiyellow";
                me.down('#pbTime').toggleCls("wifigreen",false);
                me.down('#pbTime').toggleCls("wifired",false);
                me.down('#pbTime').toggleCls(cls,true);   
            }
            if(user_detail.perc_time_used >= 90){
                cls = "wifired"
                me.down('#pbTime').toggleCls("wifigreen",false);
                me.down('#pbTime').toggleCls("wifiyellow",false);
                me.down('#pbTime').toggleCls(cls,true);   
            }
            
            var str_time_usage = '<i class="fa fa-clock-o"></i> Time Usage '+user_detail.perc_time_used+' %';
            var val_time_usage = user_detail.perc_time_used / 100;  
         
            me.down('#pbTime').show().setValue(val_time_usage).updateText(str_time_usage);
        }else{
            me.down('#pbTime').hide()
        }
        
        me.down('#pnlInfo').setData(user_detail)
    
    }
});
