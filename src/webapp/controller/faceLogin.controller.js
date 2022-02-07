sap.ui.define(
    [
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/HTML',
    "sap/m/MessageToast",
    "../scripts/CFLibrary",
    "../face-api/photoShoot",
    "../face-api/script",
    "../face-api/face-api.min",
    ],
    function (Controller, HTML, MessageToast, CFLibrary, PhotoShoot, FaceApi, FaceApiMin) {
    "use strict";
        
        //enum list for camera open state
        const CAM_OPEN = 0;
        const CAM_SHOOT = 1;
        const CAM_CLOSE = 2;
        const CAM_LAST = 3;
    
        //global scope, global variables.
        var video, canvas, loopCheck = true, cameraState = CAM_CLOSE;
        var regUsername, regUserPassword;
        var regName, regSurname;
    
        return Controller.extend("com.ed.mii.controller.faceLogin", {
            ///@ stateless, init function.
            onInit: function () {      
            },
            ///@ stateless, after render function.
            onAfterRendering: function(){
                //set global video and canvas
                video = document.getElementById(this.createId("videoInput"));
                canvas = document.getElementById(this.createId("canvas"));

                console.log("all html tags are rendered!");
            },
            /// @stateless, main loop to check face detection.
            mainLoop: async function(){
                while(loopCheck){
    
                    let foundName = getCurrentName();
                    if(foundName){              
                        let percentage = foundName.replace(/[^0-9]/g,'');
                        let name = foundName.replace(/[0-9]/g, '').replace('', '');
                        if(percentage >= 0.5){
    
                            MessageToast.show("Hello " + name);
                            
                            //close camera.
                            CloseCamera(video);
    
                            //goto next page.
                            this.onLoginGotoDashboardPage();   
    
                            loopCheck = false;
                            console.log("found person: " + name + " " + percentage);                    
                        }       
                    }
                    await new Promise(function (resolve) { setTimeout(resolve, 150);});
                }
            },
            ///@ called goto dashboardSample1 page.
            onLoginGotoDashboardPage: function(){
                sap.ui.core.UIComponent.getRouterFor(this).navTo("dashboardSample1");
            },
            //@ pressed, use face detection method to sign user in.
            onLoginUserWithFaceDetection: function(){

                this.getView().setBusy(true);


                //run face-api.
                 setTimeout(function(){
                    this.getView().setBusy(false)
                 }.bind(this), 3000);

                 FaceApiInit(video);    
                 this.mainLoop();     

            },   
            ///@ called, close dialog box.
            onCancelDialog: function(oEvent){
                if (oEvent)
                    oEvent.oSource.getParent().close();
            },
            ///@ triggered, log user in via username and password.
            onLoginUserWithPassword: function(){
            
                let userNameInput = this.byId("ILogUsername").getValue(),
                    userPasswordInput = this.byId("ILogPassword").getValue();
    
                if(userNameInput && userPasswordInput){

                    let oParams = {
                        "Param.1":userNameInput,
                        "Param.2":userPasswordInput,
                    }
                    let result = CFxmlHttpReqXacute.bind(this)("DEMO2/FaceLogin/findUserXqry", oParams);
                    let message = result.Rowsets.Rowset[0].Row[0].OutputMessage;
                    if(message != "User Not Found"){
                        this.onLoginGotoDashboardPage();
                        MessageToast.show("Welcome " + userNameInput);
                    } else {
                        MessageToast.show("Not Vaild User!");
                    }
                } else {
                    MessageToast.show("fill all areas to login!");
                }
            },      
            ///@ pressed, handle camera shot. First open open video area, then act as snapShopt! 
            onPressHandleCamera: function(){

                regUsername = this.byId("IRegUserName").getValue(), regUserPassword = this.byId("IRegPassword").getValue();
                regName = this.byId("IRegName").getValue(), regSurname = this.byId("IRegSurname").getValue();
                if(regUsername && regUsername && regName && regSurname){
                    
                    let camButton = this.byId("buttonRegister");
                    switch(cameraState){
                        case CAM_CLOSE:
                            OpenCamera(video);
                            camButton.setText("Smile and Snap!");
                            cameraState = CAM_OPEN;
                            break;
                        case CAM_OPEN:
                            takeAShot(this, video, canvas, regName, regSurname, regUsername, regUserPassword);
                            CloseCamera(video);
                            camButton.setText("Open Camera");
                            cameraState = CAM_CLOSE
                            break;
                        case CAM_SHOOT:
                            break;
                        default:
                          console.log("unknown camera state.");
                    }
                }
                else{
                    MessageToast.show("Please enter username and password");
                }
            },
            ///@ called, create new user
            onPressCreateNewUser: function(){
                         
                if(regUsername && regUserPassword){
                
                } else {
                    MessageToast.show("fill all areas to login!");
                }
            },
            ///@ called, 

        });
    }
);
