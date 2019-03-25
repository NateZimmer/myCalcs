var c = 299792458;
var pi = 3.14159265359;


function objToQuery(obj){
    var qStr = '';
    for(prop in obj){
        qStr += prop + '=' + obj[prop] + '&';  
    }
    qStr = qStr.substr(0,qStr.length - 1);
    window.history.pushState("", "", '?' + qStr);
}


function queryToObj(){
    var obj = {};
    var Qs = window.location.search.substr(1).split('&');
    for(var pair of Qs){
        var name = pair.split('=')[0];
        var value = pair.split('=')[1];
        if(name != undefined && value != undefined){
            obj[name]=value;
        }
    }
    return obj;
}


function calcOutput(){
    console.log('Attempting to calc output');
    var txGain = getTxGain();
    var txPwr = getTxPwr();
    var freq = getFreq();
    var rxGain = getRxGain();
    var rxPwrSen = getRxPwr();
    var rangeInput = getRange();
    var pathLoss = getPathLoss();
    var calcOptionDiv = document.querySelector('#calcOption')
    var selectOutText = calcOptionDiv.options[calcOptionDiv.selectedIndex].innerHTML;

    if(selectOutText == 'Received Power'){
        var pwr = 10*Math.log10(txPwr)+ 30 + txGain + rxGain + 20*Math.log10(c/(4*pi*rangeInput*freq)) - pathLoss;
        var unit = document.querySelector('#rxPwrCalcOption').value;
        pwr = unit == 'W' ? Math.pow(10,(pwr-30)/10) : pwr;
        document.querySelector('#rxPwrCalc').value = pwr;
    }else{
        var num = (10*Math.log10(txPwr) - 10*Math.log10(rxPwrSen) + txGain + rxGain - 20*Math.log10(freq) + 147.5582 - pathLoss)/20;
        var rVal = Math.pow(10,num);
        var unitFactor = rangeUnitFactor(); 
        rVal = rVal * unitFactor;
        document.querySelector('#rangeOutputVal').value = rVal.toString();
    }
    handleQueryStr();
 
}


function handleQueryStr(){
    var inputs = document.querySelectorAll('.in1');
    var obj = {};
    for(inputDiv of inputs){
        var id = inputDiv.id;
        var val = inputDiv.value;
        if(val.length>0 && (val !='NaN')){
            obj[id]=val;
        }
    }

    var selects = document.querySelectorAll('.opt1');

    for(selectDiv of selects){
        if(selectDiv.selectedIndex != 0){
            var id = selectDiv.id;
            var val = selectDiv.selectedIndex.toFixed();
            obj[id]=val;
        }
    }

    objToQuery(obj);
}


function getFreq(){
    var freqOption = document.querySelector('#freqOption').value;
    var freqVal = parseFloat(document.querySelector('#freqVal').value);
    switch(freqOption){
        case 'GHz':
            freqVal = freqVal * 1e9; 
            break;
        case 'MHz':
            freqVal = freqVal * 1e6;
            break;
        case 'KHz': 
            freqVal = freqVal * 1e3; 
            break;
        default: 
            console.log('Invalid Freq Option');
            break;
    }
    return freqVal;
}


function getTxPwr(){
    var txPwrOption = document.querySelector('#txPwrOption').value;
    var txPwr = parseFloat(document.querySelector('#txPwrVal').value);
    switch(txPwrOption){
        case 'dBm':
            txPwr = Math.pow(10,(txPwr-30)/10);
            break;
        case 'W':
            txPwr = txPwr;
            break;
        default:
            console.log('Invalid Tx Pwr Option') 
            break;
    }   
    return txPwr;
}


function getRxPwr(){
    var rxPwrOption = document.querySelector('#rxPwrOption').value;
    var rxPwr = parseFloat(document.querySelector('#rxSenVal').value);
    switch(rxPwrOption){
        case 'dBm':
            rxPwr = Math.pow(10,(rxPwr-30)/10);
            break;
        case 'W':
            rxPwr = rxPwr;
            break;
        default:
            console.log('Invalid Rx Pwr Option') 
            break;
    }   
    return rxPwr;
}


function rangeUnitFactor(){
    var scale = 1;
    var unit = document.querySelector('#rxRangeCalcOption').value;
    scale = unit == 'Feet' ? 3.2808 : scale;
    return scale;
}


function getRange(){
    var rangeVal = parseFloat(document.querySelector('#rangeVal').value);
    var rangeOption = document.querySelector('#rangeOptions').value;

    switch(rangeOption){
        case 'Feet':
            rangeVal = rangeVal/3.2808;
            break;
        case 'Meter':
            break;
        default:
            console.log('Invalid input range option');
    }
    return rangeVal;
}


function getTxGain(){
    return parseFloat(document.querySelector('#txGainVal').value);
}


function getRxGain(){
    return parseFloat(document.querySelector('#rxGainVal').value);
}


function getPathLoss(){
    return parseFloat(document.querySelector('#pathLoss').value);
}


function handleCalcTarget(){
    var selectText = this.options[this.selectedIndex].innerHTML;
    switch(selectText){
        case 'Range':
            document.querySelector('#rxPwrCalcDiv').style.display='none';
            document.querySelector('#rangeCalcDiv').style.display='';
            document.querySelector('#rxSenDiv').style.display='';
            document.querySelector('#rangeDiv').style.display='none';
            break;
        case 'Received Power':
            document.querySelector('#rxPwrCalcDiv').style.display='';
            document.querySelector('#rangeCalcDiv').style.display='none';
            document.querySelector('#rxSenDiv').style.display='none';
            document.querySelector('#rangeDiv').style.display='';
            break;
        default:
            console.log('Invalid calc option');
            break;
    }
}


function onLoad(){
    document.querySelector('#calcOption').addEventListener('change',handleCalcTarget);
    for(el of document.querySelectorAll('.opt1')){
        el.addEventListener('change',calcOutput)
    }
    for(el of document.querySelectorAll('.in1')){
        el.addEventListener('input',calcOutput)
    }
}


function parseQueryUrl(){
    var obj = queryToObj();
    console.log('Parsing Query Obj');
    for(prop in obj){
        var div = document.querySelector('#'+ prop);
        if(div != undefined){
            if(div.nodeName == 'INPUT'){
                div.value = obj[prop];
            }else if(div.nodeName == 'SELECT'){
                div.selectedIndex=parseInt(obj[prop]);
                div.dispatchEvent(new Event('change'));
            }
        }
    }
}


onLoad();

parseQueryUrl();
