import axios from 'axios';

async function testClassAndStudents() {
  try {
    // Test case 1: Valid module code with both class and students
    console.log('\nTest Case 1: Valid Module Code (CS301)');
    try {
      const response = await axios.get('http://localhost:5000/classes/CSC301');
      console.log('Status:', response.status);
      console.log('Class Details:', response.data.class);
      console.log('Number of Students:', response.data.students.length);
      console.log('Students:', response.data.students);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test case 2: Module with no class but has students
    console.log('\nTest Case 2: Module with only students (CS102)');
    try {
      const response = await axios.get('http://localhost:5000/classes/CS102');
      console.log('Status:', response.status);
      console.log('Class Details:', response.data.class);
      console.log('Number of Students:', response.data.students.length);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test case 3: Invalid module code
    console.log('\nTest Case 3: Invalid Module Code (INVALID123)');
    try {
      const response = await axios.get('http://localhost:5000/classes/INVALID123');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testClassAndStudents();