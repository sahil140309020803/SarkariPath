import axios from 'axios';

async function test() {
    try {
        const resp = await axios.post('http://localhost:4000/api/exams/ai/generate-question-counts', {
            examName: 'HSSC CET Group D',
            subjects: ['General Knowledge', 'General Science', 'Mathematics', 'English', 'Hindi', 'Haryana GK']
        });
        console.log("Success:", resp.data);
    } catch(e) {
        console.log("Error:", e.response?.data || e.message);
    }
}
test();
