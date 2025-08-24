# Crypto Quant Pipeline Project

당신은 시니어 Python/데이터엔지니어 겸 퀀트 개발자입니다.
목표: pyupbit로 시세를 수집하고 DuckDB/Parquet에 저장한 뒤, 다양한 보조지표를 계산하고 신호를 산출하는 **재현 가능한** 프로젝트를 생성하세요.

## 환경/제약
- Python 3.11, poetry, 라이선스 MIT
- 주요 라이브러리: pyupbit, duckdb, polars 또는 pandas(선택), pydantic-settings, fastapi(선택), uvicorn, sqlalchemy, loguru
- 데이터 저장: Parquet(+zstd), DuckDB 파일(단일 카탈로그)
- 설정: .env + pydantic-settings
- 출력은 "프로젝트 트리", "pyproject.toml", "코드 파일", "예시 .env", "README" 순서로 제시
- 코드 실행 예시는 **bash 명령** 포함(Windows/Powershell 병기 불필요)

## 요구사항
1) 자산/범위
- 기본 마켓: **KRW**
- 심볼 소스: pyupbit tickers에서 **전일/당일 거래대금 상위 N=30**, 제외 규칙: **UPBIT 스테이킹/레버리지 토큰, 유동성 부족 종목(예: 24시간 거래대금 1억 미만) 제외**

2) 수집
- 캔들 주기: **5m, 15m, 1h, 4h, 1d**
- 히스토리: **최근 120일**
- 갱신: **5분마다 배치 실행, API 요청 실패 시 3회 재시도 (지수 백오프 적용)**

3) 저장/스키마
- Parquet 파티션: `symbol={sym}/timeframe={tf}/date={YYYY-MM-DD}`
- Parquet 옵션: compression=`zstd`, row_group_size= **압축: zstd, row_group_size: 1048576, statistics: true**
- DuckDB: **DB 파일: data/market.db
VIEW: 모든 parquet 파일을 통합 조회하는 `candles` 뷰 생성
정렬키(Z-Order 대용): `(symbol, timeframe, datetime)` 순으로 데이터 정렬 후 저장**

4) 보조지표
- 필수 지표: **SMA, EMA, VWAP, RSI, MACD, Bollinger Bands**
- 파라미터: **전역 기본값 사용 (RSI=14, EMA=12,26 등). 종목/주기별 override는 향후 YAML 파일로 확장 가능하도록 설계**
- 계산 엔진: **Polars/Pandas**, 누락 캔들 보정 로직 포함

5) 신호/전략(선택)
- 규칙: **VWAP 괴리율 ∈ [0.2%, 1.0%] AND RSI < 45 AND 거래량 상위 30**
- 리스크: **Stop-Loss: 2%, Take-Profit: 5%, Max Drawdown(계좌 기준): 10%, 1회 포지션 크기(자산 대비): 5%**
- 비용 가정: **수수료: maker/taker 0.05%, 슬리피지: 0.1%**

6) CLI/서버
- CLI: `fetch, indicators, signals, serve`
- FastAPI(선택): **활성화. 엔드포인트:
/symbols (전체 심볼 목록)
/candles/{symbol}/{timeframe} (특정 캔들 + 지표)
/signals (현재 신호 발생 종목)**
- 스케줄러: **External**
- 응답 스키마와 예제 포함

7) 설정/배포/테스트
- `.env.example`와 pydantic settings 클래스 제공: **UPBIT_MARKETS, TOP_N, HISTORY_DAYS, DUCKDB_PATH**
- pytest: **pytest 사용. 샘플 parquet 파일 기반으로 지표 계산 결과 스냅샷 테스트**
- 로깅/배포: **로컬 실행을 기본 타겟으로 함. Dockerfile 포함하여 재현성 확보. JSON 구조화 로깅(loguru), 파일 회전(10MB) 적용**

8) 성능/신뢰성
- 성능 목표: **KRW 마켓 전체(약 100개) * 5개 주기 기준 5분 내 데이터 수집 및 지표 계산 완료**
- 신뢰성: **데이터 수집/저장은 idempotent하게 구현. 손상된 parquet 파일은 자동 격리. 시가/종가 0, 거래량 음수 등 데이터 품질 검증 규칙 포함**

## 산출물 품질 기준
- 코드 100% 실행 가능, 의존성 명시, 예외 처리 포함
- 대용량 처리 고려(벡터화/증분 저장/idempotent)
- README에 설치/실행/트러블슈팅/확장 지침 포함
- ❗데이터 손상/누락/시간대 불일치 방지 로직 포함

## 예시 커맨드
```bash
poetry new ta-pipeline && cd ta-pipeline
poetry add pyupbit duckdb polars pydantic-settings fastapi uvicorn sqlalchemy loguru
poetry run python -m app.cli fetch --market KRW --timeframes 5m 15m --history-days 120
poetry run python -m app.cli indicators --timeframes 5m 15m --indicators rsi,ema,vwap
poetry run python -m app.cli signals --rule vwap_gap_rsi
poetry run uvicorn app.api:app --reload
```

## 수락 기준(AC)
* `poetry run ...`로 예제 명령 실행 시 오류 없이 데이터 수집 → parquet 저장 → 지표 계산 → DuckDB 쿼리 가능
* VWAP 괴리율 신호 예제가 정상 동작하고, 결과가 FastAPI `/signals`로 조회 가능
