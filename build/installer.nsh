; Required for ${VersionCompare}
!include "WordFunc.nsh"
; Required for figuring out which driver install to run
!include "x64.nsh"

RequestExecutionLevel admin

; Adding custom installation steps for electron-builder, ref:
; https://github.com/electron-userland/electron-builder/wiki/NSIS
!macro customInstall

  ClearErrors

  ; The version of the bundled nRF5x-Command-Line-Tools
  Var /GLOBAL BUNDLED_NRFJPROG_VERSION
  StrCpy $BUNDLED_NRFJPROG_VERSION "9.7.1"

  ; Adding Visual C++ Redistributable for Visual Studio 2015
  File "${BUILD_RESOURCES_DIR}\vc_redist_2015.x86.exe"

  ; Running installer and waiting before continuing
  ExecWait '"$INSTDIR\vc_redist_2015.x86.exe" /passive /norestart'

; Debug messages to see if installation of vc redist worked.
  IfErrors vc_failed vc_success
  vc_failed:
  MessageBox MB_OK "VC Redist failed to install"
  vc_success:

  ClearErrors

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

; Debug messages to see if installation of nrfjprog worked.
  IfErrors jprog_failed jprog_success
  jprog_failed:
  MessageBox MB_OK "nrfjprog failed to install"
  jprog_success:

; ===============================================================
; Installation of drivers for dfu trigger and cdc acm
; ===============================================================

  ClearErrors

  ; Install drivers for DFU trigger and CDC ACM
  ; Put the files to the output directory.
  File /r "${BUILD_RESOURCES_DIR}\drivers"

  Var /GLOBAL RETURNVALUE

  ${If} ${RunningX64}
    DetailPrint "Installing x64 driver"
    ExecWait '"$INSTDIR\drivers\dfu_trigger_and_cdc_acm\dpinst_x64.exe" /sw /path "$INSTDIR\drivers\dfu_trigger_and_cdc_acm"' $RETURNVALUE
  ${Else}
    DetailPrint "Installing x86 driver"
    ExecWait '"$INSTDIR\drivers\dfu_trigger_and_cdc_acm\dpinst_x86.exe" /sw /path "$INSTDIR\drivers\dfu_trigger_and_cdc_acm"' $RETURNVALUE
  ${EndIf}


  IfErrors calling_installer
  ${If} $RETURNVALUE < 0
    goto error_code
  ${EndIf}
  goto done

  calling_installer:
  MessageBox MB_OK 'Calling error $INSTDIR $RETURNVALUE'
  DetailPrint "Could not call the installers"
  goto finish_driver_install

  error_code:
  MessageBox MB_OK 'ERROR $INSTDIR $RETURNVALUE'
  DetailPrint "Error installing drivers"
  goto finish_driver_install

  done:
  MessageBox MB_OK "Done"
  DetailPrint "Drivers installed correctly"

  finish_driver_install:

!macroend
