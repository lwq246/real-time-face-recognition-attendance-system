import axios from 'axios';

async function testClassDates() {
  try {
    // First get all courses
    const coursesResponse = await axios.get('http://localhost:5000/courses');
    console.log('\nAvailable Courses:');
    coursesResponse.data.forEach(course => {
      console.log(`${course.courseCode}: ${course.courseName}`);
    });

    // Test with first course's code
    const firstCourse = coursesResponse.data[0];
    if (firstCourse) {
      console.log(`\nTesting dates for ${firstCourse.courseCode}:`);
      try {
        const datesResponse = await axios.get(`http://localhost:5000/classes/${firstCourse.courseCode}/dates`);
        console.log('Available dates:', datesResponse.data);
      } catch (error) {
        console.log('Error fetching dates:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testClassDates();