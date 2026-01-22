import axios from 'axios';

async function testStudentsByModule() {
  try {
    // Test case 1: Valid module code
    console.log('\nTest Case 1: Valid Module Code (CS101)');
    try {
      const response = await axios.get('http://localhost:5000/classes/CS201');
      console.log('Status:', response.status);
      console.log('Students found:', response.data.length);
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test case 2: Invalid module code
    console.log('\nTest Case 2: Invalid Module Code (INVALID123)');
    try {
      const response = await axios.get('http://localhost:5000/classes/INVALID123');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test case 3: Another valid module code
    console.log('\nTest Case 3: Another Module (BUS201)');
    try {
      const response = await axios.get('http://localhost:5000/classes/BUS201');
      console.log('Status:', response.status);
      console.log('Students found:', response.data.length);
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testStudentsByModule();