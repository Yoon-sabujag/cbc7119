# -*- coding: utf-8 -*-
"""
CHA Bio Complex - Download File Auto-Organizer
Windows 7+ compatible (Python 3.8+)
"""

import os
import sys
import re
import json
import time
import shutil
import webbrowser
import threading
import locale
from pathlib import Path
from datetime import datetime

# UTF-8 stdout/stderr for Korean
if sys.platform == "win32":
    try:
        import ctypes
        ctypes.windll.kernel32.SetConsoleOutputCP(65001)
        ctypes.windll.kernel32.SetConsoleCP(65001)
    except Exception:
        pass
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import pystray
from PIL import Image, ImageDraw

# ── Constants ───────────────────────────────────────────
APP_NAME = "CHA Bio File Organizer"
CONFIG_DIR = Path.home() / ".cha-bio-watchdog"
CONFIG_FILE = CONFIG_DIR / "config.json"
WEB_APP_URL = "https://cbc7119.pages.dev"

# ── File patterns ───────────────────────────────────────
# Each: (regex, key, Korean label, year/month extractor)

def _ext_ym(g1, g2):
    def fn(m):
        y = m.group(g1) if g1 else None
        mo = m.group(g2).zfill(2) if g2 else None
        return (y, mo)
    return fn

def _ext_y(g):
    def fn(m):
        return (m.group(g), None)
    return fn

def _ext_none(m):
    return (None, None)

def _ext_daily_single(m):
    return (None, m.group(1).zfill(2))

def _ext_daily_monthly(m):
    return (None, m.group(1))

FILE_PATTERNS = [
    {
        "pattern": u"^(\\d{4})\ub144\ub3c4 \uc810\uac80\uc77c\uc9c0 \uc885\ud569 \\((\\d{2})\uc6d4 \uc5c5\ub370\uc774\ud2b8\\)\\.zip$",
        "key": "inspection_zip",
        "label": u"\uc810\uac80\uc77c\uc9c0 \uc885\ud569",
        "extract": _ext_ym(1, 2),
    },
    {
        "pattern": u"^(\\d{4})\ub144\ub3c4_DIV\uc810\uac80\ud45c_.+\\.xlsx$",
        "key": "div_inspection",
        "label": u"DIV \uc810\uac80\ud45c",
        "extract": _ext_y(1),
    },
    {
        "pattern": u"^(\\d{4})\ub144\ub3c4_(.+)_\uc810\uac80\uc77c\uc9c0\\.xlsx$",
        "key": "equipment_inspection",
        "label": u"\uc7a5\ube44\ubcc4 \uc810\uac80\uc77c\uc9c0",
        "extract": _ext_y(1),
    },
    {
        "pattern": u"^(\\d{4})\ub144\ub3c4_\uc18c\ubc29\ud38c\ud504_\uc810\uac80\uc77c\uc9c0\\.xlsx$",
        "key": "pump_inspection",
        "label": u"\uc18c\ubc29\ud38c\ud504 \uc810\uac80\uc77c\uc9c0",
        "extract": _ext_y(1),
    },
    {
        "pattern": u"^(\\d{4})\ub144_(\\d{1,2})\uc6d4_\uadfc\ubb34\ud45c\\.xlsx$",
        "key": "shift_schedule",
        "label": u"\uadfc\ubb34\ud45c",
        "extract": _ext_ym(1, 2),
    },
    {
        "pattern": u"^(\\d{1,2})\uc6d4(\\d{2})\uc77c \ubc29\uc7ac\uc5c5\ubb34\uc77c\uc9c0\\.xlsx$",
        "key": "daily_report_single",
        "label": u"\uc77c\uc77c\uc5c5\ubb34\uc77c\uc9c0 (\uc77c\ubcc4)",
        "extract": _ext_daily_single,
    },
    {
        "pattern": u"^\uc77c\uc77c\uc5c5\ubb34\uc77c\uc9c0\\((\\d{2})\uc6d4\\)\\.xlsx$",
        "key": "daily_report_monthly",
        "label": u"\uc77c\uc77c\uc5c5\ubb34\uc77c\uc9c0 (\uc6d4\ubcc4)",
        "extract": _ext_daily_monthly,
    },
    {
        "pattern": u"^\uc18c\ubc29\uc548\uc804\uad00\ub9ac\uc790_\uc5c5\ubb34\uc218\ud589\uae30\ub85d\ud45c_(\\d{4})\ub144_(\\d{1,2})\uc6d4\\.xlsx$",
        "key": "work_log",
        "label": u"\uc5c5\ubb34\uc218\ud589\uae30\ub85d\ud45c",
        "extract": _ext_ym(1, 2),
    },
    {
        "pattern": u"^\ud734\uac00\uc2e0\uccad\uc11c_.+_\\d{8}\\.xlsx$",
        "key": "leave_request",
        "label": u"\ud734\uac00\uc2e0\uccad\uc11c",
        "extract": _ext_none,
    },
    {
        "pattern": u"^(\\d{4})\ub144 \uc5f0\uac04 \uc5c5\ubb34 \ucd94\uc9c4 \uacc4\ud68d\\.xlsx$",
        "key": "annual_plan",
        "label": u"\uc5f0\uac04 \uc5c5\ubb34 \ucd94\uc9c4 \uacc4\ud68d",
        "extract": _ext_y(1),
    },
    {
        "pattern": u"^(\\d{4})\ub144_(\\d{1,2})\uc6d4_\uc911\uc694\uc5c5\ubb34\ucd94\uc9c4\uacc4\ud68d\\(\ubc29\uc7ac\\)\\.xlsx$",
        "key": "monthly_plan",
        "label": u"\uc6d4\uac04 \uc911\uc694\uc5c5\ubb34\ucd94\uc9c4\uacc4\ud68d",
        "extract": _ext_ym(1, 2),
    },
    {
        "pattern": u"^.+_(?:\uc810\uac80\uc6a9|\uc810\uac80\ud655\uc778\uc6a9)_QR\\.pdf$",
        "key": "qr_code",
        "label": u"QR \ucf54\ub4dc",
        "extract": _ext_none,
    },
    {
        "pattern": u"^\uc870\uce58\ubcf4\uace0\uc11c_.+_\\d{8}\\.html$",
        "key": "remediation_report",
        "label": u"\uc870\uce58\ubcf4\uace0\uc11c",
        "extract": _ext_none,
    },
    {
        "pattern": u"^\uc9c0\uc801\uc0ac\ud56d_.+\\.zip$",
        "key": "legal_findings",
        "label": u"\uc9c0\uc801\uc0ac\ud56d",
        "extract": _ext_none,
    },
]


# ── Config ──────────────────────────────────────────────
def default_config():
    return {
        "download_folder": str(Path.home() / "Downloads"),
        "open_webapp_on_start": True,
        "rules": {},
    }


def load_config():
    if CONFIG_FILE.exists():
        with open(str(CONFIG_FILE), "r", encoding="utf-8") as f:
            return json.load(f)
    return default_config()


def save_config(cfg):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(str(CONFIG_FILE), "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)


# ── File move ───────────────────────────────────────────
def move_file(src_path, dest_base, year, month):
    now = datetime.now()
    if year is None:
        year = str(now.year)
    if month is None:
        month = str(now.month).zfill(2)

    dest_dir = Path(dest_base) / (year + u"\ub144") / (month + u"\uc6d4")
    dest_dir.mkdir(parents=True, exist_ok=True)

    dest_path = dest_dir / src_path.name
    if dest_path.exists():
        dest_path.unlink()

    shutil.move(str(src_path), str(dest_path))
    return dest_path


# ── File watcher ────────────────────────────────────────
class DownloadHandler(FileSystemEventHandler):
    def __init__(self, config):
        self.config = config

    def on_created(self, event):
        if event.is_directory:
            return
        threading.Timer(2.0, self._process, args=[event.src_path]).start()

    def on_moved(self, event):
        if event.is_directory:
            return
        threading.Timer(1.0, self._process, args=[event.dest_path]).start()

    def _process(self, filepath):
        path = Path(filepath)
        if not path.exists():
            return
        if path.suffix.lower() in (".crdownload", ".tmp", ".part"):
            return

        filename = path.name
        rules = self.config.get("rules", {})

        for pat in FILE_PATTERNS:
            m = re.match(pat["pattern"], filename)
            if not m:
                continue
            key = pat["key"]
            if key not in rules or not rules[key]:
                continue

            try:
                prev_size = -1
                for _ in range(10):
                    curr_size = path.stat().st_size
                    if curr_size == prev_size and curr_size > 0:
                        break
                    prev_size = curr_size
                    time.sleep(0.5)
                year, month = pat["extract"](m)
                move_file(path, rules[key], year, month)
            except Exception:
                pass
            break


# ── Settings GUI ────────────────────────────────────────
def get_korean_font():
    """Return available Korean font for tkinter"""
    import tkinter.font as tkfont
    import tkinter as tk
    root = tk.Tk()
    root.withdraw()
    families = tkfont.families()
    root.destroy()
    for name in [u"\ub9d1\uc740 \uace0\ub515", "Malgun Gothic", u"\uad74\ub9bc", "Gulim", u"\ub3cb\uc6c0", "Dotum"]:
        if name in families:
            return name
    return "TkDefaultFont"


def open_settings(config, restart_fn):
    import tkinter as tk
    from tkinter import filedialog, messagebox

    kr_font = get_korean_font()

    win = tk.Tk()
    win.title(u"CHA Bio \ud30c\uc77c \ubd84\ub958 \u2014 \uc124\uc815")
    win.geometry("720x620")
    win.configure(bg="#1e1e2e")

    lbl_cfg = {"bg": "#1e1e2e", "fg": "#cdd6f4", "font": (kr_font, 10)}
    ent_cfg = {"bg": "#313244", "fg": "#cdd6f4", "font": (kr_font, 10),
               "insertbackground": "#cdd6f4", "relief": "flat", "bd": 5}
    btn_cfg = {"bg": "#45475a", "fg": "#cdd6f4", "font": (kr_font, 10),
               "relief": "flat", "cursor": "hand2", "activebackground": "#585b70"}

    # Header
    tk.Label(win, text=u"CHA Bio \ud30c\uc77c \uc790\ub3d9 \ubd84\ub958 \uc124\uc815",
             bg="#1e1e2e", fg="#89b4fa", font=(kr_font, 14, "bold")).pack(pady=(15, 5))

    # Download folder
    frm_dl = tk.Frame(win, bg="#1e1e2e")
    frm_dl.pack(fill="x", padx=20, pady=5)
    tk.Label(frm_dl, text=u"\ub2e4\uc6b4\ub85c\ub4dc \uac10\uc2dc \ud3f4\ub354:", **lbl_cfg).pack(anchor="w")
    dl_var = tk.StringVar(value=config.get("download_folder", ""))
    dl_row = tk.Frame(frm_dl, bg="#1e1e2e")
    dl_row.pack(fill="x")
    tk.Entry(dl_row, textvariable=dl_var, **ent_cfg).pack(side="left", fill="x", expand=True)
    tk.Button(dl_row, text=u"\ucc3e\uc544\ubcf4\uae30",
              command=lambda: dl_var.set(filedialog.askdirectory() or dl_var.get()),
              **btn_cfg).pack(side="right", padx=(5, 0))

    # Webapp checkbox
    wa_var = tk.BooleanVar(value=config.get("open_webapp_on_start", True))
    tk.Checkbutton(win, text=u"\uc2dc\uc791 \uc2dc \uc6f9\uc571 \uc790\ub3d9 \uc5f4\uae30",
                   variable=wa_var, bg="#1e1e2e", fg="#cdd6f4", selectcolor="#313244",
                   font=(kr_font, 10), activebackground="#1e1e2e").pack(anchor="w", padx=20, pady=5)

    tk.Frame(win, height=1, bg="#45475a").pack(fill="x", padx=20, pady=10)

    tk.Label(win, text=u"\ud30c\uc77c \uc885\ub958\ubcc4 \uc800\uc7a5 \uacbd\ub85c (\ube44\uc6cc\ub450\uba74 \uc774\ub3d9\ud558\uc9c0 \uc54a\uc74c):",
             bg="#1e1e2e", fg="#89b4fa", font=(kr_font, 11, "bold")).pack(anchor="w", padx=20)

    # Scrollable rules
    canvas = tk.Canvas(win, bg="#1e1e2e", highlightthickness=0)
    scrollbar = tk.Scrollbar(win, orient="vertical", command=canvas.yview)
    scroll_frame = tk.Frame(canvas, bg="#1e1e2e")
    scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
    canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
    canvas.configure(yscrollcommand=scrollbar.set)

    rule_vars = {}
    rules = config.get("rules", {})

    for pat in FILE_PATTERNS:
        key = pat["key"]
        label = pat["label"]
        row = tk.Frame(scroll_frame, bg="#1e1e2e")
        row.pack(fill="x", padx=5, pady=2)
        tk.Label(row, text=label + u":", width=24, anchor="w", **lbl_cfg).pack(side="left")
        var = tk.StringVar(value=rules.get(key, ""))
        rule_vars[key] = var
        tk.Entry(row, textvariable=var, width=38, **ent_cfg).pack(side="left", fill="x", expand=True, padx=(5, 0))
        def browse(v=var):
            d = filedialog.askdirectory()
            if d:
                v.set(d)
        tk.Button(row, text="...", command=browse, width=3, **btn_cfg).pack(side="right", padx=(5, 0))

    canvas.pack(side="left", fill="both", expand=True, padx=20, pady=5)
    scrollbar.pack(side="right", fill="y", pady=5)

    # Save / Cancel
    def do_save():
        config["download_folder"] = dl_var.get()
        config["open_webapp_on_start"] = wa_var.get()
        config["rules"] = {}
        for k, v in rule_vars.items():
            val = v.get().strip()
            if val:
                config["rules"][k] = val
        save_config(config)
        if restart_fn:
            restart_fn(config)
        messagebox.showinfo(u"\uc800\uc7a5 \uc644\ub8cc", u"\uc124\uc815\uc774 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.")
        win.destroy()

    bf = tk.Frame(win, bg="#1e1e2e")
    bf.pack(fill="x", padx=20, pady=10)
    tk.Button(bf, text=u"\uc800\uc7a5", command=do_save, width=12,
              bg="#89b4fa", fg="#1e1e2e", font=(kr_font, 11, "bold"),
              relief="flat", cursor="hand2").pack(side="right")
    tk.Button(bf, text=u"\ucde8\uc18c", command=win.destroy, width=12, **btn_cfg).pack(side="right", padx=(0, 10))

    win.mainloop()


# ── Tray icon ───────────────────────────────────────────
def create_tray_icon():
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([4, 4, 60, 60], fill="#89b4fa")
    d.rectangle([18, 20, 46, 44], fill="#1e1e2e")
    d.polygon([(32, 14), (22, 26), (42, 26)], fill="#1e1e2e")  # arrow down
    return img


def run_tray(config, obs_holder):
    def on_settings(icon, item):
        def restart(new_cfg):
            if obs_holder["obs"]:
                obs_holder["obs"].stop()
                obs_holder["obs"].join()
            obs_holder["obs"] = start_observer(new_cfg)
        threading.Thread(target=open_settings, args=[config, restart], daemon=True).start()

    def on_webapp(icon, item):
        webbrowser.open(WEB_APP_URL)

    def on_quit(icon, item):
        if obs_holder["obs"]:
            obs_holder["obs"].stop()
        icon.stop()

    menu = pystray.Menu(
        pystray.MenuItem(u"\uc6f9\uc571 \uc5f4\uae30", on_webapp),
        pystray.MenuItem(u"\uc124\uc815", on_settings),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem(u"\uc885\ub8cc", on_quit),
    )
    icon = pystray.Icon(APP_NAME, create_tray_icon(), APP_NAME, menu)
    icon.run()


# ── Observer ────────────────────────────────────────────
def start_observer(config):
    dl = config.get("download_folder", str(Path.home() / "Downloads"))
    if not os.path.isdir(dl):
        return None
    handler = DownloadHandler(config)
    obs = Observer()
    obs.schedule(handler, dl, recursive=False)
    obs.start()
    return obs


# ── Main ────────────────────────────────────────────────
def main():
    config = load_config()
    if not CONFIG_FILE.exists():
        save_config(config)

    if config.get("open_webapp_on_start", True):
        webbrowser.open(WEB_APP_URL)

    obs = start_observer(config)
    obs_holder = {"obs": obs}

    if not config.get("rules"):
        threading.Timer(1.0, lambda: open_settings(config, lambda c: None)).start()

    run_tray(config, obs_holder)


if __name__ == "__main__":
    main()
