document.addEventListener("DOMContentLoaded",async function ()=>{

})

async function loadInfo(){

    try{

        const response=await fetch();
        const responseData=await response.json();

        
    }catch(error){
        console.error("Error : ",error.message);
    }

    
    const camp_primary_info_HTML=`<p><span class="head-font-2">Camp Description:</span>Prayas Foundation, Renukoot is a group of people who have pledged themselves for fulfilling the shortage of blood & components to the needful as soon as possible.</li>
    <p><span class="head-font-2">Donation Period:</span>  FROM 04-15-2015 to Present</li>
    <p><span class="head-font-2">Donation Time:</span>FROM 8:00 AM to 10:00 PM</li>
    <p><span class="head-font-2">NGO Page</span> <a href="#">visit now</a></li>`;
    document.getElementById("camp-primary-info").innerHTML=camp_primary_info_HTML;
}