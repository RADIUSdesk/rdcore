/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('AmpConf.Application', {
    extend: 'Ext.app.Application',

    name    : 'AmpConf',
    
    requires: [
        'AmpConf.*',
        'Ext.MessageBox'
        //'Ext.*'
    ], 
    models: [
        'mMesh'
    ],
    //We stick to this convention for now where a ViewController ends with 'Controller' and ViewModel ends with 'Model'
    //This way of doing things we have the viewport and its viewcontroller central to the logic in terms of the router and the descisions on what to display.
    viewport: {
       controller   : 'ViewportController',
       viewModel    : 'ViewportModel'
    },

    //This is the starting point of it all - ACTUALLY NOT IT is covered in the viewcontroller...
    launch  : function() {
        Ext.Viewport.getController().onLaunch();
        Ext.getBody().removeCls('launching');
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
