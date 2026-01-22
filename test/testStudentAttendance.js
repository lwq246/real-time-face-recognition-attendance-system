import axios from 'axios';

async function testStudentAttendance() {
  const BASE_URL = 'http://localhost:5000';
  const studentId = '1003'; // Replace with actual student ID

  try {
    // Test Case 1: Get all attendance records
    console.log('\nTest Case 1: Get all attendance records');
    try {
      const response = await axios.get(`${BASE_URL}/student/attendance/${studentId}`);
      console.log('Status:', response.status);
      console.log('Total Classes:', response.data.totalClasses);
      console.log('Present Count:', response.data.presentCount);
      console.log('\nSample Records:');
      response.data.records.slice(0, 6).forEach(record => {
        console.log('\nDate:', record.date);
        console.log('Module:', record.moduleCode, '-', record.moduleName);
        console.log('Status:', record.status);
        console.log('Instructor:', record.instructor);
        console.log('Time:', record.startTime, '-', record.endTime);
      });
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test Case 2: Get attendance with date range
    console.log('\nTest Case 2: Get attendance with date range');
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    try {
      const response = await axios.get(
        `${BASE_URL}/student/attendance/${studentId}`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      console.log('Status:', response.status);
      console.log('Date Range:', startDate, 'to', endDate);
      console.log('Total Classes in Range:', response.data.totalClasses);
      console.log('Present Count in Range:', response.data.presentCount);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

    // Test Case 3: Invalid student ID
    console.log('\nTest Case 3: Invalid Student ID');
    try {
      const response = await axios.get(`${BASE_URL}/student/attendance/invalid123`);
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testStudentAttendance();