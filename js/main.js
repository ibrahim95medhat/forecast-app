// https://api.weatherapi.com/v1/forecast.json?key=e6fab524e7ea4760a0c52819230608&q=${cityCode}&days=7
let searchInput=document.querySelector("#search");
let baseUrl="https://api.weatherapi.com/v1/forecast.json";
let apiKey="5b64bf743f4c41dba90145744232608";
let weatherDataElement=document.querySelector(".weather-data");
let weatherData
let defaultLocation='Egypt,cairo';
let searchedLocation=document.querySelector(".searched-location");
let recentCityUrl;
let recentCityUrlArr=[];
let displayedCityUnderPhoto;
let displayedCityUnderPhotoArr=[];
let flag=1;
let deleteBtn=document.querySelector(".delete")
let citiesPics=document.querySelector("#cities-pic");
//self invoked fn get the pic of the city in the searched bar

(async  function (){
console.log()
    if(JSON.parse(localStorage.getItem("cities")) !==null){
        recentCityUrlArr=JSON.parse(localStorage.getItem("cities"));
        displayedCityUnderPhotoArr=JSON.parse(localStorage.getItem("countries"))
        for (const [index,recentCityUrl] of recentCityUrlArr.entries()) {
            displayCitiesPhotos(recentCityUrl,displayedCityUnderPhotoArr[index]);
        }
        
    }
    else{
        ZeroStartFn();
        async function ZeroStartFn(){
        recentCityUrl= await getCitiesPhotoUrl (searchedLocation.innerHTML||defaultLocation);
        displayCitiesPhotos(recentCityUrl,searchedLocation.innerHTML||defaultLocation);
        addDisplayedCityUnderPhotoArrToLocalStorage(searchedLocation.innerHTML||defaultLocation)
        addingInLocalStorage(recentCityUrl);    
        }
        
    }

       
    }
)();

// event

searchInput.addEventListener("blur",async (e)=>{
    let location=e.target.value;
  weatherData =await gettingWeatherData(location);
    if(weatherData !==undefined)
        {
        // clear display area each time to avoid repeating forecast data
        weatherDataElement.innerHTML="";
        // put the name of  searched city in the header
        searchedLocation.innerHTML=`${weatherData.location.country},${weatherData.location.name}`
        // call fn of display
        displayData(weatherData);
        // get photo for the city which the user requested forecast data about it
        recentCityUrl=await getCitiesPhotoUrl (location);
        // display photo for searched city in the photos display area
       
       for (const [index,eachdisplayedCityUnderPhoto] of displayedCityUnderPhotoArr.entries()) {
        if( eachdisplayedCityUnderPhoto.toLowerCase().includes(location.toLowerCase())){
            console.log("in");
           flag=0 ;
           
       }
     
    }
       
        
     if (flag){
        console.log("display");
        displayCitiesPhotos(recentCityUrl,`${weatherData.location.country},${weatherData.location.name}`);
           // add to ;ocal storage
           addDisplayedCityUnderPhotoArrToLocalStorage(`${weatherData.location.country},${weatherData.location.name}`)
        
           // adding array of cities photos in local storage
           addingInLocalStorage(recentCityUrl);
     }
               
    
        // clear search input after blur
        searchInput.value='';
        flag=1;
        }
   
})

// -----------------------------------------------------------------------
// getting data bfrom api
async function gettingWeatherData(location)
{
    let res=await fetch(`${baseUrl}?key=${apiKey}&q=${location}&days=7`);
    if(res.status!==200)
    {
        let modal=document.querySelector(".modal");
        let body=document.querySelector("body");
        let modalBackdrop=document.querySelector(".modal-backdrop");
        let closeBtn=document.querySelector(".modal-footer button");
        modal.classList.add("show");
        modal.style="display:block";
        modal.setAttribute("role","dialog");
        body.classList.add("modal-open");
        body.style="overflow:hidden;padding-right:12px;"
        modalBackdrop.classList.remove("d-none");
        closeBtn.addEventListener("click",(e)=>{
            modal.classList.remove("show");
            modal.style="display:none";
            modal.removeAttribute("role");
            body.classList.remove("modal-open");
            body.style="overflow:auto;padding-right:0;"
            modalBackdrop.classList.add("d-none");
            searchInput.value="";
        })
        return
    }
        res=await res.json()
        console.log(res)
        return res
}

// getting weather through location success fn
async function success(position){
let coordinates=`${position.coords.latitude},${position.coords.longitude}`
 weatherData=await gettingWeatherData(coordinates);
 displayData(weatherData);
 searchedLocation.innerHTML=`${weatherData.location.country},${weatherData.location.name}`;
}

// getting weather default location cairo fail to get location
async function fail (){
   weatherData= await gettingWeatherData(defaultLocation);
    displayData(weatherData);
        searchedLocation.innerHTML=defaultLocation
    
}


// display forecast data from api
function displayData(data){
// save object in local storage

    let cardArr;
    let hourArr;
    let cardHeaderArr;
    let rainBlockPercentageArr=document.querySelectorAll(".rain-block-percentage")
    const now=new Date();
    const forecastDays=data.forecast.forecastday;
    let day;
    let temp;
    let chanceOfRain;
    let clock=document.querySelectorAll("#clock");
   
 for (const [index,eachDayData] of forecastDays.entries()) {
     day=new Date(eachDayData.date).toLocaleDateString("en-us",{weekday:"short"});
     temp=eachDayData.hour[now.getHours()].temp_c

    weatherDataElement.innerHTML+=`
<div class="card rounded-5 m-2 ${index===0 ? "active":""}">
<div class="card-header d-flex justify-content-between"><div class="day">${day}</div> <div class="hour"> ${now.getHours()} : ${now.getMinutes()} ${now.getHours() > 11 ? "PM" : "AM"}</div></div>
<div class="card-body"><div><h3>${temp} <sup>o</sup>C</h3><div class="weather-icon"><img class="w-25" src=${eachDayData.day.condition.icon}></div></div>
</div>
<div class="wind text-center">wind ${eachDayData.hour[now.getHours()].wind_kph} Kph</div>
<div class="humadity text-center">humidity ${eachDayData.hour[now.getHours()].humidity}</div>
<div></div>
</div>`
 cardArr=document.querySelectorAll(".card");
 hourArr=document.querySelectorAll(".hour");
 cardHeaderArr=document.querySelectorAll(".card-header");
if(!(cardArr[index].classList.contains("active"))){
hourArr[index].classList.add("d-none");
cardHeaderArr[index].classList.replace("justify-content-between","justify-content-center");
}
else{
    chanceOfRain=forecastDays[index];
   
    for (const [index,eachclock] of clock.entries()) {
    let percentageOfRain= 100-chanceOfRain.hour[eachclock.dataset.clock].chance_of_rain;
    rainBlockPercentageArr[index].style=`height:${percentageOfRain}%`
       
    }
}


 }
 
//  cardArr=Array.from(cardArr)
 for (const [index,eachCard] of cardArr.entries()) {
    eachCard.addEventListener("click",(e)=>{
    for (const eachCard of cardArr) {
        eachCard.classList.remove("active")
    }
    eachCard.classList.add("active");
    chanceOfRain=forecastDays[index];
   
for (const [index,eachclock] of clock.entries()) {
let percentageOfRain= 100-chanceOfRain.hour[eachclock.dataset.clock].chance_of_rain;
rainBlockPercentageArr[index].style=`height:${percentageOfRain}%`
   
}
   })
 }
}
// get cities photos from api
async function getCitiesPhotoUrl (city){

    let baseUrl=`https://api.unsplash.com/search/photos?page=3&query=${city}&client_id=`
    let apiKey="XAgzvkEYdN8vPPyA_XzCuIagSPOVKPcajOwrI9-1iAI";

let res=await fetch(baseUrl+apiKey);
    res=await res.json();
let i;
i=Math.trunc(Math.random()*5);
    return res.results[i].urls.regular
}
// dispaly cities photos
function displayCitiesPhotos(picUrl,country){

citiesPics.innerHTML+=`

<div class="city-image-cont rounded-5 mx-4">
<div class="overflow-hidden"><img class="city-image " src=${picUrl}></div>

<h6 class="text-center">${country}</h6>
</div>

`
}

// adding displayed forecast data in local storage

// local storage
function addDisplayedCityUnderPhotoArrToLocalStorage(country){
    displayedCityUnderPhotoArr.push(country)
    localStorage.setItem("countries",JSON.stringify(displayedCityUnderPhotoArr));
    
}

// adding urls in local storage
function addingInLocalStorage(url){
recentCityUrlArr.push(url);
localStorage.setItem("cities",JSON.stringify(recentCityUrlArr))
}


// get urls from local storage
function getFromLocalStorage(){
    console.log(JSON.parse(localStorage.getItem("cities")));

}

// onload check location

window.addEventListener("load",()=>{
    navigator.geolocation.getCurrentPosition(success,fail)
})


// on click on delete all pics will be deleted

deleteBtn.addEventListener("click",()=>{
citiesPics.innerHTML='';
localStorage.setItem("cities",null)
localStorage.setItem("countries",null)
})
 

