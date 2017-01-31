; example2.nsi
;
; This script is based on example1.nsi, but it remember the directory,
; has uninstall support and (optionally) installs start menu shortcuts.
;
; It will install example2.nsi into a directory that the user selects,

;--------------------------------

; The name of the installer
Name "nRF Connect"

; The file to write
OutFile "nrf-connect_installer.exe"

; The default installation directory
InstallDir "$PROGRAMFILES\Nordic Semiconductor\nRF Connect"

; Request application privileges for Windows Vista
RequestExecutionLevel admin

SetCompress off
SetCompressor /SOLID BZIP2

;--------------------------------

; Pages

; Page components
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

;--------------------------------

; The stuff to install
Section "nRF Connect (required)"

  SectionIn RO

  ; Set output path to the installation directory.
  SetOutPath $INSTDIR

  ; Put application files there
  File /r nrf-connect-win32-ia32\*.*

  ; Put Visual Studio C++ redistributable there
  File "vc_redist_2015.x86.exe"

  ; Start Visual Studio C++ redistributable installation and make sure it completes
  ExecWait '"$INSTDIR\vc_redist_2015.x86.exe" /passive /norestart'

  ; Write the installation path into the registry
  ; WriteRegStr HKLM SOFTWARE\NSIS_Example2 "Install_Dir" "$INSTDIR"

  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\nRFConnect" "nRF Connect" "nRF Connect"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\nRFConnect" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\nRFConnect" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\nRFConnect" "NoRepair" 1
  WriteUninstaller "uninstall.exe"

SectionEnd

; Optional section (can be disabled by the user)
Section "Start Menu Shortcuts"

  CreateDirectory "$SMPROGRAMS\Nordic Semiconductor"
  CreateDirectory "$SMPROGRAMS\Nordic Semiconductor\nRF Connect"
  CreateShortcut "$SMPROGRAMS\Nordic Semiconductor\nRF Connect\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortcut "$SMPROGRAMS\Nordic Semiconductor\nRF Connect\nRF Connect.lnk" "$INSTDIR\nrf-connect.exe"

SectionEnd

;--------------------------------

; Uninstaller

Section "Uninstall"

  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\nRFConnect"

  ; Remove files and uninstaller
  RMDir /r $INSTDIR
  ; Delete $INSTDIR\uninstall.exe

  ; Remove shortcuts, if any
  RMDir /r "$SMPROGRAMS\Nordic Semiconductor\nRF Connect"

  ; Remove directories used
  RMDir "$SMPROGRAMS\Nordic Semiconductor"
  RMDir "$INSTDIR"

SectionEnd
