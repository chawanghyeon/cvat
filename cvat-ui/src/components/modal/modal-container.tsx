/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';

import './styles.scss';
import UmapPageComponent from 'components/umap-page/umap-page';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from 'actions/modal-actions';

type Props = {
    isShow?: boolean;
    title?: string;
    onClose?: () => void;
    onOk?: () => void;
    hasCancle?: boolean;
    children?: React.ReactNode;
};

export default function ModalContainer({ isShow, title, onClose, onOk, children, hasCancle }: Props) {
    const { isOpen, modalType, modalProps } = useSelector((state: any) => state.modal);

    console.log('isOpen : ', isOpen);
    const dispatch = useDispatch();
    if (!isOpen) {
        return null;
    }

    const handleCloseModal = () => {
        dispatch(closeModal());
    };

    const closeDialog = () => {
        setTimeout(() => {
            // onClose();
        }, 500);
    };

    const clickOk = () => {
        // onOk();
        handleCloseModal();
    };

    return (
        <>
            <div className={`${'backdrop'} ${isOpen ? 'show' : ''}`} onClick={handleCloseModal} />
            <div
                className={`${'dialogContainer'} ${isOpen ? 'show' : ''}`}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        handleCloseModal();
                    }
                }}
            >
                <div className='dialogHeader'>
                    <div className='dialogTitle'>{title}</div>
                    <button type='button' className='closeBtn' onClick={handleCloseModal}>
                        <span>x</span>
                    </button>
                </div>
                {/* <div className='dialogBody'>{children}</div> */}
                <div className='dialogBody'>
                    <UmapPageComponent />
                </div>
            </div>
        </>
    );
}
