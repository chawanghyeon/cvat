export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

interface OpenModalAction {
    type: typeof OPEN_MODAL;
    payload: {
        modalType: string;
        modalProps: any;
    };
}

interface CloseModalAction {
    type: typeof CLOSE_MODAL;
}

export type ModalActionTypes = OpenModalAction | CloseModalAction;

export const openModal = (modalType: string, modalProps: any): ModalActionTypes => ({
    type: OPEN_MODAL,
    payload: { modalType, modalProps },
});

export const closeModal = (): ModalActionTypes => ({
    type: CLOSE_MODAL,
});
