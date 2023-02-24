/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details. 
 */
Ext.define('Rd.Application', {
    extend	: 'Ext.app.Application',   
    name	: 'Rd',
    requires: [
		//'Ext.*',  
		'Ext.chart.interactions.Rotate',
		'Ext.chart.interactions.ItemHighlight',
		'Ext.chart.series.Pie',
		'Ext.chart.axis.Numeric',
		'Ext.chart.axis.Category',
		'Ext.chart.series.Bar',
		'Ext.grid.filters.Filters',
        'Ext.ux.ProgressBarPager',
		'Rd.*'    //Uncomment when building production
    ],
    controllers: [
        'cStartup',
        'cLogin',
		'cDashboard'
    ],
	// Default Route
    defaultToken: 'dashboard',

    dashboardData : null,  //Data on how the dashboard will look like which will be returned after login
    languages   : null,
    selLanguage : null,  
    config		: {
        cloudId		: null,
    	cloudName	: null
    },
    autoCreateViewport: true,
    init: function() {
        var me = this;
        
        if(document.getElementById("divSplash")){
            var splash = document.getElementById("divSplash");
            splash.parentNode.removeChild(splash);
        }

        //==WIP==
/*
        console.log("Websocket");
        Ext.Loader.setConfig ({
	        enabled: true ,
	        paths: {
		        'Ext.ux.WebSocket': 'classic/src/ux/WebSocket.js' ,
		        'Ext.ux.WebSocketManager': 'classic/src/ux/WebSocketManager.js'
	        }
        });
        Ext.require (['Ext.ux.WebSocket', 'Ext.ux.WebSocketManager']);

        var ws = Ext.create ('Ext.ux.WebSocket', {
            communicationType : 'both', 
			url: 'ws://localhost:3000' ,
          //  url: 'wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self',
          //  communicationType: 'text',
			listeners: {
				open: function (ws) {
					console.log("WebSocket just open!");
                  //  ws.send ('This is only-text message');
                    ws.send ('init', 'This is a simple text');
                    ws.send ('and continue', {
                        'my': 'data' ,
                        'your': 'data'
                    });
				} ,
				message: function (ws, data) {
                    console.log("Message");
                    console.log(data);
				},
				close: function (ws) {
					console.log("Close Hom");
				}
			}
		});
*/

        //==END WIP==
        
        me.addUx();
        Ext.tip.QuickTipManager.init();
        Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider'));
        me.applyVtypes();
        
        //Disable Aria Warnings
        Ext.ariaWarn = Ext.emptyFn;
    },
    
    launch: function () {
        // TODO - Launch the application
        var me   = this;
        me.runAction('cStartup','Index');
    },
    
    runAction:function(controllerName, actionName,a,b){
        var me          = this;
        var controller  = me.getController(controllerName);
        controller.init(me); //Initialize the contoller
        return controller['action'+actionName](a,b);
    },
    
    setDashboardData: function(data){
        var me          = this;
        me.dashboardData  = data;
    },

    getDashboardData: function(){
        var me          = this;
        return me.dashboardData;
    },

    setLanguages: function(data){
        var me = this;
        me.languages = data;
    },
    getLanguages: function(data){
        var me = this;
        return me.languages;
    },

    setSelLanguage: function(data){
        var me =this;
        me.selLanguage = data;
    },
    getSelLanguage: function(data){
        var me = this;
        return me.selLanguage;
    },
    
    applyVtypes: function(){

        Ext.apply(Ext.form.field.VTypes, {

            //__IP Address__
            IPAddress:  function(v) {
                return (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/).test(v);
            },
            IPAddressText:  i18n('sExample') + ': 192.168.1.1',
            IPAddressMask: /[\d\.]/i,
         
            //__ MAC Address __
            MacAddress: function(v) {
                return (/^([a-fA-F0-9]{2}-){5}[a-fA-F0-9]{2}$/).test(v);
            },
            MacAddressMask: /[a-fA-F0-9\-]/,
            MacAddressText: i18n('sExample') + ': 01-23-45-67-89-AB',
            
            MacColon: function(v) {
                return (/^([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}$/).test(v);
            },
            MacColonMask: /[a-fA-F0-9\:]/,
            MacColonText: i18n('sExample') + ': 01:23:45:67:89:AB',
         
            //__ Hostname __
            DnsName: function(v) {
                return (/^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/).test(v);
            },
            DnsNameText: 'This is not a valid FQDN name',
            
            //__ Password match __
            PasswordMatch: function(a,b){
                var me  = this;
                var f   = b.up('form');
                var pwd = f.down('#password');
                if(pwd != null){
                    if(a != pwd.getValue()){
                        return false;
                    }else{
                        return true;
                    }   
                }
                return true;
            },
            PasswordMatchText: i18n('sPasswords_does_not_match'),

            //__ Numeric __
            Numeric : function(){
				  var objRegExp  =  /[0-9]/;
				  return function(strValue){
					  //check for numeric characters
					  return objRegExp.test(strValue);
				  }
		    }(),
		    NumericText: 'Only numbers are allowed',
            NumericMask: /[0-9]/

        });
    },
    
    addUx: function(){

        Ext.namespace('Ext.ux'); 

        //-- Constants -->

        Ext.ux.Constants = {
                msgWarn : 4000, //Timeout values for toaster message
                msgInfo : 2000,
                msgError: 8000,
                clsWarn : 'warn', //Classes for the message types
                clsInfo : 'info',
                clsError: 'error'
        }
        //<-- Constants --

        //--- Toaster --->

        //We create a toaster to inform people of our actions
        //This utility can be called the following ways:
        //Ext.ux.Toaster.msg('Buiding added','Adding went fine');
        //Ext.ux.Toaster.msg('Color Selected', 'You choose red',Ext.ux.Constants.clsInfo );
        //Ext.ux.Toaster.msg('Color Selected', 'You choose red',Ext.ux.Constants.clsError, Ext.ux.Constants.msgError );
        //The 3rd and 4th arguments are optional
                
        Ext.ux.Toaster = function(){
            var msgCt;
            var defaultTimeout = 500;
            function createBox(t, s){
                    return '<div class="msg">'+
                                '<h3>' + t + '</h3>'+
                                '<p>'  + s + '</p>' +
                            '</div>';
            }
            //This is a new thing, but valid. JS allows you to return an object, so when we call
            //Ext.toaster.msg('a','b'); we do in fact to the following by chaining
            // var t = Ext.toaster
            // t.msg('a','b');
            //Note that the context in which variables are called in the return object is in the falled function
            //This is why we can refer to msgCt as a local variable defined in this closure.
            return {
                msg : function(title, content, type, timeout){
                    //So this first part check if there is already a msgCt element, if not adds it to the document
                    //Using the Ext.DomHelper which will add a 'div' element by default, now with msg-div as id
                    //The original specified the return of an Ext.Element (true) but it works fine by returning a
                    //dom element (false)
                    if(!msgCt){
                        msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, false);
                    }
                    //Here the 'true' is important to get Ext.Element to do angit clone https://github.com/lede-project/source.gitimation on
                    var m = Ext.DomHelper.append(msgCt, createBox(title, content), true);
                    //Add a class if required
                    if(type !== undefined){
                        m.addCls(type);
                    }
                    //Change the timeout if required
                    if(timeout === undefined){
                        timeout = defaultTimeout;   
                    }
                    m.on('click',function(){ //Allow the user to destroy the message (that't typically their natural reaction)
                        m.destroy();
                    })
                    //Here we hide the newly created element first
                    m.hide();  
                    //Then we slide it in (default 2000ms), chained by a ghost effect of 500ms that will remove the message
                    m.slideIn('t').ghost("t", { delay: timeout, remove: true}); 
                }
            };
        }();

        //<-- Toaster --
        
        Ext.ux.ajaxFail = function(r){  
            var heading = r.status+" "+r.statusText;
            var detail  = "Detail not available";
            if(r.responseText !== undefined){
                var jsonData = Ext.JSON.decode(r.responseText);
                if(jsonData.message !== undefined){
                    detail = jsonData.message;
                }
            }
         
            Ext.ux.Toaster.msg(
                heading,
                detail,
                Ext.ux.Constants.clsError,
                Ext.ux.Constants.msgError
            );
        }

        //--- Form Fail message --->
        Ext.ux.formFail = function(form,action){
            switch (action.failureType) {
            case Ext.form.action.Action.CLIENT_INVALID:
                Ext.ux.Toaster.msg(
                    'Failure',
                    'Form fields may not be submitted with invalid values',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            break;
            case Ext.form.action.Action.CONNECT_FAILURE:
                Ext.ux.Toaster.msg(
                    'Failure',
                    'Ajax communication failed',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            break;
            case Ext.form.action.Action.SERVER_INVALID:
                Ext.ux.Toaster.msg(
                    'Failure',
                    action.result.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            break;
            case Ext.form.action.Action.LOAD_FAILURE:
                 Ext.ux.Toaster.msg(
                    'Load Failure',
                    action.result.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }
        }

        //<-- Form Fail message

        //-- Format to a readable unit --->
        Ext.ux.bytesToHuman = function (fileSizeInBytes) {

            if((fileSizeInBytes == 0)||(fileSizeInBytes == null)){
                return '0 Kb';
            }
            var i = -1;
            var byteUnits = [' Kb', ' Mb', ' Gb', ' Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes >= 1024);

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        };

        //-- Format to a readable time -->
        Ext.ux.secondsToHuman = function(seconds) {
            var numdays     = Math.floor(seconds / 86400); 
            var numhours    = Math.floor((seconds % 86400) / 3600);
            var numminutes  = Math.floor(((seconds  % 86400) % 3600) / 60);
            var numseconds  = ((seconds % 86400) % 3600) % 60;
            return  padDigits(numdays,2) + ":" + padDigits(numhours,2) + ":" + padDigits(numminutes,2) + ":" + padDigits(numseconds,2);

            function padDigits(number, digits) {
                return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
            }
        }

        //-- Format to a readable amount -->
        Ext.ux.centsToHuman = function(cents) {
            return (cents/100).toFixed(2); 
        }
    },
    
    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
