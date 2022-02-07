/**
 * Face Api Main Script.
 * Author: Ege Demirbaş
 * Date: 04.02.2022
 * Forked by https://github.com/WebDevSimplified
 * Main Repo: https://github.com/WebDevSimplified/Face-Detection-JavaScript
 */

/**
 * global parameters
 */
let faceName;
let estPercentage;
let userListContainer = [];

/**
 * 
 * @returns found names at the moment.
 * 
 */
function getCurrentName(){
    return faceName;
}

/**
 * 
 * @returns confidence interval of given found name.
 */
function getEstimationPercentage(){
    return estPercentage;
}

function GetUserListFromDB(){
    
    try{
        let param = {};
        let userList = CFxmlHttpReqXacute.bind(this)("DEMO2/FaceLogin/findAllUsersXqry", param)
                       .Rowsets.Rowset[0].Row;  
        for(let i = 0; i < userList.length; i++){
            userListContainer.push((userList[i].name + userList[i].surname));
        }
    }catch(error){
        console.log("error occured while finding user names from database...")
        throw new 500;
    }
}

function FaceApiInit(video){
    
    const MODEL_URL = "./face-api/models";
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    ]).then(() => {
        GetUserListFromDB();
        console.log("user list obtained from database...")
    }).then(() =>{
        StartVideoStream(video);
        console.log("video stream opened for face recognition...")
    }).catch((error) => {
        console.log("problem occured while processing transaction, error log: " + error)
    });
}

function StartVideoStream(video) {
     
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        error => console.error(error)
    )
   return RecognizeFaces(video);
}

async function RecognizeFaces(video){

    const labeledDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: 426, height: 320 }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor)
        })
        results.forEach( (result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
            faceName = result.toString();      
        })
    }, 100)
}

function loadLabeledImages() {
    const labels = userListContainer
    return Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            for(let i=1; i<=1; i++) {
                const img = await faceapi.fetchImage(`./face-api/labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}
