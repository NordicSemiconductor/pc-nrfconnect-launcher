; For string comparison 'S>':
!include 'LogicLib.nsh'

; For ExecShellWaitEx:
!include 'StdUtils.nsh'

; Adding custom installation steps for electron-builder, ref:
; https://www.electron.build/configuration/nsis#custom-nsis-script
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
  ; Installation of J-Link
  ; ===============================================================

  ; J-Link installer (downloaded by 'npm run get-jlink')
  !define BundledJLinkVersion "V686f"
  !define JLinkInstaller "JLink_Windows_${BundledJLinkVersion}.exe"
  !define JlinkInstallerResPath "${BUILD_RESOURCES_DIR}\${JLinkInstaller}"

  File ${JlinkInstallerResPath}

  ; Checking J-Link versions
  Var /GLOBAL LAST_JLINK_VERSION
  StrCpy $LAST_JLINK_VERSION ""
  StrCpy $0 0
  loop:
    EnumRegKey $1 HKCU "Software\SEGGER\J-Link" $0
    StrCmp $1 "" done
    StrCpy $LAST_JLINK_VERSION $1
    IntOp $0 $0 + 1
    Goto loop
  done:

  ${If} ${BundledJLinkVersion} S> $LAST_JLINK_VERSION
    ; J-Link is older than the bundled version. Run installer.
    StrCpy $0 "$INSTDIR\${JLinkInstaller}"
    ${StdUtils.ExecShellWaitEx} $R0 $R1 $0 'runas' '/passive /norestart'
  ${EndIf}

!macroend
