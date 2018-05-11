;-------
;General

;Name of the installer.
Name "Driver installer"

;Name of the .exe file created.
OutFile "driver-installer.exe"

;The default installation directory.
InstallDir "$TEMP\installer"


!include LogicLib.nsh
!include "x64.nsh"

SilentInstall silent
RequestExecutionLevel admin

;------------------------------
;The stuff to copy and install.

;Default section start.
section

    ;The default output directory.
    setOutPath $INSTDIR

    DetailPrint $INSTDIR

    ;Put the files to the output directory.
    File /r dfu_trigger_and_cdc_acm

    ${If} ${RunningX64}
        DetailPrint "Executing x64"
        ExecWait '"$INSTDIR\dfu_trigger_and_cdc_acm\dpinst_x64.exe" /sw' $0
    ${Else}
        DetailPrint "Executing x86"
        ExecWait '"$INSTDIR\dfu_trigger_and_cdc_acm\dpinst_x86.exe" /sw' $0
    ${EndIf}
    DetailPrint $0
    IfErrors error_installing
    ${If} $0 < 0
        DetailPrint 'Errorcode'
        goto error_installing
    ${EndIf}
    goto done

    error_installing:
    DetailPrint "ERROR"

    done:
    DetailPrint $0
    DetailPrint "Done"

;Default section end.
sectionEnd
