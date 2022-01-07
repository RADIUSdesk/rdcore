Ext.define('Rd.controller.cLogViewer', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }     
        pnl.add([{
            xtype: 'panel',
            tbar: [
            { xtype: 'buttongroup', title: i18n('sAction'), items : [ 
                { 
                    xtype: 'button',  
                    glyph: Rd.config.icnClear,
                    scale: 'large', 
                    itemId: 'clear',    
                    tooltip:    i18n('sClear_screen')   
                }
                
                ]},
                { xtype: 'buttongroup', title: i18n('sStart_fs_Stop'), width:200, items : [ 
                    { 
                        xtype: 'button',  
                        glyph: Rd.config.icnStart, 
                        scale: 'large', 
                        itemId: 'start',    
                        tooltip:    i18n('sStart_FreeRADIUS'),
                        toggleGroup     : 'start_stop',
                        enableToggle    : true,
                        pressed         : true

                    },
                    { 
                        xtype: 'button',  
                        glyph: Rd.config.icnStop,  
                        scale: 'large', 
                        itemId: 'stop',     
                        tooltip:    i18n('sStop_FreeRADIUS'),
                        toggleGroup     : 'start_stop',
                        enableToggle    : true,
                        pressed         : false
                    },
                    { 
                        xtype: 'button',  
                        glyph: Rd.config.icnInfo,  
                        scale: 'large', 
                        itemId: 'info',     
                        tooltip:    i18n('sFreeRADIUS_info')
                    }
                ]}
            ],
            bbar: [
                {   xtype: 'component', itemId: 'feedback',  tpl: '{message}',   style: 'margin-right:5px', cls: 'lblYfi'  }
            ],
            layout  : 'fit',
            margins : '0 0 0 0',
            border  : false,
            html    : '',
            autoScroll : true,
            border  : '5 5 5 5',
            bodyCls : 'fileViewer',
            itemId  : 'pnlViewFile'
        }]);
        me.populated = true;
    },
    views:  [
        'logViewer.winRadiusInfo'
    ],
    stores: [],
    models: [],
    socket: undefined,
    showFirstTime: undefined,
    showDiv: undefined,
    htmlToAdd: '',
    renderFlag: undefined,
    config: {
        urlFrStatus:    '/cake3/rd_cake/free-radius/status.json',
        urlFrStart:     '/cake3/rd_cake/free-radius/start.json',
        urlFrStop:      '/cake3/rd_cake/free-radius/stop.json',
        urlFrInfo:      '/cake3/rd_cake/free-radius/info.json',
        portWebSocket:  '8000'
    },
    refs: [
         {  ref:    'file', selector:   '#pnlViewFile'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#pnlViewFile #clear': {
                click:      me.clear
            },
            '#pnlViewFile #start': {
                click:      me.start
            },
            '#pnlViewFile #stop': {
                click:      me.stop
            },
            '#pnlViewFile #info': {
                click:      me.info
            },
            '#pnlViewFile'     : {
                afterrender : me.onShow,
                render      : me.onRender,
                destroy     : me.onDestroy
            }
        });
    },
    clear: function(b){
        var me      = this;
        me.showDiv.innerHTML = '';
    },
    start: function(b){
        var me      = this;
        //Determine if the server is running and change the start/stop button accordingly
        Ext.Ajax.request({
            url: me.getUrlFrStart(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    b.up('#pnlViewFile').down('#info').setDisabled(false);
                    Ext.ux.Toaster.msg(
                        "FreeRADIUS service started",
                        "FreeRADIUS service started fine",
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );  
                }   
            },
            scope: me
        });   
    },
    stop: function(b){
        var me      = this;
        //Determine if the server is running and change the start/stop button accordingly
        
        Ext.Ajax.request({
            url: me.getUrlFrStop(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    b.up('#pnlViewFile').down('#info').setDisabled(true);
                    Ext.ux.Toaster.msg(
                        "FreeRADIUS service stopped",
                        "FreeRADIUS service stopped fine",
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                }   
            },
            scope: me
        });   
    },
    info: function(b){
        var me = this;
        Ext.Ajax.request({
            url: me.getUrlFrInfo(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    me.showInfo(jsonData.data);
                }   
            },
            scope: me
        });   
    },
    showInfo: function(info){
        var me = this;
        if(!Ext.WindowManager.get('winRadiusInfo')){
            var w = Ext.widget('winRadiusInfo',{
                        id      :'winRadiusInfoId',
                        info    : info
                    });
            w.show();
        }
    },
    ioLoaded:   function(i){
        var me = this;
        //Connect to host
        var t = me.application.getDashboardData().token;
        //Get the current host
        var host = document.location.host;
        me.socket = io.connect('http://'+host+':'+me.getPortWebSocket()+'?token='+t);
        
        me.socket.on('connect', function() {
          //  console.log('Connected to:', me.socket);
        });

        //Event binding
        me.socket.on('message', function(m) {
            if(Ext.isString(m)){    //Only strings...
                var fb = i18n('sReceiving_new_logfile_data');
               // console.log(fb);
                me.getFile().down('#feedback').update({message: fb});
                var new_t = m.split("\n");
                var l = new_t.length-1;
                var last = false;
                new_t.forEach(function(element, index, array){
                    if(index == l){
                        last = true;
                    }
                    me.newText(element, last);
                });
            } 
        });

        me.socket.on('error', function (reason){
            console.error('Unable to connect Socket.IO', reason);
        });
    },
    onShow: function(w){
    
        var me = this;
        //console.log("Window show");
        if(me.showFirstTime == undefined){
            me.showFirstTime = true;
            me.showDiv = me.getFile().body.dom;
            var host = document.location.host;
            //Load the Socket library
           
            Ext.Loader.loadScript({
                url     : 'http://'+host+':'+me.getPortWebSocket()+'/socket.io/socket.io.js',
                scope   : this,                   // scope of callbacks
                onLoad  : me.ioLoaded,
                onError: function() {          // callback fn if load fails 
                    console.log("Error loading Socket ");
                } 
            });    
        }else{
            if(me.renderFlag == true){
               // console.log("New start of window.... connect again");
                me.showDiv = me.getFile().body.dom;
                me.socket.socket.reconnect();
                me.renderFlag = false; //Clear the flag
            }
        }
    },
    onRender: function(w){
        var me = this;
        //console.log("Window Render");
        if(me.showFirstTime == true){
            me.renderFlag = true; 
        }
        
        //Determine if the server is running and change the start/stop button accordingly
        Ext.Ajax.request({
            url: me.getUrlFrStatus(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    if(jsonData.data.running == true){
                        me.getFile().down('#start').toggle(true);
                        me.getFile().down('#info').setDisabled(false);
                    }else{
                        me.getFile().down('#stop').toggle(true);
                        me.getFile().down('#info').setDisabled(true);
                    } 
                }   
            },
            scope: me
        });
    },
    onDestroy: function(w){
        var me          = this;
        me.populated    = false;
        me.renderFlag   = false;
        me.socket.disconnect();  
    },
    newText: function(line,last){
        var me = this;
        var new_line = "<br />";
        if(last == true){
            new_line = "";
        }
        var items = line.split(": ");
        if(items.length >= 3){
            var d = "<span class='txtGrey'>"+items[0]+"</span> : ";
            var msg_type = items[1];

            var type_class = "txtGrey"; //default

            var info    = /Info/i;
            if(msg_type.search(info) != -1){
                type_class = "txtBlue";
            }

            var error   = /Error/i;
            if(msg_type.search(error) != -1){
                type_class = "txtRed";
            }
            var t = "<span class='"+type_class+"'>"+items[1]+"</span> : ";

            items.shift(); //Remove first two emements and print the rest...
            items.shift();
            var rest = items.toString();

            if(type_class == 'txtRed'){
                rest = "<span class='txtBold'>"+rest+"</span>";
            }
           // console.log(rest);
            me.htmlToAdd = me.htmlToAdd+d+t+rest+new_line;

        }else{
            me.htmlToAdd = me.htmlToAdd+line+new_line;
        }

        //Check if last then append the block and clear:
        if(last == true){
            me.showDiv.innerHTML    = me.showDiv.innerHTML+me.htmlToAdd;
            me.htmlToAdd            = '';
            me.getFile().body.scrollTo('top',99999, true);
            var fb                  = i18n('sAwaiting_new_logfile_data');
            me.getFile().down('#feedback').update({message: fb});
        }
        
    }
});
