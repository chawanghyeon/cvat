import './styles.scss';
import React, { useCallback } from 'react';
import Menu from 'antd/lib/menu';
import Modal from 'antd/lib/modal';
import Text from 'antd/lib/typography/Text';
import Icon, { LoadingOutlined } from '@ant-design/icons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MenuInfo } from 'rc-menu/lib/interface';

import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { AdminIcon, DataDownloadIcon, ExitIcon, IllustWarningIcon, ServerIcon, TrashGrayIcon } from 'icons';
import { DimensionType } from 'cvat-core-wrapper';
import { useTranslation } from 'react-i18next';

interface Props {
    taskID: number;
    projectID: number | null;
    taskMode: string;
    bugTracker: string;
    loaders: any[];
    dumpers: any[];
    inferenceIsActive: boolean;
    taskDimension: DimensionType;
    backupIsActive: boolean;
    onClickMenu: (params: MenuInfo) => void;
}

export enum Actions {
    LOAD_TASK_ANNO = 'load_task_anno',
    EXPORT_TASK_DATASET = 'export_task_dataset',
    DELETE_TASK = 'delete_task',
    RUN_AUTO_ANNOTATION = 'run_auto_annotation',
    MOVE_TASK_TO_PROJECT = 'move_task_to_project',
    OPEN_BUG_TRACKER = 'open_bug_tracker',
    BACKUP_TASK = 'backup_task',
}

function ActionsMenuComponent(props: Props): JSX.Element {
    const { taskID, projectID, inferenceIsActive, backupIsActive, onClickMenu } = props;
    const { t } = useTranslation();

    const onClickMenuWrapper = useCallback(
        (params: MenuInfo) => {
            if (!params) {
                return;
            }

            if (params.key === Actions.DELETE_TASK) {
                Modal.confirm({
                    title: `The task ${taskID} will be deleted`,
                    content: (
                        <div style={{ textAlign: 'center' }}>
                            <Icon component={IllustWarningIcon} />
                            <br />
                            <Text>All related data (images, annotations) will be lost. Continue?</Text>
                        </div>
                    ),
                    className: 'cvat-modal-confirm-delete-task',
                    onOk: () => {
                        onClickMenu(params);
                    },
                    okButtonProps: {
                        type: 'primary',
                        danger: true,
                    },
                    okText: 'Delete',
                });
            } else {
                onClickMenu(params);
            }
        },
        [taskID],
    );

    const menuItem: ItemType[] = [
        {
            key: Actions.LOAD_TASK_ANNO,
            title: 'Upload Annotations',
            label: t('tasks.actions.uploadAnnotation'),
            itemIcon: <Icon component={DataDownloadIcon} />,
        },
        {
            key: Actions.EXPORT_TASK_DATASET,
            title: 'Export Dataset',
            label: t('tasks.actions.exportDataset'),
            itemIcon: <Icon component={DataDownloadIcon} />,
        },
        {
            key: Actions.RUN_AUTO_ANNOTATION,
            title: 'Auto Annotation',
            label: t('tasks.actions.autoAnnotation'),
            disabled: inferenceIsActive,
            itemIcon: <Icon component={AdminIcon} />,
        },
        {
            key: Actions.BACKUP_TASK,
            title: 'Backup Task',
            label: t('tasks.actions.taskBackup'),
            disabled: backupIsActive,
            itemIcon: backupIsActive ? <LoadingOutlined /> : <Icon component={ServerIcon} />,
        },
        {
            key: Actions.MOVE_TASK_TO_PROJECT,
            title: 'Move Task to Project',
            label: t('tasks.actions.moveTaskToProject'),
            itemIcon: <Icon component={ExitIcon} />,
        },
        {
            key: Actions.DELETE_TASK,
            title: 'Delete Task',
            label: t('tasks.actions.deleteTask'),
            itemIcon: <Icon component={TrashGrayIcon} />,
        },
    ];

    // if (projectID === null) {
    //     menuItem.push(
    //         {
    //             key: Actions.MOVE_TASK_TO_PROJECT,
    //             title: 'Move Task to Project',
    //             label: 'Move Task to Project',
    //             itemIcon: <Icon component={ExitIcon} />,
    //         },
    //     );
    // }

    return <Menu selectable={false} className='cvat-actions-menu' onClick={onClickMenuWrapper} items={menuItem} />;
}

export default React.memo(ActionsMenuComponent);
