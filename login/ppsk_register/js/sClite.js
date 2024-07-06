var sClite = (function () {

    //Immediately returns an anonymous function which builds our modules
    return function (co) {    //co is short for config object
          
        var h               = document.location.hostname;
        var divFeedBack     = '#cpDivFeedback';
              
        var cDynamicData    = undefined;
        if(co.cDynamicData != undefined){
            cDynamicData = co.cDynamicData;
        } 
             
        var cDebug          = true;                 
	    var urlAdd			= location.protocol+'//'+h+'/cake4/rd_cake/register-users/new-permanent-user.json';        
        var current         = 0;
        var tabs            = $('.tab');
        var tabs_pill       = $('.tab-pills');
                      
        var init = function(){
            $('#btnRegister').on('click',onBtnRegisterClick);  
            $('#btnNext').on('click',onBtnNextClick); 
            $('#btnBack').on('click',onBtnBackClick); 
            loadFormData(current);           
        }
        
        var fDebug  = function(message){  
            if(cDebug){
                console.log(message);
                $(divFeedBack).text(message); 
            }
        };
        
        var fShowError = function(msg){
            msg = '<div>'+msg+'</div>';
            $('#alertWarn').html(msg);
            $('#alertWarn').addClass('show');
        } 
        
        var loadFormData = function (n) {
            $(tabs_pill[n]).addClass('active'); //Activate the tab-pill
            $(tabs[n]).removeClass('d-none'); //Show the tab
            
            //--Buttons--
            $('#btnBack').attr('disabled', n == 0 ? true : false); //Disable the Back button on the start screen                    
            
            if(n == 0){
                $('#btnNext').show();
                $('#btnRegister').hide();
            }
            
            if(n == 1){
                $('#btnNext').hide();
                $('#btnRegister').show();
            }
            
            if(n == 2){
                $('#btnNext').hide();
                $('#btnRegister').hide();
            }          
        }

        var onBtnNextClick = function() {
            $(tabs[current]).addClass('d-none'); //Hide the current one
            $(tabs_pill[current]).removeClass('active'); //De-activate the tab-pill                    
            current++;
            loadFormData(current);
        }

        var onBtnBackClick = function() {
            $(tabs[current]).addClass('d-none'); //Hide the current one
            $(tabs_pill[current]).removeClass('active'); //De-activate the tab-pill
            current--;
          //  $('#crdWizard').addClass('opacity-75');
            loadFormData(current);           
        }   
           
        var onBtnRegisterClick = function(event){
        
            var form    = document.querySelector('#frmRegister');
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
                $('#crdWizard').removeClass('opacity-75');
            }else{ 
              
                $('#alertWarnRegister').removeClass('show');
                var mac = getParameterByName('mac');
                var formData = {
                    login_page    : cDynamicData.detail.name,
                    login_page_id : cDynamicData.detail.id,
                    mac           : mac,
                    name          : $("#txtrFirstName").val(),
                    surname       : $("#txtrSurname").val(),
                    username      : $("#txtrEmail").val(),
                    password      : $("#txtrPassword").val(),
                    phone         : $("#txtrCell").val(),
                    ppsk          : $("#txtrPpsk").val()

                };
                             
                $.ajax({
                    type      : "POST",
                    url       : urlAdd,
                    data      : formData,
                    dataType  : "json",
                    encode    : true,
                })
                .done(function (data) {
                    if(data.success){
                        $('#spnPpsk').text($("#txtrPpsk").val());
                        onBtnNextClick();  
                    }else{

                        if(data.errors !== undefined){
                            msg = '';
                            Object.keys(data.errors).forEach(key => {
                                //console.log(key, data.errors[key]);
                                msg = msg+'<b>'+key+'</b>  '+data.errors[key]+"<br>\n";
                            });                       
                            $('#alertWarnRegister').html(msg);
                            $('#alertWarnRegister').addClass('show');                                                
                        }                
                    }
                });
            }
            form.classList.add('was-validated');
        }
        
        function getParameterByName(name) {
           name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
           var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
               results = regex.exec(location.search);
           return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        
       //Expose those public items...
       return {         
            init    : init  
        }   
    }
    
    

    
       
})();
