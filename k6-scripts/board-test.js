import http from 'k6/http';
import { sleep, check } from 'k6';

// 📍 테스트 대상 URL
const BASE_URL = 'http://host.docker.internal:3000/board';

// 📊 옵션 설정: 각 테스트 유형 별 시나리오 + 실패 임계점(Thresholds)
export const options = {
  thresholds: {
    // ✅ 전체 테스트 공통 실패 임계점 설정
    'http_req_duration': ['avg<500', 'p(95)<800'], // 평균 500ms, 95퍼센타일 800ms 이내
    'http_req_failed': ['rate<0.05'],              // 실패율 5% 이하
  },

  scenarios: {
    // ✅ 1. Load Test: 서버가 감당할 수 있는 일반적인 부하 확인
    load_test: {
      executor: 'constant-vus',
      exec: 'create',     // 실행 함수명
      vus: 10,            // 동시 사용자 수
      duration: '10s',    // 테스트 시간
    },

    // // ✅ 2. Stress Test: 서버 한계점 탐색 (점진적 증가)
    // stress_test: {
    //   executor: 'ramping-vus',
    //   exec: 'create',
    //   startVUs: 0,
    //   stages: [
    //     { duration: '30s', target: 20 },
    //     { duration: '30s', target: 40 },
    //     { duration: '30s', target: 60 },
    //   ],
    //   gracefulRampDown: '10s',
    //   startTime: '30s', // Load Test 이후 실행
    // },

    // // ✅ 3. Spike Test: 갑작스런 폭발적 부하 발생 시 대응력 확인
    // spike_test: {
    //   executor: 'ramping-vus',
    //   exec: 'create',
    //   startVUs: 0,
    //   stages: [
    //     { duration: '10s', target: 100 },  // 급격히 증가
    //     { duration: '10s', target: 0 },    // 급격히 감소
    //   ],
    //   startTime: '120s', // Stress Test 이후 실행
    // },

    // // ✅ 4. Soak Test: 장시간 동일 부하를 견디는지 확인 (리소스 누수 여부 포함)
    // soak_test: {
    //   executor: 'constant-vus',
    //   exec: 'create',
    //   vus: 10,
    //   duration: '3m',
    //   startTime: '140s', // Spike Test 이후 실행
    // },

    // // ✅ 5. Volume Test: 단시간에 많은 요청을 보낼 때의 처리 성능 확인
    // volume_test: {
    //   executor: 'per-vu-iterations',
    //   exec: 'create',
    //   vus: 20,               // 사용자 수
    //   iterations: 50,        // 사용자당 요청 반복 수
    //   maxDuration: '5m',     // 최대 수행 시간
    //   startTime: '320s',     // Soak Test 이후 실행
    // },
  },
};

// 🧪 공통 요청 함수 (POST /board 요청 및 결과 확인)
export function create() {
  const payload = JSON.stringify({
    title: "test",
    content: "test",
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  // POST 요청
  const res = http.post(BASE_URL, payload, { headers });

  // 요청 결과 체크 (성공 여부 판단)
  check(res, {
    'status is 201': (r) => r.status === 201,                     // 응답코드 201 여부
    'response body contains "test"': (r) => r.body.includes('test'), // 본문에 "test" 포함 여부
  });

  sleep(1); // 부하를 조절하기 위한 1초 슬립
}
