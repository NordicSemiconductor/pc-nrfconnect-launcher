; For string comparison 'S>':
!include 'LogicLib.nsh'

; For ExecShellWaitEx:
!include 'StdUtils.nsh'

!include 'x64.nsh'

; Adding custom installation steps for electron-builder, ref:
; https://www.electron.build/configuration/nsis#custom-nsis-script
!macro customInstall
  ; ===============================================================
  ; Installation of drivers for dfu trigger and cdc acm
  ; ===============================================================

  ; Install drivers for DFU trigger and CDC ACM
  ; Put the files to the output directory.
  File "${BUILD_RESOURCES_DIR}\drivers\nrf-device-lib-driver-installer.exe"

  ExecShell 'runas' '"$INSTDIR\nrf-device-lib-driver-installer.exe"'

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
  !define BundledJLinkVersion "V758b"

  !define JLinkInstaller "JLink_Windows_${BundledJLinkVersion}.exe"
  !define JlinkInstallerResPath "${BUILD_RESOURCES_DIR}\${JLinkInstaller}"
  !define JLinkRegistryRoot "SOFTWARE\Segger\J-Link"
  
  File ${JlinkInstallerResPath}

  ; Check if the version exist in the registry
  ; It's relevant to check it's running a 32-bit installer or 64-bit
  ; because we want to make sure local machine has J-Link matching
  ; the same platform architecture.
  ${If} ${RunningX64}
    ; Only check the 64-bit portion of registry
    SetRegView 64
  ${Else}
    ; Only check the 32-bit portion of registry
    SetRegView 32
  ${EndIf}

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
