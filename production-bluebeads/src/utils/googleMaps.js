import axios from 'axios';

const fetchLocationDetails = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data && data.address) {
            const { country, state, postcode } = data.address;
            return { country, state, postalCode: postcode };
        } else {
            throw new Error('Unable to fetch location details from OpenStreetMap Nominatim API');
        }
    } catch (error) {
        throw new Error('Error fetching location details from OpenStreetMap Nominatim API: ' + error.message);
    }
};

export { fetchLocationDetails };
