; Required for ${VersionCompare}
!include "WordFunc.nsh"

; Adding custom installation steps for electron-builder, ref:
; https://github.com/electron-userland/electron-builder/wiki/NSIS
!macro customInstall
  ; ===============================================================
  ; Installation of drivers for dfu trigger and cdc acm
  ; ===============================================================

  ; Install drivers for DFU trigger and CDC ACM
  ; Put the files to the output directory.
  File "${BUILD_RESOURCES_DIR}\drivers\nrfconnect-driver-installer.exe"

  ExecShell 'runas' '"$INSTDIR\nrfconnect-driver-installer.exe"'

  ; ===============================================================
  ; Installation of VC 2015 redistributable
  ; ===============================================================

  ; Adding Visual C++ Redistributable for Visual Studio 2015
  File "${BUILD_RESOURCES_DIR}\vc_redist_2015.x86.exe"

  ; Running installer and waiting before continuing
  ExecWait '"$INSTDIR\vc_redist_2015.x86.exe" /passive /norestart'

  ; ===============================================================
  ; Installation of nrfjprog
  ; ===============================================================

  ; The version of the bundled nRF5x-Command-Line-Tools
  Var /GLOBAL BUNDLED_NRFJPROG_VERSION
  StrCpy $BUNDLED_NRFJPROG_VERSION "9.7.1"

  ; Adding nRF5x-Command-Line-Tools installer (downloaded by 'npm run get-nrfjprog')
  File "${BUILD_RESOURCES_DIR}\nrfjprog\nrfjprog-win32.exe"

  ; Checking if we have nRF5x-Command-Line-Tools installed
  EnumRegKey $0 HKLM "SOFTWARE\Nordic Semiconductor\nrfjprog" 0

  ${If} $0 == ""
    ; nRF5x-Command-Line-Tools is not installed. Run installer.
    ExecWait '"$INSTDIR\nrfjprog-win32.exe" /passive /norestart'
  ${Else}
    ${VersionCompare} $BUNDLED_NRFJPROG_VERSION $0 $R0
    ${If} $R0 == 1
      ; nRF5x-Command-Line-Tools is older than the bundled version. Run installer.
      ExecWait '"$INSTDIR\nrfjprog-win32.exe" /passive /norestart'
    ${EndIf}
  ${EndIf}

!macroend
