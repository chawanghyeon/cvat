import { OPEN_MODAL, CLOSE_MODAL, ModalActionTypes } from 'actions/modal-actions';

interface ModalState {
    modalType: string | null;
    modalProps: any;
    isOpen: boolean;
}

const initialState: ModalState = {
    modalType: null,
    modalProps: {},
    isOpen: false,
};

const modalReducer = (state = initialState, action: ModalActionTypes): ModalState => {
    switch (action.type) {
        case OPEN_MODAL:
            return {
                ...state,
                modalType: action.payload.modalType,
                modalProps: action.payload.modalProps,
                isOpen: true,
            };
        case CLOSE_MODAL:
            return {
                ...state,
                modalType: null,
                modalProps: {},
                isOpen: false,
            };
        default:
            return state;
    }
};

export default modalReducer;
