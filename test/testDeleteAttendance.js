import axios from 'axios';

async function testDeleteAttendance() {
  try {
    const studentId = '1006'; // Replace with the student ID you want to delete attendance for

    console.log(`\nAttempting to delete attendance records for student ${studentId}...`);
    
    const response = await axios.delete(`http://localhost:5000/attendance/student/${studentId}`);
    
    if (response.data.success) {
      console.log('Success:', response.data.message);
      console.log(`Number of records deleted: ${response.data.deletedCount}`);
    } else {
      console.log('Operation failed:', response.data.message);
    }

  } catch (error) {
    console.error('Error:', error.response?.data?.message || error.message);
  }
}

testDeleteAttendance();