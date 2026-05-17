' CHA Bio Watchdog - Invisible PowerShell Launcher
' Usage: wscript.exe Run-Hidden.vbs "path\to\script.ps1"
'
' wscript.exe does not create a console window, which prevents the
' conhost.exe flicker that powershell.exe -WindowStyle Hidden exhibits
' when launched by Task Scheduler on Windows PowerShell 5.1.

Option Explicit

Dim shell, scriptPath, cmd

If WScript.Arguments.Count < 1 Then
    WScript.Quit 1
End If

scriptPath = WScript.Arguments(0)

Set shell = CreateObject("WScript.Shell")
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -NonInteractive -File """ & scriptPath & """"

' Run hidden (intWindowStyle=0), do not wait for return (bWaitOnReturn=False)
shell.Run cmd, 0, False
