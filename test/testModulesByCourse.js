import axios from 'axios';

async function testModulesByCourse() {
  try {
    const courses = ["Computer Science", "Business", "Engineering"];

    for (const course of courses) {
      console.log(`\nTesting modules for ${course}:`);
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
        console.error(`Error for ${course}:`, error.response?.data || error.message);
      }
      console.log('------------------------');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testModulesByCourse();