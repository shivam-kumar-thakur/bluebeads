document.getElementById("submit-btn").addEventListener("click", async (event) => {
    try {
        event.preventDefault(); // Prevent form submission

        const name = document.getElementById("name").value;
        const bloodGroup = document.getElementById("blood").value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const location = document.getElementById("location").value;
        const dob = document.getElementById("dob").value;
        const email = document.getElementById("email").value;

        // Convert dob to a valid date format
        const dobDate = new Date(dob);
        const formattedDob = dobDate.toISOString().substring(0, 10); // Format dob as YYYY-MM-DD

        // Construct the data object
        const data = {
            userName: name,
            bloodGroup,
            gender,
            "location": {
                "latitude": "51.5074",
                "longitude": "-0.1278"
            },
            dob,
            email,
            last_donation_date: formattedDob // Set last_donation_date to the formatted dob
        };

        // Make POST request to the API endpoint
        const response = await fetch("https://api.bluebeads.shivamkrthakur.in/v1/user/user-details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Handle response
        const responseData = await response.json();
        console.log("Response Data:", responseData);
        if (responseData.statuscode === 201) {
            console.log("Data submitted successfully");
            window.location.href = "user-profile.html"; // Redirect to user profile page
        } else {
            console.error("Failed to submit data",responseData);
            // Handle error scenario
        }

    } catch (error) {
        console.error("An error occurred:", error);
        // Handle error scenario
    }
});
