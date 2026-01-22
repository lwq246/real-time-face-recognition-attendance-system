import axios from 'axios';

async function testClassesDates() {
  try {
    // Test case 1: Valid course code
    console.log('\nTest Case 1: Valid Course Code (CSC301)');
    try {
      const response = await axios.get('http://localhost:5000/api/modules/Engineering');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test case 2: Invalid course code
    console.log('\nTest Case 2: Invalid Course Code (INVALID)');
    try {
      const response = await axios.get('http://localhost:5000/classes_dates/INVALID');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test case 3: Another valid course code
    console.log('\nTest Case 3: Another Course (CSC201)');
    try {
      const response = await axios.get('http://localhost:5000/classes_dates/CSC201');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

async function testModules() {
  try {
    const courses = ["Computer Science", "Business", "Engineering"];

    for (const course of courses) {
      console.log(`\n📚 Testing modules for ${course}:`);
      try {
        const response = await axios.get(`http://localhost:5000/modules/${encodeURIComponent(course)}`);
        console.log(`Status: ${response.status}`);
        console.log(`Found ${response.data.length} modules:`);
        response.data.forEach(module => {
          console.log({
            moduleCode: module.moduleCode,
            moduleName: module.moduleName,
            instructor: module.instructor,
            course: module.course
          });
        });
      } catch (error) {
        if (error.response) {
          console.error(`Error for ${course}:`, error.response.data);
          console.error(`Status: ${error.response.status}`);
        } else {
          console.error(`Error for ${course}:`, error.message);
        }
      }
      console.log('------------------------');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testModules();
testClassesDates();