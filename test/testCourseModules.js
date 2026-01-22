import axios from 'axios';

async function testCourseModules() {
  try {
    const courses = ["Computer Science", "Business", "Engineering"];

    for (const course of courses) {
      console.log(`\nTesting modules for ${course}:`);
      try {
        const response = await axios.get(`http://localhost:5000/classes/${encodeURIComponent(course)}`);
        console.log(`Status: ${response.status}`);
        console.log(`Found ${response.data.length} modules:`);
        response.data.forEach(module => {
          console.log({
            moduleCode: module.moduleCode,
            course: module.course,
            date: module.date,
            time: `${module.startTime}-${module.endTime}`,
            location: module.location
          });
        });
      } catch (error) {
        console.error(`Error for ${course}:`, error.response?.data || error.message);
      }
      console.log('------------------------');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCourseModules();