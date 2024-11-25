const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // CORS 모듈 불러오기
const app = express();
const PORT = 3000;

// CORS 미들웨어 사용
app.use(cors());
app.use(express.json());

// JSON 파일 경로
const dataFilePath = path.join(__dirname, 'diseases.json');

// 기본 경로 처리기 추가
app.get('/', (req, res) => {
    res.send('Welcome to the Disease API!');
});

// JSON 데이터 조회 API
app.get('/api/diseases', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: '파일을 읽는 중 오류 발생' });
        }
        const diseases = JSON.parse(data);
        res.json(diseases);
    });
});

// 증상에 대한 추천 API
app.post('/api/recommendations', (req, res) => {
    const symptoms = req.body.symptoms;
    console.log('받은 증상:', symptoms);

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: '파일을 읽는 중 오류 발생' });
        }

        const diseases = JSON.parse(data);
        const matchingDiseases = [];

        diseases.forEach(disease => {
            const matchedSymptoms = disease.symptoms.filter(symptom => symptoms.includes(symptom));
            if (matchedSymptoms.length > 0) {
                matchingDiseases.push({
                    name: disease.name, 
                    matchedSymptoms: matchedSymptoms,
                    description : disease.description, 
                    recommended_action: disease.recommended_action
                });
            }
        });

        if (matchingDiseases.length > 0) {
            res.json({ diseases: matchingDiseases });
        } else {
            res.json({ message: '매칭되는 병이 없습니다.' });
        }
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
