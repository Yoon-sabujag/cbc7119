"""
CHA Bio Complex 파일 자동 분류 프로그램
- 시작 시 웹앱 자동 실행
- 다운로드 폴더 감시 → 파일명 패턴 매칭 → 지정 폴더로 자동 이동
- 년/월 하위 폴더 자동 생성
- 시스템 트레이 상주
"""

import os
import sys
import re
import json
import time
import shutil
import webbrowser
import threading
from pathlib import Path
from datetime import datetime

# --- watchdog 라이브러리 ---
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- 시스템 트레이 ---
import pystray
from PIL import Image, ImageDraw

# ── 설정 파일 경로 ──────────────────────────────────────
APP_NAME = "CHA Bio 파일 분류"
CONFIG_DIR = Path.home() / ".cha-bio-watchdog"
CONFIG_FILE = CONFIG_DIR / "config.json"
WEB_APP_URL = "https://cbc7119.pages.dev"

# ── 파일명 패턴 정의 ────────────────────────────────────
# 각 패턴: (정규식, 카테고리키, 년/월 추출 함수)
FILE_PATTERNS = [
    # Excel - 점검일지 종합 ZIP
    {
        "pattern": r"^(\d{4})년도 점검일지 종합 \((\d{2})월 업데이트\)\.zip$",
        "key": "inspection_zip",
        "label": "점검일지 종합",
        "extract": lambda m: (m.group(1), m.group(2)),
    },
    # Excel - DIV 점검표
    {
        "pattern": r"^(\d{4})년도_DIV점검표_.+\.xlsx$",
        "key": "div_inspection",
        "label": "DIV 점검표",
        "extract": lambda m: (m.group(1), None),
    },
    # Excel - 장비별 점검일지 (소화전, 청정소화약제, 비상콘센트 등)
    {
        "pattern": r"^(\d{4})년도_(.+)_점검일지\.xlsx$",
        "key": "equipment_inspection",
        "label": "장비별 점검일지",
        "extract": lambda m: (m.group(1), None),
    },
    # Excel - 소방펌프 점검일지
    {
        "pattern": r"^(\d{4})년도_소방펌프_점검일지\.xlsx$",
        "key": "pump_inspection",
        "label": "소방펌프 점검일지",
        "extract": lambda m: (m.group(1), None),
    },
    # Excel - 근무표
    {
        "pattern": r"^(\d{4})년_(\d{1,2})월_근무표\.xlsx$",
        "key": "shift_schedule",
        "label": "근무표",
        "extract": lambda m: (m.group(1), m.group(2).zfill(2)),
    },
    # Excel - 일일업무일지 (단일)
    {
        "pattern": r"^(\d{1,2})월(\d{2})일 방재업무일지\.xlsx$",
        "key": "daily_report_single",
        "label": "일일업무일지 (일별)",
        "extract": lambda m: (None, m.group(1).zfill(2)),
    },
    # Excel - 일일업무일지 (월별)
    {
        "pattern": r"^일일업무일지\((\d{2})월\)\.xlsx$",
        "key": "daily_report_monthly",
        "label": "일일업무일지 (월별)",
        "extract": lambda m: (None, m.group(1)),
    },
    # Excel - 업무수행기록표
    {
        "pattern": r"^소방안전관리자_업무수행기록표_(\d{4})년_(\d{1,2})월\.xlsx$",
        "key": "work_log",
        "label": "업무수행기록표",
        "extract": lambda m: (m.group(1), m.group(2).zfill(2)),
    },
    # Excel - 휴가신청서
    {
        "pattern": r"^휴가신청서_.+_\d{8}\.xlsx$",
        "key": "leave_request",
        "label": "휴가신청서",
        "extract": lambda m: (None, None),
    },
    # Excel - 연간 업무 추진 계획
    {
        "pattern": r"^(\d{4})년 연간 업무 추진 계획\.xlsx$",
        "key": "annual_plan",
        "label": "연간 업무 추진 계획",
        "extract": lambda m: (m.group(1), None),
    },
    # Excel - 월간 중요업무추진계획
    {
        "pattern": r"^(\d{4})년_(\d{1,2})월_중요업무추진계획\(방재\)\.xlsx$",
        "key": "monthly_plan",
        "label": "월간 중요업무추진계획",
        "extract": lambda m: (m.group(1), m.group(2).zfill(2)),
    },
    # PDF - QR 코드
    {
        "pattern": r"^.+_(?:점검용|점검확인용)_QR\.pdf$",
        "key": "qr_code",
        "label": "QR 코드",
        "extract": lambda m: (None, None),
    },
    # HTML - 조치보고서
    {
        "pattern": r"^조치보고서_.+_\d{8}\.html$",
        "key": "remediation_report",
        "label": "조치보고서",
        "extract": lambda m: (None, None),
    },
    # ZIP - 지적사항
    {
        "pattern": r"^지적사항_.+\.zip$",
        "key": "legal_findings",
        "label": "지적사항",
        "extract": lambda m: (None, None),
    },
]


# ── 기본 설정 ────────────────────────────────────────────
def default_config():
    return {
        "download_folder": str(Path.home() / "Downloads"),
        "open_webapp_on_start": True,
        "rules": {}  # key → dest_folder 매핑
    }


def load_config():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return default_config()


def save_config(cfg):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)


# ── 파일 이동 로직 ───────────────────────────────────────
def move_file(src_path: Path, dest_base: str, year: str | None, month: str | None):
    """파일을 dest_base/년/월/ 구조로 이동"""
    now = datetime.now()
    if year is None:
        year = str(now.year)
    if month is None:
        month = str(now.month).zfill(2)

    dest_dir = Path(dest_base) / f"{year}년" / f"{month}월"
    dest_dir.mkdir(parents=True, exist_ok=True)

    dest_path = dest_dir / src_path.name

    # 동일 파일명 존재 시 덮어쓰기
    if dest_path.exists():
        dest_path.unlink()

    shutil.move(str(src_path), str(dest_path))
    print(f"[이동] {src_path.name} → {dest_path}")
    return dest_path


# ── 파일 감시 핸들러 ─────────────────────────────────────
class DownloadHandler(FileSystemEventHandler):
    def __init__(self, config):
        self.config = config
        self._pending = {}  # 다운로드 중인 파일 크기 안정화 대기

    def on_created(self, event):
        if event.is_directory:
            return
        # 약간 대기 후 처리 (다운로드 완료 대기)
        threading.Timer(2.0, self._process_file, args=[event.src_path]).start()

    def on_moved(self, event):
        """Chrome은 .crdownload → 최종파일로 rename"""
        if event.is_directory:
            return
        threading.Timer(1.0, self._process_file, args=[event.dest_path]).start()

    def _process_file(self, filepath):
        path = Path(filepath)
        if not path.exists():
            return
        # .crdownload, .tmp 등 임시파일 무시
        if path.suffix in (".crdownload", ".tmp", ".part"):
            return

        filename = path.name
        rules = self.config.get("rules", {})

        for pat_info in FILE_PATTERNS:
            m = re.match(pat_info["pattern"], filename)
            if not m:
                continue

            key = pat_info["key"]
            if key not in rules or not rules[key]:
                continue  # 이 패턴에 대한 저장 경로 미설정

            dest_base = rules[key]
            year, month = pat_info["extract"](m)

            try:
                # 파일 크기 안정화 확인 (다운로드 완료)
                prev_size = -1
                for _ in range(10):
                    curr_size = path.stat().st_size
                    if curr_size == prev_size and curr_size > 0:
                        break
                    prev_size = curr_size
                    time.sleep(0.5)

                move_file(path, dest_base, year, month)
            except Exception as e:
                print(f"[오류] {filename} 이동 실패: {e}")
            break


# ── 설정 GUI (tkinter) ──────────────────────────────────
def open_settings(config, restart_observer_fn):
    import tkinter as tk
    from tkinter import filedialog, messagebox

    win = tk.Tk()
    win.title("CHA Bio 파일 분류 — 설정")
    win.geometry("700x600")
    win.configure(bg="#1a1a2e")

    # 스타일
    label_style = {"bg": "#1a1a2e", "fg": "#e0e0e0", "font": ("맑은 고딕", 10)}
    entry_style = {"bg": "#16213e", "fg": "#e0e0e0", "font": ("맑은 고딕", 10),
                   "insertbackground": "#e0e0e0", "relief": "flat", "bd": 5}
    btn_style = {"bg": "#0f3460", "fg": "#e0e0e0", "font": ("맑은 고딕", 10),
                 "relief": "flat", "cursor": "hand2", "activebackground": "#1a1a5e"}

    # 헤더
    tk.Label(win, text="CHA Bio 파일 자동 분류 설정", bg="#1a1a2e", fg="#00d4ff",
             font=("맑은 고딕", 14, "bold")).pack(pady=(15, 5))

    # 다운로드 폴더
    frame_dl = tk.Frame(win, bg="#1a1a2e")
    frame_dl.pack(fill="x", padx=20, pady=5)
    tk.Label(frame_dl, text="다운로드 감시 폴더:", **label_style).pack(anchor="w")
    dl_var = tk.StringVar(value=config.get("download_folder", ""))
    dl_frame = tk.Frame(frame_dl, bg="#1a1a2e")
    dl_frame.pack(fill="x")
    dl_entry = tk.Entry(dl_frame, textvariable=dl_var, **entry_style)
    dl_entry.pack(side="left", fill="x", expand=True)
    tk.Button(dl_frame, text="찾아보기", command=lambda: dl_var.set(
        filedialog.askdirectory() or dl_var.get()), **btn_style).pack(side="right", padx=(5, 0))

    # 웹앱 자동 실행
    webapp_var = tk.BooleanVar(value=config.get("open_webapp_on_start", True))
    tk.Checkbutton(win, text="시작 시 웹앱 자동 열기", variable=webapp_var,
                   bg="#1a1a2e", fg="#e0e0e0", selectcolor="#16213e",
                   font=("맑은 고딕", 10), activebackground="#1a1a2e").pack(anchor="w", padx=20, pady=5)

    # 구분선
    tk.Frame(win, height=1, bg="#333").pack(fill="x", padx=20, pady=10)

    # 파일 패턴별 저장 경로
    tk.Label(win, text="파일 종류별 저장 경로 (비워두면 이동하지 않음):",
             bg="#1a1a2e", fg="#00d4ff", font=("맑은 고딕", 11, "bold")).pack(anchor="w", padx=20)

    # 스크롤 프레임
    canvas = tk.Canvas(win, bg="#1a1a2e", highlightthickness=0)
    scrollbar = tk.Scrollbar(win, orient="vertical", command=canvas.yview)
    scroll_frame = tk.Frame(canvas, bg="#1a1a2e")

    scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
    canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
    canvas.configure(yscrollcommand=scrollbar.set)

    rule_vars = {}
    rules = config.get("rules", {})

    for pat_info in FILE_PATTERNS:
        key = pat_info["key"]
        label = pat_info["label"]

        row = tk.Frame(scroll_frame, bg="#1a1a2e")
        row.pack(fill="x", padx=5, pady=2)

        tk.Label(row, text=f"{label}:", width=22, anchor="w", **label_style).pack(side="left")

        var = tk.StringVar(value=rules.get(key, ""))
        rule_vars[key] = var
        entry = tk.Entry(row, textvariable=var, width=40, **entry_style)
        entry.pack(side="left", fill="x", expand=True, padx=(5, 0))

        def browse(v=var):
            d = filedialog.askdirectory()
            if d:
                v.set(d)

        tk.Button(row, text="...", command=browse, width=3, **btn_style).pack(side="right", padx=(5, 0))

    canvas.pack(side="left", fill="both", expand=True, padx=20, pady=5)
    scrollbar.pack(side="right", fill="y", pady=5)

    # 저장 버튼
    def do_save():
        config["download_folder"] = dl_var.get()
        config["open_webapp_on_start"] = webapp_var.get()
        config["rules"] = {k: v.get() for k, v in rule_vars.items() if v.get()}
        save_config(config)
        restart_observer_fn(config)
        messagebox.showinfo("저장 완료", "설정이 저장되었습니다.")
        win.destroy()

    btn_frame = tk.Frame(win, bg="#1a1a2e")
    btn_frame.pack(fill="x", padx=20, pady=10)
    tk.Button(btn_frame, text="저장", command=do_save, width=12,
              bg="#00d4ff", fg="#1a1a2e", font=("맑은 고딕", 11, "bold"),
              relief="flat", cursor="hand2").pack(side="right")
    tk.Button(btn_frame, text="취소", command=win.destroy, width=12, **btn_style).pack(side="right", padx=(0, 10))

    win.mainloop()


# ── 시스템 트레이 아이콘 ─────────────────────────────────
def create_tray_icon():
    """간단한 파란색 원 아이콘 생성"""
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([8, 8, 56, 56], fill="#00d4ff")
    draw.text((22, 18), "CB", fill="#1a1a2e")
    return img


def run_tray(config, observer_holder):
    def on_settings(icon, item):
        def restart_obs(new_config):
            if observer_holder["obs"]:
                observer_holder["obs"].stop()
                observer_holder["obs"].join()
            obs = start_observer(new_config)
            observer_holder["obs"] = obs

        threading.Thread(target=open_settings, args=[config, restart_obs], daemon=True).start()

    def on_open_webapp(icon, item):
        webbrowser.open(WEB_APP_URL)

    def on_quit(icon, item):
        if observer_holder["obs"]:
            observer_holder["obs"].stop()
        icon.stop()

    menu = pystray.Menu(
        pystray.MenuItem("웹앱 열기", on_open_webapp),
        pystray.MenuItem("설정", on_settings),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("종료", on_quit),
    )

    icon = pystray.Icon(APP_NAME, create_tray_icon(), APP_NAME, menu)
    icon.run()


# ── 옵저버 시작 ─────────────────────────────────────────
def start_observer(config):
    dl_folder = config.get("download_folder", str(Path.home() / "Downloads"))
    if not os.path.isdir(dl_folder):
        print(f"[경고] 다운로드 폴더가 존재하지 않습니다: {dl_folder}")
        return None

    handler = DownloadHandler(config)
    observer = Observer()
    observer.schedule(handler, dl_folder, recursive=False)
    observer.start()
    print(f"[시작] 감시 중: {dl_folder}")
    return observer


# ── 메인 ────────────────────────────────────────────────
def main():
    config = load_config()

    # 첫 실행 시 설정 파일 생성
    if not CONFIG_FILE.exists():
        save_config(config)
        print(f"[초기화] 설정 파일 생성: {CONFIG_FILE}")

    # 웹앱 자동 실행
    if config.get("open_webapp_on_start", True):
        webbrowser.open(WEB_APP_URL)

    # 옵저버 시작
    obs = start_observer(config)
    observer_holder = {"obs": obs}

    # 설정된 규칙이 없으면 설정 창 열기
    if not config.get("rules"):
        print("[안내] 파일 분류 규칙이 없습니다. 설정 창을 엽니다.")
        threading.Timer(1.0, lambda: open_settings(config, lambda new_cfg: None)).start()

    # 시스템 트레이 실행 (메인 스레드)
    run_tray(config, observer_holder)


if __name__ == "__main__":
    main()
