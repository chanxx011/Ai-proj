let selectedSymptoms = [];

function selectSymptom(symptom) {
    const symptomIndex = selectedSymptoms.indexOf(symptom);

    // 증상이 선택된 경우 삭제
    if (symptomIndex > -1) {
        selectedSymptoms.splice(symptomIndex, 1); // 선택된 증상 제거
    } else {
        selectedSymptoms.push(symptom); // 선택되지 않은 증상 추가
    }

    console.log('선택된 증상:', selectedSymptoms); // 디버깅용 콘솔 로그
    document.getElementById("selected-symptoms").innerText = selectedSymptoms.join(', ');
    document.getElementById("symptom-summary").style.display = selectedSymptoms.length > 0 ? 'block' : 'none'; // 증상이 없으면 요약 숨기기
}

// 카테고리 토글 함수
function toggleCategory(categoryId) {
    // 선택한 카테고리
    const selectedCategory = document.getElementById(categoryId);

    // 현재 보이는 상태라면 숨김
    if (selectedCategory.style.display === 'block' || selectedCategory.style.display === '') {
        selectedCategory.style.display = 'none';
        return;
    }

    // 다른 모든 카테고리를 숨김
    const categories = document.querySelectorAll('.symptom-category');
    categories.forEach(category => {
        category.style.display = 'none';
    });

    // 선택한 카테고리만 표시
    selectedCategory.style.display = 'block';
}


function checkSymptomMatch(diseases) {
    const matchedDiseasesDiv = document.createElement('div');
    matchedDiseasesDiv.id = 'matched-diseases';

    let matchedHTML = '<h3>⚠️증상이 3개 이상 일치하는 질병⚠️:</h3><ul>';

    diseases.forEach(disease => {
        if (!disease.matchedSymptoms || !Array.isArray(disease.matchedSymptoms)) {
            console.error(`질병 데이터에 증상 정보가 없거나 올바르지 않습니다: ${disease.name}`);
            return; // 증상 정보가 없으면 무시
        }

        // 일치하는 증상의 수를 가져옴
        const matchCount = disease.matchedSymptoms.length;

        console.log(`질병: ${disease.name}, 일치하는 증상 수: ${matchCount}`);

        // 3개 이상의 증상이 일치하면 표시할 HTML 생성
        if (matchCount >= 3) {
            matchedHTML += `
                <li>
                    <strong>${disease.name}</strong> - 관련 증상: ${disease.matchedSymptoms.join(', ')}
                    <p>설명: ${disease.description}</p>
                    <p>조치: ${disease.recommended_action}</p>
                </li>`;
        }
    });

    matchedHTML += '</ul>';

    // 3개 이상 일치하는 질병이 있으면 해당 HTML을 추가
    matchedDiseasesDiv.innerHTML = matchedHTML;

    // 기존 결과가 있으면 삭제 후 새로 추가
    const existingMatchedDiseases = document.getElementById('matched-diseases');
    if (existingMatchedDiseases) {
        existingMatchedDiseases.remove();
    }

    const appDiv = document.getElementById('app');
    appDiv.appendChild(matchedDiseasesDiv);
}

async function getRecommendations() {
    const response = await fetch('http://localhost:3000/api/recommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
    });

    const data = await response.json();
    console.log('서버 응답:', data); // 서버 응답 디버깅용 콘솔 로그 추가

    const resultDiv = document.createElement('div');
    resultDiv.id = 'result';

    if (data.diseases && data.diseases.length > 0) {
        let resultHTML = '<hr><h3>추측된 병명:</h3><ul>';
        data.diseases.forEach(disease => {
            resultHTML += `<li><strong>${disease.name}</strong> - 관련 증상 : ${disease.matchedSymptoms ? disease.matchedSymptoms.join(', ') : '증상 데이터 없음'}</li>`;
            resultHTML += `<p>설명 : ${disease.description || '설명 없음'}</p>`;
            resultHTML += `<p>조치 : ${disease.recommended_action || '조치 정보 없음'}</p>`;
        });
        resultHTML += '</ul>';
        resultDiv.innerHTML = resultHTML;

        // 3개 증상 일치 여부 확인 후 아래에 추가
        checkSymptomMatch(data.diseases);
    } else {
        resultDiv.innerHTML = `<p>${data.message}</p>`;
    }

    const appDiv = document.getElementById('app');
    const existingResult = document.getElementById('result');
    if (existingResult) {
        appDiv.removeChild(existingResult);
    }
    appDiv.appendChild(resultDiv);
}





function showEmergencyHelp() {
    document.getElementById('patient-status-selection').style.display = 'block';
}

function handlePatientStatus() {
    const checkboxes = document.querySelectorAll('input[name="status"]:checked');
    const selectedStatuses = [];

    checkboxes.forEach((checkbox) => {
        selectedStatuses.push(checkbox.value);
    });

    // 상태에 따른 응급조치
    let emergencyMessage = "선택된 상태: " + selectedStatuses.join(', ') + "\n\n";

    if (selectedStatuses.includes("호흡 곤란")) {
        emergencyMessage += `
🚨 응급상황 대처 방법:
호흡 곤란
조치: 환자의 머리를 뒤로 젖히고 기도를 확보합니다.
추가 조치:
환자가 편안한 자세를 취할 수 있도록 도와주세요.
필요하다면, 즉시 119에 연락하여 구급대를 요청하세요.
환자가 알레르기 반응이나 천식 발작이 의심될 경우, 본인이 사용하던 흡입기를 사용할 수 있도록 합니다.`;
    } else if (selectedStatuses.includes("의식 없음")) {
        emergencyMessage += `
🚨 응급상황 대처 방법:
의식 없음
조치: 즉시 심폐소생술(CPR)을 시작하고 119에 연락하세요.
구체적인 CPR 방법:
환자를 평평한 곳에 눕히고, 주먹으로 손이 겹치게 하고 가슴 중앙에 놓습니다.
약 56cm 깊이로 분당 100120회의 속도로 압박합니다.
30회의 압박 후, 기도를 확보하고 2회의 인공호흡을 실시합니다. 이 과정을 계속 반복합니다.`;
    } else if (selectedStatuses.includes("출혈")) {
        emergencyMessage += `
🚨 응급상황 대처 방법:
출혈
조치: 출혈 부위를 압박하여 지혈을 시도하세요.
추가 방법:
깨끗한 천이나 붕대를 사용해 출혈 부위를 직접 누릅니다.
심한 출혈일 경우 응급 지혈대를 사용할 수 있습니다. 지혈대를 사용할 때는 너무 세게 조여 혈액 순환에 문제가 생기지 않도록 주의해야 합니다.
119에 즉시 연락하여 추가 치료를 요청하세요.`;
    } else if (selectedStatuses.includes("가슴 통증")) {
        emergencyMessage += `
🚨 응급상황 대처 방법:
가슴 통증
조치: 가능한 한 편안하게 눕게 하고 즉시 119에 연락하세요.
추가 조치:
환자를 편안한 자세로 눕히고, 불안해 하지 않도록 안정감을 주며 진정시키세요.
필요하면 질식이나 심장 마비의 징후인지 확인합니다.
의사와 상담하거나 심장과 관련된 증상이 의심될 경우 즉시 병원으로 이송해야 합니다.`;
    } else {
        emergencyMessage += `
🚨 응급상황 대처 방법:
조치 불가한 경우
조치: 어떤 조치를 취해야 할지 알 수 없을 때는, 119에 즉시 연락하여 전문 의료인의 도움을 받는 것이 중요합니다.`;
    }

    alert(emergencyMessage);

    // 선택된 체크박스 리셋
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });

    // 상태 선택창 숨기기
    document.getElementById('patient-status-selection').style.display = 'none';
}
