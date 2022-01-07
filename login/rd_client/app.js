/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend  : 'AmpConf.Application',
    name    : 'AmpConf',
    requires: [
        // This will automatically load all classes in the AmpConf namespace
        // so that application classes do not need to require each other.
        'AmpConf.*'
    ]
});
