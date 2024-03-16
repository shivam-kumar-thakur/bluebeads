document.addEventListener("DOMContentLoaded",async function (){
    await loadBasisInfo();
    loadBloodBanks();
    loadCampInfo();
})

async function loadBasisInfo(){
    // const responseData={
    //     "message": "User details retrieved successfully",
    //     "data": {
    //         "details": {
    //             "_id": "65d258797c2a9af0f3e89996",
    //             "userName": "John Doe",
    //             "bloodGroup": "O+",
    //             "gender": "male",
    //             "dob": "1990-01-01T00:00:00.000Z",
    //             "email": "john@example.com",
    //             "location": {
    //                 "type": "Point",
    //                 "coordinates": [],
    //                 "country": "United States",
    //                 "state": "New York",
    //                 "postalCode": "10000",
    //                 "_id": "65d258797c2a9af0f3e89997"
    //             },
    //             "lastdonation": "2023-12-25T00:00:00.000Z",
    //             "donations": [
    //                 // {
    //                 //     "campId": "65d2709544488101701d2f93",
    //                 //     "requestStatus": 1,
    //                 //     "_id": "65d27932b546b626a5721d71"
    //                 // }
    //             ],
    //             "volunteerExperience": [
    //                 // {
    //                 //     "campId": "65d2709544488101701d2f93",
    //                 //     "requestStatus": 1,
    //                 //     "_id": "65d27910b546b626a5721d67"
    //                 // }
    //             ],
    //             "requests": [
    //                 {
    //                     "requestId": "65d26cb675a85846d96ba76a",
    //                     "requestStatus": 1,
    //                     "_id": "65d26cb775a85846d96ba76d"
    //                 }
    //             ],
    //             "readyToDonate": [],
    //             "createdAt": "2024-02-18T19:20:25.456Z",
    //             "updatedAt": "2024-02-19T04:40:05.131Z",
    //             "__v": 3
    //         }
    //     },
    //     "statuscode": 200,
    //     "success": true
    // };
    
    try{
        const response=await fetch("https://api.bluebeads.shivamkrthakur.in/v1/user/user-profile",{
            method:"GET",
            headers:{
                "Content-Tpye":"application/json"
            }
        })

        const responseData=await response.json();
        console.log(responseData);

        if(responseData.success===false && responseData.message==="User details are incomplete."){
            window.location.href="user-profile-details.html";
       }

       else if(responseData.statuscode===200){

            //load data
            // Update user name
            document.getElementById("userName").innerText = responseData.data.details.userName;

            // Update primary details
            const primaryDetailsOverall = document.getElementById("primary-details-overall");
            const userDetails = responseData.data.details;
            const userDetailsHTML = `
                <p><span class="head-font-2">BLOOD GROUP:</span> ${userDetails.bloodGroup}</p>
                <p><span class="head-font-2">GENDER:</span> ${userDetails.gender}</p>
                <p><span class="head-font-2">Date of Birth:</span> ${userDetails.dob}</p>
                <p><span class="head-font-2">EMAIL:</span> ${userDetails.email}</p>
                <p><span class="head-font-2">LOCATION:</span> ${userDetails.location.state}, ${userDetails.location.country}, ${userDetails.location.postalCode}</p>
                <p><span class="head-font-2">LAST DONATION:</span> ${userDetails.lastdonation}</p>
            `;
            primaryDetailsOverall.innerHTML = userDetailsHTML;

            // load other data
            await loadRequestData(responseData);
            await loadPrimaryInfo(responseData);

       }

       else{
        console.log(responseData);
        window.location.href="login.html";
       }

    } catch(error){
        console.error("Error : ",error.message);
    }
}

async function loadRequestData(responseData){

    const first_action_group=document.getElementById("first-action-group");
    const requestDiv=document.createElement("div");
    requestDiv.classList.add("card","request-donation","primiary-card-info");
    requestDiv.innerHTML=`<p class="head-font">Find Donor</p>
    <hr>
    <!-- <br> -->
    <p>We are here to help YOU!<br>Find your Donor with A.I. help !</p>
    <button class="button-2 btn-pur" onclick="location.href = 'find_donor.html';">Find</button>
    </div>`;

    first_action_group.append(requestDiv);

    for(let i=0;i<responseData.data.details.requests.length;i++){
        const currentRequest=document.createElement("div");
        currentRequest.classList.add("card", "request-donation", "primiary-card-info");
        try{
            console.log(responseData.data);
            console.log(responseData.data.details);
            console.log(responseData.data.details.requests[i]);

            const response2 = await fetch("https://api.bluebeads.shivamkrthakur.in/v1/user/request-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    requestId: responseData.data.details.requests[i].requestId
                })
            });

            const responseData2=await response2.json();
            const userDetails2 = responseData2.data.requestDetails;
            // add all this things.
            currentRequest.innerHTML=`<p class="head-font">Current Request</p>
            <hr>
            <!-- <p>No requests.</p> -->
            <!-- Request Details -->

            <p><span class="head-font-2">Blood Group Needed:</span>${userDetails2.bloodGroup}</p>
            <p><span class="head-font-2">LOCATION:</span>${userDetails2.location.state}, ${userDetails2.location.country}, ${userDetails2.location.postalCode}</p>
            <p><span class="head-font-2">Request Status:</span> Open</p>
             `;
            first_action_group.append(currentRequest);

        }
        catch(error){
            console.error("Error : ",error);
        }

    }


    const previousHistory=document.createElement("div");
    previousHistory.classList.add("card");
    previousHistory.classList.add("request-donation");
    previousHistory.classList.add("primiary-card-info");
    previousHistory.innerHTML=`<p class="head-font">Previous History</p>
    <hr>
    <p>View your previous history of requests.</p>
    <button class="button-1 btn-or">View</button>`;

    first_action_group.append(previousHistory);

}


function loadPrimaryInfo(responseData) {
    if ((responseData.data.details.donations.length === 0) && (responseData.data.details.volunteerExperience.length === 0)) {
        const donation_div = document.getElementById("donation-div");
        const donation_div_innerHTML = `<div class="card request-donation">
            <p class="head-font">Donations Done</p>
            <hr>
            <p>Make your first donation. 1 donation = 4 life.</p>
            <img class="public-welfare-images" src="images/donate-it.jpg" alt="No Data Found" height="200px">
            <button class="button-1 btn-or" onclick="location.href = 'find_ngo.html';">Donate</button>
        </div>
        <div class="card request-donation">
            <p class="head-font">Volunteer Experience</p>
            <hr>
            <p>Be a volunteer for the donation camp. Find nearby camps.</p>
            <center>
                <img class="public-welfare-images" src="images/find-for-volunteer.jpg" alt="No Data Found" height="200px" width="360px">
            </center>
            <button class="button-1 btn-or" onclick="location.href = 'find_ngo.html';">Find</button>
        </div>`;

        donation_div.innerHTML = donation_div_innerHTML;
    } else {
        // Handle other conditions based on your requirements
        const donation_div = document.getElementById("donation-div");
        const h1 = document.createElement("h1");
        h1.innerText = "Second condition";
        donation_div.appendChild(h1);
    }
}


async function loadBloodBanks(){
    // const responseBloodbank=await fetch("",{
    //     method:"GET",
    //     headers:{
    //                 "Content-Tpye":"application/json"
    //             }
    // });
    // const responseBloodbankData=await responseBloodbank.json();
    const blood_banks_div=document.getElementById("blood-banks-div");
    // if(responseBloodbankData){
    for(var i=0;i<2;i++){
        const div=document.createElement("div");
        div.classList.add("card");
        div.classList.add("request-donation");
        div.innerHTML=` <!-- Blood Banks in User's State -->
                <p><span class="head-font-2">NAME:</span>Athma Blood Centre (ABC) - Blood Bank</p>
                <p><span class="head-font-2">LOCATION:</span> Chennai, Tamil Nadu, INDIA 600044</p>
                <p><span class="head-font-2">CONTACT:</span> 095661 54918</p>`;
        blood_banks_div.append(div);
    }
    // }
}

async function loadCampInfo(){
    // const responseCamp=await fetch("",{
    //     method:"GET",
    //     headers:{
    //                 "Content-Tpye":"application/json"
    //             }
    // });
    // const responseCampData=await responseCamp.json();
    const camps_div=document.getElementById("camps-div");
    // if(responseCampData){
        const div=document.createElement("div");
        div.classList.add("card");
        div.classList.add("request-donation");
        div.innerHTML=`<!-- camps in user area -->
                    <p><span class="head-font-2">Camp NAME:</span>Athma Blood Centre (ABC) - Blood Bank</p>
                    <p><span class="head-font-2">NGO:</span>Athma Blood Centre (ABC) - Blood Bank  </p>
                    <p><span class="head-font-2">Description:</span>We ensure adequate supply of safe and quality blood / blood products such as - Whole Blood - Packed Red Cells Concentrate (PRBC) - Fresh Frozen Plasma (FFP) - Cryoprecipitate ( Cryo) - Platelet Concentrate (RDP) - Single Donor Platelet (SDP) - Leuco depleted Platelet - Leuco depleted Red Cells - Irradiated processing charges - Red Cells in SAGM to all needy patients at all times, by motivating volunteers to donate blood, and organizing, conducting voluntary blood donation camps in nearby areas.</p>
                    <p><span class="head-font-2">LOCATION:</span> Chennai, Tamil Nadu, INDIA 600044</p>`;
        camps_div.appendChild(div);
    // }
}

