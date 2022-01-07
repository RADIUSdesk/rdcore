Ext.define('Rd.controller.cDebug', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        if (me.populated) {
            return; 
        } 
        
         //Do it this way to avoid a race condition
        var vd = Ext.create('Rd.view.debugOutput.pnlViewDebug',{
                region  : 'center',
                layout  : 'fit',
                margins : '0 0 0 0',
                border  : false,
                itemId  : 'pnlDebug'
        });
            
        pnl.add(vd);
        me.populated = true;       
    },
    views:  [
       'debugOutput.pnlViewDebug'
    ],
    stores: [],
    models: ['mNas'],
    socket: undefined,
    showFirstTime: undefined,
    showDiv: undefined,
    htmlToAdd: '',
    renderFlag: undefined,
    countTimeout: undefined,
    timeout: undefined,
    config: {
        urlFrStatusDb:      '/cake3/rd_cake/free-radius/status_debug.json',
        urlFrStartDb:       '/cake3/rd_cake/free-radius/start_debug.json',
        urlFrStopDb:        '/cake3/rd_cake/free-radius/stop_debug.json',
        urlFrTimeDb:        '/cake3/rd_cake/free-radius/time_debug.json',
        portWebSocket:      '8000'
    },
    refs: [
         {  ref:    'file', selector:   'pnlViewDebug'}
    ],
    init: function() {
         var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'pnlViewDebug #clear': {
                click:      me.clear
            },
            'pnlViewDebug #start': {
                click:      me.start
            },
            'pnlViewDebug #stop': {
                click:      me.stop
            },
            'pnlViewDebug #time': {
                click:      me.time
            },
            '#pnlDebug'   : {
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
        var ep      = {};
        //Determine if the server is running and change the start/stop button accordingly
        var nas         = b.up("pnlViewDebug").down('#nas').getValue();
        var username    = b.up("pnlViewDebug").down('#username').getValue();

        if(nas != null){
            ep.nas_id = nas;
        }

        if(username != ''){
            ep.username = username;
        }
        Ext.Ajax.request({
            url: me.getUrlFrStartDb(),
            method: 'GET',
            params: ep,
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    clearInterval(me.countTimeout);
                    me.timeout = jsonData.data.time_added;
                    me.countTimeout = setInterval(function(){        
                        me.timeout = me.timeout - 1;
                        if(me.timeout > 0){
                            me.getFile().down('#feedback').update({message: "Stopping debug tace in "+me.timeout+" seconds"});
                        }else{
                            clearInterval(me.countTimeout);
                            me.getFile().down('#feedback').update({message: "Debug tace stopped"});
                        };
                    }, 1000);  
                    Ext.ux.Toaster.msg(
                        "Debug trace started",
                        "Debug trace started fine",
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                    me.getFile().down('#time').setDisabled(false);  
                }   
            },
            scope: me
        });   
    },
    stop: function(b){
        var me      = this;
        //Determine if the server is running and change the start/stop button accordingly       
        Ext.Ajax.request({
            url: me.getUrlFrStopDb(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    clearInterval(me.countTimeout);
                    me.getFile().down('#feedback').update({message: "Debug tace stopped"});
                    me.getFile().down('#time').setDisabled(true);
                    Ext.ux.Toaster.msg(
                        "Debug trace stopped",
                        "Debug trace stopped fine",
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                }   
            },
            scope: me
        });   
    },
    time: function(b){
        var me = this;
        Ext.Ajax.request({
            url: me.getUrlFrTimeDb(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    clearInterval(me.countTimeout);
                    me.timeout = jsonData.data.time_added;
                    me.countTimeout = setInterval(function(){        
                        me.timeout = me.timeout - 1;
                        if(me.timeout > 0){
                            me.getFile().down('#feedback').update({message: "Stopping debug tace in "+me.timeout+" seconds"});
                        }else{
                            clearInterval(me.countTimeout);
                            me.getFile().down('#feedback').update({message: "Debug tace stopped"});
                        };
                    }, 1000);
                    Ext.ux.Toaster.msg(
                        "Debug timeout increased",
                        "Debug timeout increased fine",
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    ); 
                }   
            },
            scope: me
        });   
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
                onLoad  : me.ioLoaded,
                scope   : me
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
            url: me.getUrlFrStatusDb(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    if(jsonData.data.level > 0){
                        me.getFile().down('#start').toggle(true);
                        me.getFile().down('#time').setDisabled(false);
                        if(jsonData.data.time_added != undefined){
                            me.timeout = jsonData.data.time_added;
                            me.countTimeout = setInterval(function(){        
                                me.timeout = me.timeout - 1;
                                if(me.timeout > 0){
                                    me.getFile().down('#feedback').update({message: "Stopping debug tace in "+me.timeout+" seconds"});
                                }else{
                                    clearInterval(me.countTimeout);
                                    me.getFile().down('#feedback').update({message: "Debug tace stopped"});
                                }
                            }, 1000);
                        } 
                    }else{
                        me.getFile().down('#stop').toggle(true);
                        me.getFile().down('#time').setDisabled(true);
                    } 
                }   
            },
            scope: me
        });
    },
    onDestroy: function(w){
        //console.log("Window destroyed");
        var me          = this;
        me.populated    = false;
        me.renderFlag   = false;
        me.socket.disconnect();
        clearInterval(me.countTimeout);  
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
