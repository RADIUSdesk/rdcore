Ext.define('AmpConf.model.Session', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'token', type: 'string' },
        { name: 'expires', type: 'date' }
    ],
    statics: {
        login: function(username, password) {
            var url = '/cake3/rd_cake/dashboard/authenticate.json';
             return new Ext.Promise(function (resolve, reject) {
                 Ext.Ajax.request({
                     url        : url,
                     method     : 'POST',
                     jsonData   : {username:username,password:password},
                     success: function (response) {
                         // Use the provided "resolve" method to deliver the result.
                        var obj = Ext.decode(response.responseText);
                        if(obj.success){

                            resolve(obj);
                        }else{

                            reject(obj);
                        }  
                     },
                     failure: function (response) {
                         reject(response.status);
                     }
                 });
             });
        }
    },

    isValid: function() {
       /* return !Ext.isEmpty(this.get('token'))
            && this.get('expires') > new Date()
            && this.getUser() !== null;*/
    },

    logout: function() {
        return new Ext.Promise(function (resolve, reject) {
            //Server.auth.logout({}, resolve);
        });
    }
});
