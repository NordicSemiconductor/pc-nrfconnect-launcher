import Appid from '../models/appid';

import * as Actions from '../actions/releaseNotesDialogActions';

// # Model
// The model is an Appid, selecting release notes to show, with
// all members undefined indicating no selection.
const dialogHidden = Appid();
const dialogShownFor = Appid;

// # Update
export default function (state = dialogHidden, action) {
    switch (action.type) {
        case Actions.HIDE_RELEASE_NOTES:
            return dialogHidden;
        case Actions.SHOW_RELEASE_NOTES:
            return dialogShownFor(action.appid);
        default:
            return state;
    }
}
