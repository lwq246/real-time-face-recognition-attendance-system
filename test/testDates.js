import axios from 'axios';

async function testClassDates() {
  try {
    // Test with CSC301 (Web Development)
    console.log('\nTesting CSC301:');
    const response1 = await axios.get('http://localhost:5000/classes/CSC301/all_dates');
    console.log('Dates for CSC301:', response1.data);

    // Test with CSC201 (Database)
    console.log('\nTesting CSC201:');
    const response2 = await axios.get('http://localhost:5000/classes/CSC201/all_dates');
    console.log('Dates for CSC201:', response2.data);

  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testClassDates();