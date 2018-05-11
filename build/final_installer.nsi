;-------
;General

;Name of the installer.
Name "Driver installer"

;Name of the .exe file created.
OutFile "final-installer.exe"

;The default installation directory.
InstallDir "$TEMP\installer"

; Required for ${VersionCompare}
!include "WordFunc.nsh"
!include LogicLib.nsh
!include "x64.nsh"

;SilentInstall silent
RequestExecutionLevel admin

;------------------------------
;The stuff to copy and install.

;Default section start.
section

    ;The default output directory.
    setOutPath $INSTDIR

    DetailPrint $INSTDIR

     ; The version of the bundled nRF5x-Command-Line-Tools
  Var /GLOBAL BUNDLED_NRFJPROG_VERSION
  StrCpy $BUNDLED_NRFJPROG_VERSION "9.7.1"

  Var /GLOBAL VC_RETURNCODE

  ; Adding Visual C++ Redistributable for Visual Studio 2015
  File "vc_redist_2015.x86.exe"

  ; Running installer and waiting before continuing
  ExecWait '"$INSTDIR\vc_redist_2015.x86.exe" /passive /norestart' $VC_RETURNCODE

; Debug messages to see if installation of vc redist worked.
  IfErrors vc_failed vc_success
  vc_failed:
  DetailPrint "VC Redist failed to install. Code: $VC_RETURNCODE"
  vc_success:

  ClearErrors

  Var /GLOBAL NRFJPROG_RETURNCODE
  ; Adding nRF5x-Command-Line-Tools installer (downloaded by 'npm run get-nrfjprog')
  File "nrfjprog\nrfjprog-win32.exe"

  ; Checking if we have nRF5x-Command-Line-Tools installed
  EnumRegKey $0 HKLM "SOFTWARE\Nordic Semiconductor\nrfjprog" 0
  ${If} $0 == ""
    ; nRF5x-Command-Line-Tools is not installed. Run installer.
    ExecWait '"$INSTDIR\nrfjprog-win32.exe" /passive /norestart' $NRFJPROG_RETURNCODE
  ${Else}
    ${VersionCompare} $BUNDLED_NRFJPROG_VERSION $0 $R0
    ${If} $R0 == 1
      ; nRF5x-Command-Line-Tools is older than the bundled version. Run installer.
      ExecWait '"$INSTDIR\nrfjprog-win32.exe" /passive /norestart' $NRFJPROG_RETURNCODE
    ${EndIf}
  ${EndIf}

; Debug messages to see if installation of nrfjprog worked.
  IfErrors jprog_failed jprog_success
  jprog_failed:
  DetailPrint "nrfjprog failed to install. Code: $NRFJPROG_RETURNCODE"
  jprog_success:

  Var /GLOBAL DRIVER_RETURNCODE
 ; Adding Visual C++ Redistributable for Visual Studio 2015
  File "drivers\driver-installer.exe"

  ; Running installer and waiting before continuing
  ExecWait '"$INSTDIR\driver-installer.exe"' $DRIVER_RETURNCODE

; Debug messages to see if installation of vc redist worked.
  IfErrors driver_failed driver_success
  driver_failed:
  DetailPrint "Driver failed to install. Code: $DRIVER_RETURNCODE"
  driver_success:

  ClearErrors

  Var /GLOBAL NRFCONNECT_RETURNCODE
   ; Adding Visual C++ Redistributable for Visual Studio 2015
  File "..\release\nrfconnect-setup-2.4.0-alpha.1.exe"

  ; Running installer and waiting before continuing
  ExecWait '"$INSTDIR\nrfconnect-setup-2.4.0-alpha.1.exe"' $NRFCONNECT_RETURNCODE

; Debug messages to see if installation of vc redist worked.
  IfErrors nrfconnect_failed nrfconnect_success
  nrfconnect_failed:
  DetailPrint "nRF Connect failed to install. Code: $NRFCONNECT_RETURNCODE"
  nrfconnect_success:

  ClearErrors

;Default section end.
sectionEnd
