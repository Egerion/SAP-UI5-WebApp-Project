async function takeAShot(that, video, canvas, name, surname, username, password){
    
    let stream;
    Promise.all([
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }),
        video.srcObject = stream,
        await new Promise(r => setTimeout(r, 2000))
    ]).then(() => {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageBase64 = canvas.toDataURL('image/jpeg').slice(23);
        CloseCamera(video);

        // let userDto = {
        //     "Param.1": name,
        //     "Param.2": surname,
        //     "Param.3": username,
        //     "Param.4": password,
        //     "Param.5": name + surname,
        //     "Param.6": imageBase64
        // };
        // let result = CFxmlHttpReqXacute.bind(that)("DEMO2/FaceLogin/uploadFileXqry", userDto);
        // console.log(result);

        let response = $.ajax({
                type: "POST",
                async: false,
                url: "/XMII/Runner",
                dataType: "text",
                data: {
                Transaction: "DEMO2/FaceLogin/uploadFileTrns",
                OutputParameter: "O_resultXML",
                "Content-Type": "text/xml",
                I_name: name,
                I_surname: surname,
                I_username: username,
                I_password: password,
                I_fileName: name + surname,
                I_encodedFile: imageBase64,
            },
            success: function (data) {
                console.log(data);        
            },
        });
        console.log("photo shoot completion response:" + response);
    }).catch((error) => {
        console.log("problem occured while processing transaction, error log: " + error)
    });
}

async function OpenCamera(video){

    let stream;
    Promise.all([
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }),
        video.srcObject = stream,
        await new Promise(r => setTimeout(r, 2000))
    ]).then((result) => {
        console.log(result);
    }).catch((error) => {
        console.log(error);
    });
}

function CloseCamera(video){

    let tracks = video.srcObject.getTracks();
    tracks.forEach(function(track) {track.stop();}); video.srcObject = null;
}