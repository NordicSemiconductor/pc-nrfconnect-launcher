import FirmwareDialog from '../components/FirmwareDialog';
import * as FirmwareDialogActions from '../actions/firmwareDialogActions';
import withHotkey from '../util/withHotkey';
import { connect } from '../util/plugins';

function mapStateToProps(state) {
    const { firmwareDialog } = state.core;

    return {
        port: firmwareDialog.port,
        isVisible: firmwareDialog.isVisible,
        isInProgress: firmwareDialog.isInProgress,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onConfirmUpdateFirmware: port => dispatch(FirmwareDialogActions.updateFirmware(port)),
        onCancel: () => dispatch(FirmwareDialogActions.hideDialog()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withHotkey(FirmwareDialog), 'FirmwareDialog');
