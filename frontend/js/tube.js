
document.addEventListener("DOMContentLoaded", function() {
    // Data for blood group counts (total and donated)
    const data = {
        "A+": { total: 45, donated: 20 },
        "A-": { total: 12, donated: 10 },
        "B+": { total: 46, donated: 32 },
        "B-": { total: 67, donated: 60 },
        "AB+": { total: 12, donated: 9 },
        "AB-": { total: 89, donated: 64 },
        "O+": { total: 34, donated: 12 },
        "O-": { total: 2, donated: 1 }
    };

    // Get the tubes container
    const tubesContainer = document.getElementById("tubes-1");

    // Loop through each blood group data and update the HTML
    Object.keys(data).forEach(bloodGroup => {
        // Create a card for each blood group
        const cardElement = document.createElement("div");
        cardElement.className = "card";

        const details=document.createElement("div");
        details.className="details"

        // Create the tube element for the blood group
        const tubeElement = document.createElement("div");
        tubeElement.className = "tube";
        tubeElement.style.setProperty("--percent", (data[bloodGroup].donated / data[bloodGroup].total) * 100);
        tubeElement.style.setProperty("--fill-color", getRandomColor());

        // Construct the inner HTML of the tube element
        tubeElement.innerHTML = `
            <i class="cap"></i>
            <i class="fill"></i>
            <div class="base">
                <div class="icon"><i class="fa-duotone fa-chart-pie-simple"></i></div>
            </div>`;
        // <div class="text">${bloodGroup}: ${data[bloodGroup].donated}/${data[bloodGroup].total}</div>
            details.innerHTML=`
            <h3>${bloodGroup}</h3>
            <p style="font-weight: bold;"><span style="font-weight: bold; color: #940686">TOTAL REGISTRATION : </span>${data[bloodGroup].total}</p>
            <p style="font-weight: bold;"><span style="font-weight: bold; color: #940686">TOTAL DONATIONS : </span >${data[bloodGroup].donated}</p>
            `
            // Append the details element to the card element
        cardElement.appendChild(details);

        // Append the tube element to the card element
        cardElement.appendChild(tubeElement);

        // Append the card element to the tubesContainer
        tubesContainer.appendChild(cardElement);
    });

    // Function to generate random color
    function getRandomColor() {
        // return "#" + Math.floor(Math.random() * 16777215).toString(16);
        return "#940686"
    }
});