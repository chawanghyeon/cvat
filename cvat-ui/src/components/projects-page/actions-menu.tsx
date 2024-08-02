import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'antd/lib/modal';
import Menu from 'antd/lib/menu';
import Icon, { LoadingOutlined } from '@ant-design/icons';
import { CombinedState } from 'reducers';
import { deleteProjectAsync } from 'actions/projects-actions';
import { exportActions } from 'actions/export-actions';
import { importActions } from 'actions/import-actions';
import Text from 'antd/lib/typography/Text';
// import { useHistory } from 'react-router';

import { TrashGrayIcon, DataDownloadIcon, EditIcon, ServerIcon, IllustWarningIcon } from 'icons';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useTranslation } from 'react-i18next';

interface Props {
    projectInstance: any;
}

export default function ProjectActionsMenuComponent(props: Props): JSX.Element {
    const { projectInstance } = props;
    const { t } = useTranslation();

    // const history = useHistory();
    const dispatch = useDispatch();
    const exportBackupIsActive = useSelector(
        (state: CombinedState) => state.export.projects.backup.current[projectInstance.id],
    );

    const onDeleteProject = useCallback((): void => {
        Modal.confirm({
            title: `The project ${projectInstance.id} will be deleted`,
            content: (
                <div style={{ textAlign: 'center' }}>
                    <Icon component={IllustWarningIcon} />
                    <br />
                    <Text>All related data (images, annotations) will be lost. Continue?</Text>
                </div>
            ),
            className: 'cvat-modal-confirm-remove-project',
            onOk: () => {
                dispatch(deleteProjectAsync(projectInstance));
            },
            okButtonProps: {
                type: 'primary',
                danger: true,
            },
            okText: 'Delete',
        });
    }, []);

    const menuItem: ItemType[] = [
        {
            key: 'export-dataset',
            title: 'Export Dataset',
            label: t('projects.actions.exportDataset'),
            itemIcon: <Icon component={DataDownloadIcon} className='cvat-project-actions-menu-icon' />,
            onClick: () => dispatch(exportActions.openExportDatasetModal(projectInstance)),
        },
        {
            key: 'import-dataset',
            title: 'Import Dataset',
            label: t('projects.actions.importDataset'),
            itemIcon: <Icon component={EditIcon} className='cvat-project-actions-menu-icon' />,
            onClick: () => dispatch(importActions.openImportDatasetModal(projectInstance)),
        },
        {
            key: 'backup',
            title: 'Backup',
            label: t('projects.actions.backup'),
            itemIcon: <Icon component={ServerIcon} className='cvat-project-actions-menu-icon' />,
            icon: exportBackupIsActive && <LoadingOutlined id='cvat-export-project-loading' />,
            onClick: () => dispatch(exportActions.openExportBackupModal(projectInstance)),
            disabled: exportBackupIsActive,
        },
        /* {
            key: 'set-webhooks',
            title: 'Setup webhooks',
            label: (
                <a
                    href={`/projects/${projectInstance.id}/webhooks`}
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        history.push({
                            pathname: `/projects/${projectInstance.id}/webhooks`,
                        });
                        return false;
                    }}
                >
                    Setup webhooks
                </a>
            ),
            itemIcon: <Icon component={ServerIcon} className='cvat-project-actions-menu-icon' />,
        }, */
        {
            key: 'delete',
            title: 'Delete',
            label: t('projects.actions.delete'),
            itemIcon: <Icon component={TrashGrayIcon} className='cvat-project-actions-menu-icon' />,
            onClick: onDeleteProject,
        },
    ];

    return <Menu selectable={false} className='cvat-project-actions-menu' items={menuItem} />;
}
