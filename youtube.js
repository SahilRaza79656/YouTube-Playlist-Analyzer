// a. Name of Playlist,view
// b. Total No of videos :  
// c. actual No of videos : 
// d. Total length of playlist :  
// At 1.25x :  
// At 1.50x :  
// At 1.75x :  
// At 2.00x :  
// Average length of video :  

// e. console.table of video number,name,time

// Current Task : name of playlist ,views,total videos, 

const pdfkit = require('pdfkit');
const puppeteer = require("puppeteer");
let fs = require('fs');
let path = require('path');

let page;
(async function fn() {
    let browser = await puppeteer.launch({
        headless: false, defaultViewport: null,
        args: ["--start-maximized"],
    })
    page = await browser.newPage();
    await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
    await page.waitForSelector('h1[id="title"]');
    // first element
    let element = await page.$('h1[id="title"]');
    let value = await page.evaluate(
        function (element){
        return element.textContent;
    }, element);
    let title = value;
    // console.log("Title - ", value);
    // all occurences F
    // 21
    let someList = await page.$$(".style-scope.ytd-playlist-sidebar-primary-info-renderer");
     value = await page.evaluate(
        function (element){
        return element.textContent;
    }, someList[5]);
    // let videos = value;
    // console.log("videos - ", value);
    let videos = value.split(" ")[0].trim();
    value = await page.evaluate(
        function (element){
        return element.textContent;
    }, someList[6]);
    let views = value;
    // console.log("views - ", value);
    // no of views -> playlist
    // list first 100 videos console.table=>  of video number,name,// time

    // ->
    let loopcount = Math.floor(videos / 100);

    for (let i = 0; i < loopcount; i++) {
        // load start
        await page.click(".circle.style-scope.tp-yt-paper-spinner");
        // load finish
        await waitTillHTMLRendered(page);
        // console.log("loaded the new videos");
    }
    // loader -> scroll 
    // video Name
    let videoNameElementList = await page.$$("a[id='video-title']");
    // console.log("videoNameElementList", videoNameElementList.length);
    // last video 
    let lastVideo = videoNameElementList[videoNameElementList.length - 1];
    // last video -> view
    await page.evaluate(function (elem) {
        elem.scrollIntoView();
    }, lastVideo);
    
    console.log("Title of the playlist - ", title);
    console.log("Total number of videos - ", videos);
    console.log("Total views - ", views);
    // time 
    let timeList = await page.$$("span[id='text']");
    console.log("Actual number of videos - ",timeList.length);

    let videosArr = [];
    let timeInSecs = 0;
    //console.log(timeList);
    for (let i = 0; i < timeList.length; i++) {
        let timeNTitleObj = await page.evaluate(getTimeAndTitle, timeList[i], videoNameElementList[i]);
        videosArr.push(timeNTitleObj);

        let k = timeNTitleObj.time.includes(":");
        // console.log(k);
        if(k == true) {
            let timePartArr = timeNTitleObj.time.split(":");
        // console.log(timePart[0]+"----"+timePart[1]);
        // console.log(timePartArr.length);
            if(timePartArr.length == 3){
                timeInSecs += Number(timePartArr[0])*3600+Number(timePartArr[1])*60+Number(timePartArr[2]);  
              }else{
                timeInSecs += Number(timePartArr[0])*60+Number(timePartArr[1]);
                
              } 
        }else{
            timeInSecs += timePartArr[0];
        }
    }

    // console.log(timeInSecs);
    // let time = 203355;
    // console.table(videosArr);
    console.log("Total length of playlist : ");    
    totalLength(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 1.25x : ");
    playing1_25(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 1.5x :");
    playing1_5(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 1.75x :");
    playing1_75(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 2x :");
    playing2(timeInSecs);
    console.log("------------------------------------");
    let avgTime = Math.floor(timeInSecs/videoNameElementList.length);
    console.log("Average length of video : ");
    totalLength(avgTime);
    console.log("------------------------------------");

    let folderPath = path.join(__dirname,"Details");
    isDirrectory(folderPath);
    let filePath = path.join(folderPath,"Playlist"+".pdf");
    let text =  JSON.stringify(videosArr);
    let pdfDoc = new pdfkit();
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.text(text);
    pdfDoc.end();

    console.table(videosArr);
})();

function getTimeAndTitle(element1, element2) {
    return {
        time: element1.textContent.trim(),
        title: element2.textContent.trim()
    }
}


// 
const waitTillHTMLRendered = async (page, timeout = 10000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        // console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            // console.log("Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitFor(checkDurationMsecs);
    }
};

function totalLength(timeInSecs){
    
    let secs = timeInSecs % 60;
    let totalMin = Math.floor(timeInSecs/60);
    let min = totalMin % 60;
    let tothrs = Math.floor(totalMin/60);
    let hrs = tothrs%24;
    let days = Math.floor(tothrs/24);
    // console.log(secs);
    // console.log(totalMin);
    // console.log(min);
    // console.log(hrs);
    console.log(days+" Days "+hrs+" hours "+min+" minutes "+secs+" seconds");
}

function playing1_25(timeInSecs){
    let timeIn1_25 = Math.floor(timeInSecs /1.25)
    totalLength(timeIn1_25);
}

function playing1_5(timeInSecs){
    let timeIn1_5 = Math.floor(timeInSecs/1.5); 
    
    totalLength(timeIn1_5);
}

function playing1_75(timeInSecs){
    let timeIn1_75 = Math.floor(timeInSecs/1.75); 
    
    totalLength(timeIn1_75);
}

function playing2(timeInSecs){
    let timeIn2 = Math.floor(timeInSecs/2); 
    
    totalLength(timeIn2);
}

function isDirrectory(folderPath) {
    if(fs.existsSync(folderPath)== false){
        fs.mkdirSync(folderPath);
    }
}