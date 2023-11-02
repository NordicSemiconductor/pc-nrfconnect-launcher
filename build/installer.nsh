; For string comparison 'S>':
!include 'LogicLib.nsh'

; For ExecShellWaitEx:
!include 'StdUtils.nsh'

; For nsProcess:
!addplugindir "${BUILD_RESOURCES_DIR}\plugins"

!macro customInit
  ; ===============================================================
  ; Verify that nRF Connect for Desktop is not currently running.
  ; ===============================================================

  StrCpy $0 "nRF Connect for Desktop.exe"
  nsProcess::_FindProcess $0
  Pop $R0
  ${If} $R0 = 0
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "nRF Connect for Desktop application is running. Click OK to close it and continue with the installation." /SD IDCANCEL IDOK stopProcess
    Quit
    stopProcess:
      nsProcess::_KillProcess $0
      Sleep 500
  ${EndIf}
!macroend

; Adding custom installation steps for electron-builder, ref:
; https://www.electron.build/configuration/nsis#custom-nsis-script
!macro customInstall  
  ; ===============================================================
  ; Installation of drivers for dfu trigger and cdc acm
  ; ===============================================================

  ; Install drivers for DFU trigger and CDC ACM
  ; Put the files to the output directory.
  File "${BUILD_RESOURCES_DIR}\drivers\nrf-device-lib-driver-installer.exe"

  BringToFront

  ExecShell 'runas' '"$INSTDIR\nrf-device-lib-driver-installer.exe"'

  ; ===============================================================
  ; Installation of VC 2015 redistributable
  ; ===============================================================

  ; Adding Visual C++ Redistributable for Visual Studio 2015
  File "${BUILD_RESOURCES_DIR}\VC_redist.x64.exe"

  ; Running installer and waiting before continuing
  ExecWait '"$INSTDIR\VC_redist.x64.exe" /passive /norestart'

  ; ===============================================================
  ; Installation of J-Link
  ; ===============================================================

  ; J-Link installer (downloaded by getJlink.js through prePack hook)
  !define BundledJLinkVersion "V780c"

  !define JLinkInstaller "JLink_Windows_${BundledJLinkVersion}.exe"
  !define JlinkInstallerResPath "${BUILD_RESOURCES_DIR}\${JLinkInstaller}"
  !define JLinkRegistryRoot "SOFTWARE\Segger\J-Link"

  File ${JlinkInstallerResPath}

  Var /GLOBAL LAST_JLINK_VERSION
  EnumRegKey $LAST_JLINK_VERSION HKCU ${JLinkRegistryRoot} 0
  ReadRegStr $3 HKCU "${JLinkRegistryRoot}\$LAST_JLINK_VERSION" "CurrentVersion"
  ${If} $3 == ""
    StrCpy $LAST_JLINK_VERSION ""
  ${EndIf}
 
  ${If} ${BundledJLinkVersion} S> $LAST_JLINK_VERSION
    ; J-Link is older than the bundled version. Run installer.
    StrCpy $0 "$INSTDIR\${JLinkInstaller}"
    ${StdUtils.ExecShellWaitEx} $R0 $R1 $0 'runas' '/passive /norestart'
  ${EndIf}

!macroend
