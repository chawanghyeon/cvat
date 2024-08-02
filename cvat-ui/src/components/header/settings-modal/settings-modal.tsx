import './styles.scss';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tabs, { TabsProps } from 'antd/lib/tabs';
import Modal from 'antd/lib/modal/Modal';
import Button from 'antd/lib/button';
import notification from 'antd/lib/notification';
import Tooltip from 'antd/lib/tooltip';
import { CloseOutlined } from '@ant-design/icons';

import { setSettings } from 'actions/settings-actions';
import WorkspaceSettingsContainer from 'containers/header/settings-modal/workspace-settings';
import PlayerSettingsContainer from 'containers/header/settings-modal/player-settings';
import { CombinedState } from 'reducers';
import DesignSettingsComponent from './design-settings';

interface SettingsModalProps {
    visible: boolean;
    onClose(): void;
}

const SettingsModal = (props: SettingsModalProps): JSX.Element => {
    const { visible, onClose } = props;

    const settings = useSelector((state: CombinedState) => state.settings);
    const dispatch = useDispatch();

    const onSaveSettings = (): void => {
        const settingsForSaving: any = {};
        for (const [key, value] of Object.entries(settings)) {
            if (typeof value === 'object') {
                settingsForSaving[key] = value;
            }
        }
        localStorage.setItem('clientSettings', JSON.stringify(settingsForSaving));
        notification.success({
            message: 'Settings was successfully saved',
            className: 'cvat-notification-notice-save-settings-success',
        });
    };

    useEffect(() => {
        try {
            const newSettings: any = {};
            const settingsString = localStorage.getItem('clientSettings') as string;
            if (!settingsString) return;
            const loadedSettings = JSON.parse(settingsString);
            for (const [sectionKey, section] of Object.entries(settings)) {
                for (const [key, value] of Object.entries(section)) {
                    let settedValue = value;
                    if (sectionKey in loadedSettings && key in loadedSettings[sectionKey]) {
                        settedValue = loadedSettings[sectionKey][key];
                    }
                    if (!(sectionKey in newSettings)) newSettings[sectionKey] = {};
                    newSettings[sectionKey][key] = settedValue;
                }
            }
            dispatch(setSettings(newSettings));
        } catch {
            notification.error({
                message: 'Failed to load settings from local storage',
                className: 'cvat-notification-notice-load-settings-fail',
            });
        }
    }, []);

    const tabItem: TabsProps['items'] = [
        {
            key: 'player',
            label: 'Player',
            children: <PlayerSettingsContainer />,
        },
        {
            key: 'workspace',
            label: 'Workspace',
            children: <WorkspaceSettingsContainer />,
        },
        {
            key: 'design',
            label: 'Design',
            children: <DesignSettingsComponent />,
        },
    ];

    return (
        <Modal
            title='Settings'
            open={visible}
            onCancel={onClose}
            width={700}
            className='cvat-settings-modal'
            bodyStyle={{ backgroundColor: 'black' }}
            closeIcon={<CloseOutlined style={{ color: '#D0D0D8' }} />}
            footer={(
                <>
                    <Button className='cvat-close-settings-button' type='default' onClick={onClose}>
                        cancel
                    </Button>
                    <Tooltip title='Will save settings from this page and appearance settings on standard workspace page in browser'>
                        <Button className='cvat-save-settings-button' type='primary' onClick={onSaveSettings}>
                            OK
                        </Button>
                    </Tooltip>
                </>
            )}
        >
            <div className='cvat-settings-tabs'>
                <Tabs type='card' tabBarStyle={{ marginBottom: '0px' }} items={tabItem} />
            </div>
        </Modal>
    );
};

export default React.memo(SettingsModal);
