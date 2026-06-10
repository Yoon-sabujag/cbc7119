// POST /api/database/restore — SQL 파일로 D1 데이터베이스 복원
import type { Env } from '../../_middleware'

// 백업 SQL 을 statement 단위로 분리하는 토크나이저.
// 단순 split(';') + 라인 주석 필터는 두 가지를 깨뜨린다:
//  (1) 백업이 테이블마다 `-- ── 이름 ──` 주석 뒤에 DROP 을 두므로 [; ~ ;] 청크가
//      주석으로 시작 → DROP 전체가 조용히 버려짐
//  (2) 값 안의 세미콜론/줄바꿈/`--` 에서 INSERT 가 쪼개져 행이 유실됨
// 규칙:
//  - '…' 리터럴 내부는 그대로 통과 ('' 이스케이프 유지), "…" 인용 식별자도 동일
//  - 리터럴 밖의 `--` 는 줄 끝까지 주석
//  - 리터럴 밖의 `;` 에서만 분리하되, CREATE TRIGGER 본문(BEGIN…END)의 `;` 는
//    statement 의 일부 — BEGIN/CASE…END 깊이를 추적해 END 이후의 `;` 에서 분리
export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  const n = sql.length
  let buf = ''
  let i = 0
  let isTrigger = false // 현재 statement 가 CREATE [TEMP] TRIGGER 인지
  let depth = 0 // 트리거 안 BEGIN/CASE…END 중첩 깊이

  const flush = () => {
    const stmt = buf.trim()
    if (stmt) statements.push(stmt)
    buf = ''
    isTrigger = false
    depth = 0
  }

  while (i < n) {
    const ch = sql[i]

    if (ch === "'" || ch === '"') {
      // 닫는 따옴표까지 통째로 복사 — 이중 따옴표('' / "")는 이스케이프
      let j = i + 1
      while (j < n) {
        if (sql[j] === ch) {
          if (sql[j + 1] === ch) {
            j += 2
            continue
          }
          break
        }
        j++
      }
      buf += sql.slice(i, Math.min(j + 1, n))
      i = j + 1
      continue
    }

    if (ch === '-' && sql[i + 1] === '-') {
      // 주석: 줄 끝까지 스킵 (개행 문자는 다음 루프에서 buf 에 들어감)
      const nl = sql.indexOf('\n', i)
      i = nl === -1 ? n : nl
      continue
    }

    if (ch === ';') {
      if (isTrigger && depth > 0) {
        buf += ch
        i++
        continue
      }
      flush()
      i++
      continue
    }

    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1
      while (j < n && /[A-Za-z0-9_]/.test(sql[j])) j++
      const word = sql.slice(i, j)
      const upper = word.toUpperCase()
      if (sql[i - 1] !== '.') {
        // `.end` 같은 컬럼 접근은 키워드가 아님
        if (upper === 'TRIGGER' && /^CREATE(\s+TEMP(ORARY)?)?$/i.test(buf.trim())) {
          isTrigger = true
        } else if (isTrigger && (upper === 'BEGIN' || upper === 'CASE')) {
          depth++
        } else if (isTrigger && upper === 'END') {
          depth--
        }
      }
      buf += word
      i = j
      continue
    }

    buf += ch
    i++
  }
  flush()
  return statements
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 복원할 수 있습니다' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ success: false, error: 'SQL 파일이 없습니다' }, { status: 400 })

  const sql = await file.text()
  if (!sql.includes('CHA Bio Safety DB Backup'))
    return Response.json({ success: false, error: '유효한 백업 파일이 아닙니다' }, { status: 400 })

  const statements = splitSqlStatements(sql)
  if (statements.length === 0)
    return Response.json({ success: false, error: '백업 파일에 실행할 SQL 이 없습니다' }, { status: 400 })

  // 실행 전 단계별 재정렬: 백업은 테이블을 알파벳순으로 [DROP→CREATE→INSERT]
  // 인터리브해 덤프하므로, 파일 순서 그대로면 자식 테이블의 INSERT 가 부모 테이블의
  // CREATE 보다 먼저 실행된다 (예: check_records→staff). 빈 DB(재해 복구)에서는
  // "no such table" 로 즉사한다. DROP 전부 → CREATE TABLE 전부 → INSERT 전부 →
  // 나머지(인덱스/뷰/트리거) 순서로 돌리면 FK 행 검증만 남고, 그건 아래
  // defer_foreign_keys 가 커밋 시점까지 미뤄준다.
  const drops: string[] = []
  const creates: string[] = []
  const inserts: string[] = []
  const post: string[] = []
  for (const stmt of statements) {
    if (/^DROP\s/i.test(stmt)) drops.push(stmt)
    else if (/^CREATE\s+TABLE/i.test(stmt)) creates.push(stmt)
    else if (/^INSERT\s/i.test(stmt)) inserts.push(stmt)
    else post.push(stmt)
  }
  const ordered = [...drops, ...creates, ...inserts, ...post]

  // 구버전 백업 파일 감지: 인덱스/트리거 재생성 구문이 없는 백업을 복원하면
  // DROP TABLE 이 부속 인덱스·트리거(개소명 동기화 등)를 지운 채 끝나
  // success 인데도 조용히 소실된다 — 사용자에게 알려야 한다.
  const hasSchemaObjects = post.some(s => /^CREATE\s+(UNIQUE\s+)?(INDEX|TRIGGER|VIEW)\b/i.test(s))
  const warning = hasSchemaObjects
    ? undefined
    : '구버전 백업 파일입니다: 인덱스/트리거 재생성 구문이 없어 복원 과정에서 소실됩니다. 복원 후 인덱스/트리거 상태를 점검하고 즉시 새 백업을 받아두세요.'

  // 전체를 단일 batch(=단일 트랜잭션)로 실행:
  //  - statement 별 개별 실행은 Workers 서브리퀘스트 한도(호출당 1,000 쿼리)에 걸려
  //    수천 행 DB 복원이 불가능. batch() 1회 = 쿼리 1회.
  //  - 여러 청크로 나누면 각 청크가 독립 커밋되어 defer_foreign_keys(트랜잭션 단위)가
  //    청크 경계를 넘는 FK 를 못 지킨다 — 드리프트된 DB 복원이 중간 커밋에서 깨지고
  //    부분 복원 상태로 남는다. 단일 트랜잭션이면 복원은 원자적: 전부 성공 아니면
  //    전부 롤백이라 어중간한 DB 상태가 생기지 않는다.
  let executed = 0
  let firstError: string | null = null
  try {
    await env.DB.batch([
      env.DB.prepare('PRAGMA defer_foreign_keys = true'),
      ...ordered.map(s => env.DB.prepare(s)),
    ])
    executed = ordered.length
  } catch (e: any) {
    firstError = e?.message ?? String(e)
    console.error(`Restore failed (rolled back, ${ordered.length} stmts): ${firstError}`)
  }

  if (firstError)
    return Response.json(
      {
        success: false,
        error: `복원 실패 — 전체 롤백됨 (DB 는 복원 전 상태 그대로): ${firstError}`,
        data: { executed: 0, errors: ordered.length, total: ordered.length, firstError },
      },
      { status: 500 }
    )

  return Response.json({
    success: true,
    data: { executed, errors: 0, total: ordered.length, warning },
  })
}
