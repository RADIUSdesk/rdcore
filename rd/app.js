/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'Rd.Application',
    name: 'Rd',
    requires: [
        // This will automatically load all classes in the Rd namespace
        // so that application classes do not need to require each other.
        'Rd.*' 
    ],

    // The name of the initial view to create.
    //mainView: 'Rd.view.main.Main'
});
