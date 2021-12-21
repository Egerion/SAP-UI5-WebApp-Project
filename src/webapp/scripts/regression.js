///global variables
let oMasterModel;         //contains all the necessary data as json model
let oDiffNormScores = [];
let oRealData       = [];
let oNormMin        = []; //index i = types: COUNT, AVG_HEAT, UP_TIME. index j = normalized values
let oNormMax        = []; //index i = types: COUNT, AVG_HEAT, UP_TIME. index j = normalized values
let oNormScores     = []; //index i = types: COUNT, AVG_HEAT, UP_TIME. index j = normalized values
let oGoldenCoeffIndexes = [];
let totalMaxScore = 0;
let goldenCountScore;

let iterativeBeginStep = -0.25;
let iterativeEndStep = 1.0;
let iterativeStep = 0.25;
let maxIteration = 1500;

///enum list
const paramEnum = {
    COUNT: 0,
    AVG_HEAT: 1,
    UP_TIME: 2,
    REQ_REP: 3,
    LAST: 4,
};

function OverrideCoeffs(c1,c2,c3){
    iterativeBeginStep = Number(c1);
    iterativeEndStep = Number(c2);
    iterativeStep = Number(c3);
    return true;
}

///starting the regression
function RegressionInit(oMaterialName, isCustomParamUsed){
    if(!isCustomParamUsed){
        iterativeBeginStep = -0.25;
        iterativeEndStep = 1.0;
        iterativeStep = 0.25;
    }
    LoadAndSetData(oMaterialName);
    NormalizeCounts(oMaterialName);
    IterativePermutation();
    return Math.round(goldenCountScore);
}

///load data onto arrays
function LoadAndSetData(oMaterialName){
    let params = "Param.1=" + oMaterialName;
    let reqResult = xmlHttpReqXacute.bind(this)("DEMIRBAS_Test/SarfMalzemeRegression/getMaterialDataXqry", params);
        oMasterModel = new sap.ui.model.json.JSONModel(reqResult.Rowsets.Rowset[0].Row).oData;
        //oRealData.push(oCount, oAvgHeat, oUpTime, oReqRep);
}

//selecting hyper parameter
function DecideHyperParamType(i, hyperParam){
    switch(hyperParam){
    case 0:
        return oMasterModel[i].COUNT;
    case 1:
        return oMasterModel[i].AVG_HEAT;
    case 2:
        return oMasterModel[i].UP_TIME;
    }
}

///normalize the parameters
function NormalizeCounts(oMaterialName){

    let tempMin     = 10000, //arbitrary large value like M.
        tempMax     = 0,
        tempVal     = 0,
        logIterator = 0,
        tempNormVal;

    for(let hyperParam = 0; hyperParam < 3; hyperParam++){

        let posingScore     = 0,
            imposingScore   = 0,
            posingCounter   = 0,
            imposingCounter = 0;

        oNormMin[hyperParam]        = []; //2D array
        oNormMax[hyperParam]        = [];
        oNormScores[hyperParam]     = [];
        oDiffNormScores[hyperParam] = [];

        tempMin  = 100000, //arbitrary large value like M.
        tempMax  = 0,
        tempVal  = 0;

        for(let i = 0; i < oMasterModel.length; i++){
            tempVal = DecideHyperParamType(i, hyperParam);
            if(tempVal <= tempMin)
                tempMin = tempVal;
            if (tempVal >= tempMax)
                tempMax = tempVal;
        }
        oNormMin[hyperParam][0] = tempMin;
        oNormMax[hyperParam][0] = tempMax;
        //console.log("Min Value of: " + oMaterialName + ": " + oNormMin[hyperParam][0]);
        //console.log("Max Value of: " + oMaterialName + ": " + oNormMax[hyperParam][0]);

        tempNormVal, logIterator = 0;
        for(let i = 0; i < oMasterModel.length; i++){
            tempNormVal = (DecideHyperParamType(i, hyperParam) - oNormMin[hyperParam][0]) / (oNormMax[hyperParam][0] - oNormMin[hyperParam][0]);
            if(oMasterModel[i].REQ_REP == 1){
                posingScore += tempNormVal;
                posingCounter++;
            }
            else{
                imposingScore += tempNormVal;
                imposingCounter++;
            }
            oNormScores[hyperParam][logIterator] = tempNormVal.toFixed(3);
            //console.log("Normalized Scores:" + oNormScores[hyperParam][logIterator]);
            logIterator++;
        }
        oDiffNormScores[hyperParam][0] = hyperParam;
        oDiffNormScores[hyperParam][1] = (Math.abs((posingScore/posingCounter) - (imposingScore / imposingCounter)).toFixed(3));
    }
    oDiffNormScores.sort((a,b) => a[1] - b[1]).reverse(); //sorting wrt index j = value index.

    //log - TODO
    //for(let i = 0; i < 3; i++){
    //    console.log("diffNormScore: " + " "+ oDiffNormScores[i][0] + " with Score: " + oDiffNormScores[i][1]);
    //}
}

//permutate through paramteres
function IterativePermutation(){
    let goldenIteration = 0;
    //setting bias paramters - TODO
    for(let coeffIndex1 = iterativeBeginStep;  coeffIndex1 < iterativeEndStep; coeffIndex1 += iterativeStep){
        for(let coeffIndex2 = iterativeBeginStep;  coeffIndex2 < iterativeEndStep; coeffIndex2 += iterativeStep){
            for(let coeffIndex3 = iterativeBeginStep;  coeffIndex3 < iterativeEndStep; coeffIndex3 += iterativeStep){
                CalculateFinalScore(coeffIndex1, coeffIndex2, coeffIndex3, false);
                goldenIteration++;
            }
        }
    }
    CalculateFinalScore(oGoldenCoeffIndexes[0], oGoldenCoeffIndexes[1], oGoldenCoeffIndexes[2], true);

    //console.log("total permutation: " +  goldenIteration);
    //console.log("total max found req replace: " + totalMaxScore);
    //console.log("golden iteration coeff: " +
    ///            oGoldenCoeffIndexes[0] + " " +
    //            oGoldenCoeffIndexes[1] + " " +
    //            oGoldenCoeffIndexes[2] + " ");
    //console.log("suggested max count amount: " + goldenCountScore);
}

//final calculation
function CalculateFinalScore(coeffIndex1, coeffIndex2, coeffIndex3, isFinalAnalysis){

    for(let sampleIterator = 0; sampleIterator < oMasterModel.length; sampleIterator++){
        let tempScore = 0;
        for(let hpIterator = 0; hpIterator < paramEnum.LAST - 1; hpIterator++){

            if( oDiffNormScores[0][0] == hpIterator){
                tempScore +=  Number(oNormScores[hpIterator][sampleIterator]) + Number(coeffIndex1);
            }
            else if(oDiffNormScores[1][0] == hpIterator){
                tempScore +=  Number(oNormScores[hpIterator][sampleIterator]) +  Number(coeffIndex2);
            }
            else if(oDiffNormScores[2][0] == hpIterator){
                tempScore +=  Number(oNormScores[hpIterator][sampleIterator]) +  Number(coeffIndex3);
            }
        }
        oMasterModel[sampleIterator].finalScore = Number(tempScore);3
    }
    let tempModel = new sap.ui.model.json.JSONModel(oMasterModel).oData;
    let tempScore = 0;
    if(isFinalAnalysis){
        for(let i = 0; i < (tempModel.length * 0.20); i++){
            tempScore += tempModel[i].COUNT;
        }
        goldenCountScore = (tempScore/(tempModel.length * 0.20));
    }
    else{
        tempModel.sort((a,b) => a.finalScore - b.finalScore).reverse(); // sorting wrt to finalScore
        for(let i = 0; i < (tempModel.length * 0.20); i++){
            if(tempModel[i].REQ_REP == 1)
                tempScore++;
            //console.log("total found required repairs: " + tempScore);
            if(totalMaxScore < tempScore){
                totalMaxScore = tempScore;
                oGoldenCoeffIndexes[0] = coeffIndex1;
                oGoldenCoeffIndexes[1] = coeffIndex2;
                oGoldenCoeffIndexes[2] = coeffIndex3;
            }
        }
    }
}