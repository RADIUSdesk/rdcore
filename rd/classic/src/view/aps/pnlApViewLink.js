Ext.define('Rd.view.aps.pnlApViewLink', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlApViewLink',
    ap_id       : undefined,
    apName      : undefined,    
    controller  : 'vcApViewLink',
    requires    : [
        'Rd.view.aps.vcApViewLink',
        'Rd.view.aps.pnlApViewLinkInternet',
       // 'Rd.view.components.pnlInternetSpeedTest',
        'Rd.view.iperfTests.pnlIperfTests',
        'Rd.view.aps.pnlApViewLinkClients'
    ],
    initComponent: function() {
        var me      = this;
        me.setTitle('AP VIEW LINK');
        me.callParent(arguments);
    },    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function() {
        const me = this;   
        
        console.log("---Get info for--- "+me.ap_id);
        
              
        me.items = [
           /* {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'middle',
                    pack: 'center'
                },
                height: 80,
                cls: 'banner-container',
                defaults: {
                    xtype: 'button',
                    scale: 'large',
                    margin: '0 20 0 20',
                    ui: 'default-toolbar'
                },
                items: [
                    {
                        text: 'Internet',
                        iconCls: 'x-fa fa-globe',
                        handler: 'onInternetClick'
                    },
                    {
                        text        : 'Access Point',
                        iconCls     : 'x-fa fa-wifi',
                        handler     : 'onApClick'
                    },
                    {
                        text: 'Clients',
                        iconCls: 'x-fa fa-users',
                        handler: 'onClientsClick'
                    }
                ]
            },*/
            {
    xtype: 'container',
    layout: {
        type: 'hbox',
        align: 'middle',
        pack: 'center'
    },
    height: 70,
    cls: 'banner-c',
    items: [
        { xtype: 'box', flex: 1 },
        {
            xtype: 'box',
            itemId: 'lnkInternet',
            cls: 'banner-link',
            html: '<i class="x-fa fa-globe fa-2x"></i><br>Internet',
            listeners: {
                render: function(cmp) {
                    cmp.getEl().on('click', function() {
                        const parent = cmp.up('panel');
                        const controller = parent.getController();

                        parent.down('#lnkAccessPoint').removeCls('selected');
                        parent.down('#lnkClients').removeCls('selected');

                        // Add 'selected' class to this one
                        cmp.addCls('selected');

                        // Show the corresponding card
                        controller.showCard('cardInternet'); // or cardAccessPoint / cardClients
                    });

                }
            }
        },
        { xtype: 'box', width: 60, cls: 'connector-line' },
        {
            xtype: 'box',
            itemId: 'lnkAccessPoint',
            cls: 'banner-link selected',
            html: '<i class="x-fa fa-wifi fa-2x"></i><br>Access Point',
            listeners: {
                render: function(cmp) {                
                    cmp.getEl().on('click', function() {
                        const parent = cmp.up('panel');
                        const controller = parent.getController();                      
                        parent.down('#lnkInternet').removeCls('selected');
                        parent.down('#lnkClients').removeCls('selected');

                        // Add 'selected' class to this one
                        cmp.addCls('selected');

                        // Show the corresponding card
                        controller.showCard('cardAccessPoint'); // or cardAccessPoint / cardClients
                    });
                }
            }
        },
        { xtype: 'box', width: 60, cls: 'connector-line' },
        {
            xtype: 'box',
            itemId: 'lnkClients',
            cls: 'banner-link',
            html: '<i class="x-fa fa-tv fa-2x"></i><br>Clients',
            listeners: {
                render: function(cmp) {
                    cmp.getEl().on('click', function() {
                        const parent = cmp.up('panel');
                        const controller = parent.getController();

                        parent.down('#lnkInternet').removeCls('selected');
                        parent.down('#lnkAccessPoint').removeCls('selected');

                        // Add 'selected' class to this one
                        cmp.addCls('selected');

                        // Show the corresponding card
                        controller.showCard('cardClients'); // or cardAccessPoint / cardClients
                    });
                }
            }
        },
        { xtype: 'box', flex: 1 },
        {
            xtype       : 'button',
            scale       : 'large',
            margin      : 10,
            ui          : 'default-toolbar',
            text        : 'More Info',
            iconCls     : 'x-fa fa-plus',
            itemId      : 'btnMoreInfo'
        }
        
    ]
},

            {
                xtype       : 'container',
                itemId      : 'pnlCardHolder',
                layout      : 'card',
                flex        : 1,
                activeItem  : 1,  // Index of the item to show by default (0 = first, 1 = second, etc.)
                items: [ 
                    {
                        xtype   : 'pnlIperfTests',
                        dev_mode: 'ap',
                        dev_id  : me.ap_id,
                        itemId  : 'cardInternet'
                    },                 
                    {
                        xtype   : 'panel',
                        itemId  : 'cardAccessPoint',                       
                        tpl     : new Ext.XTemplate(
    // 1. Add a style block to handle the modern styling
    "<style>",
        ".modern-router-card {",
            "font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;",
            "border: 1px solid #e0e0e0;",
            "border-radius: 8px;",
            "background: #fff;",
            "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);",
            "overflow: hidden;", // Ensures child borders respect radius
            "max-width: 800px;", // Optional constraint
            "margin: 10px;",
        "}",
        ".modern-header {",
            "display: flex;",
            "align-items: center;",
            "background: #f8faff;", // Very subtle blue tint
            "padding: 20px;",
            "border-bottom: 1px solid #eee;",
        "}",
        ".modern-header img {",
            "width: 64px;", // Force consistent size
            "height: 64px;",
            "object-fit: contain;",
            "margin-right: 20px;",
        "}",
        ".modern-title {",
            "font-size: 24px;",
            "font-weight: 600;",
            "color: #1a202c;",
            "margin: 0;",
            "line-height: 1.2;",
        "}",
        ".modern-subtitle {",
            "font-size: 14px;",
            "color: #718096;",
            "margin-top: 4px;",
        "}",
        ".modern-section-header {",
            "background: #edf2f7;",
            "color: #4a5568;",
            "padding: 8px 20px;",
            "font-size: 12px;",
            "font-weight: 700;",
            "text-transform: uppercase;",
            "letter-spacing: 0.05em;",
            "border-bottom: 1px solid #e2e8f0;",
        "}",
        ".modern-body {",
            "padding: 20px;",
            "color: #2d3748;",
            "font-size: 14px;",
        "}",
        ".status-badge {",
            "display: inline-flex;",
            "align-items: center;",
            "padding: 4px 12px;",
            "border-radius: 9999px;",
            "font-weight: 600;",
            "font-size: 13px;",
            "margin-bottom: 15px;",
        "}",
        ".status-up { background-color: #def7ec; color: #03543f; }",
        ".status-down { background-color: #fde8e8; color: #9b1c1c; }",
        ".status-never { background-color: #e1effe; color: #1e429f; }",
        
        ".info-grid {",
            "display: grid;",
            "grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));", // Responsive columns
            "gap: 12px;",
            "margin-top: 15px;",
        "}",
        ".info-item {",
            "display: flex;",
            "align-items: flex-start;",
            "color: #4a5568;",
        "}",
        ".info-item i {",
            "width: 20px;",
            "color: #a0aec0;",
            "margin-top: 3px;", // Align icon with text
            "margin-right: 8px;",
            "text-align: center;",
        "}",
        ".info-item b { color: #2d3748; }",
        ".ssid-list { margin-top: 10px; border-top: 1px solid #edf2f7; padding-top: 10px; }",
        ".ssid-item { margin-bottom: 5px; }",
    "</style>",

    // 2. The Main Card Wrapper
    "<div class='modern-router-card'>",
        
        // 3. Modern Header (Flexbox)
        "<div class='modern-header'>",
            '<img src="/cake4/rd_cake/img/hardwares/{hw_photo}" alt="{hw_human}">',
            "<div>",
                "<div class='modern-title'>{name}</div>",
                "<div class='modern-subtitle'>{hw_human}</div>",
            "</div>",
        "</div>",

        // 4. Clean Section Header
        "<div class='modern-section-header'>Device Information (Past Hour)</div>",

        // 5. Body Content
        "<div class='modern-body'>",
            
            // Status Badge Logic
            "<tpl if='state == \"never\"'>",
                "<div class='status-badge status-never'><i class='fa fa-question-circle' style='margin-right:5px;'></i> Never connected</div>",
            "</tpl>",
            "<tpl if='state == \"down\"'>",
                "<div class='status-badge status-down'><i class='fa fa-exclamation-circle' style='margin-right:5px;'></i> Offline (Last seen {last_contact_human})</div>",
            "</tpl>",
            "<tpl if='state == \"up\"'>",
                "<div class='status-badge status-up'><i class='fa fa-check-circle' style='margin-right:5px;'></i> Online (Checked in {last_contact_human} ago)</div>",
            "</tpl>",

            // Info Grid (Two columns on wide screens)
            "<div class='info-grid'>",
                // Public IP
                "<div class='info-item'><i class='fa fa-globe'></i><div>Public IP: <b>{last_contact_from_ip}</b></div></div>",
                
                // Total Data
                "<div class='info-item'><i class='fa fa-database'></i><div>Total Data: <b>{data_past_hour}</b></div></div>",

                // LAN Info
                "<div class='info-item'><i class='fa fa-network-wired'></i><div>LAN IP: <b>{lan_ip}</b><br><span style='font-size:12px;color:#999;'>GW: {lan_gw} ({lan_proto})</span></div></div>",
                
                // Last Connection
                 "<div class='info-item'><i class='fa fa-link'></i><div>Last Client: <b>{newest_station}</b><br><span style='font-size:12px;color:#999;'>{newest_time} ({newest_vendor})</span></div></div>",
            "</div>",

            // SSID List (Separated for clarity)
            '<tpl if="ssids">',
                "<div class='ssid-list'>",
                    "<div style='font-size:12px; font-weight:bold; color:#a0aec0; margin-bottom:5px;'>ACTIVE SSIDS</div>",
                    '<tpl for="ssids">',
                        "<div class='info-item ssid-item'>",
                            "<i class='fa fa-wifi'></i>",
                            "<div><b>{name}</b> &nbsp; <span style='color:#718096;'>{users} users</span> &nbsp; <span style='color:#a0aec0; font-size:12px;'>({data})</span></div>",
                        "</div>",
                    "</tpl>", 
                "</div>",
            "</tpl>",

        "</div>", // End Body
    "</div>" // End Card
),                 
                        
                      /*  tpl     : new Ext.XTemplate(
                            "<div>",
                            '<div style="color: #29495b;background: linear-gradient(135deg, #e6f0ff, #cce0ff, #99ccff);box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);padding:5px;">',
                                '<img src="/cake4/rd_cake/img/hardwares/{hw_photo}" alt="{hw_human}" style="float: left; padding-right: 20px;">',
                                '<p style="font-size: 22px;font-weight:400;color:#29495b;">{name}</p>',
                                '<span>{hw_human}</span>',
                                '</div>',

                                 '<div style="background: linear-gradient(135deg, #d3d3d3, #a9a9a9, #808080);color: #29495b;box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);padding: 10px;font-size: 16px;">',        
                                    'DEVICE INFORMATION (for the past hour)',
                                '</div>',
                                "<div style='background-color:white;padding:5px;font-size:120%;color:#29495b;'>",    
                                    "<tpl if='state == \"never\"'>",
                                    "<div style='color:blue;margin:10px;'><i class='fa fa-question-circle'></i>  Never connected before</div>",
                                    "</tpl>",
                                    "<tpl if='state == \"down\"'>",
                                    "<div style='color:red;margin:10px;'><i class='fa fa-exclamation-circle'></i>  Offline (last check-in <b>{last_contact_human}</b>).</div>",
                                    "</tpl>",
                                    "<tpl if='state == \"up\"'>",
                                    '<div style="color:green;margin:10px;"><i class="fa fa-check-circle"></i>  Online (last check-in <b>{last_contact_human}</b> ago).</div>',
                                    "</tpl>",
                                    '<div style="margin:10px;"><i class="fa fa-info-circle"></i>  Public IP <b>{last_contact_from_ip}</b>.</div>',
                                    '<tpl for="ssids">',
                                        '<div style="margin:10px;"><i class="fa fa-wifi"></i>  <b>{name}</b> had <b>{users}</b> users. (Data used: {data}.)</div>',
                                    '</tpl>', 
                                    '<div style="margin:10px;"><i class="fa fa-database"></i>  Total data usage <b>{data_past_hour}</b>.</div>',                                                                                     
                                    '<div style="margin:10px;"><i class="fa fa-link"></i>  Last connection from <b>{newest_station}</b> which was <b>{newest_time}</b> ({newest_vendor}).</div>',
                                     "<div style='color:blue;margin:10px;'><i class='fa fa-info-circle'></i>  LAN IP: {lan_ip} LAN Gateway: {lan_gw}  ({lan_proto}) </div>",
                                "</div>",
                                "</div>"
                            ),*/
                        data    : {},    
                       // padding : 20
                    },                  
                    {
                        xtype   : 'panel',
                        itemId  : 'cardClients',
                        apId    : me.ap_id,
                        xtype   : 'pnlApViewLinkClients'
                    }
                ]
            }
        ];
        
        this.callParent(arguments);
    }
});
