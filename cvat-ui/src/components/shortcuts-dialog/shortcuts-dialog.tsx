import Modal from 'antd/lib/modal';
import Table from 'antd/lib/table';
import React, { useEffect, useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import { shortcutsActions } from 'actions/shortcuts-actions';
import { CombinedState } from 'reducers';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';

interface StateToProps {
    visible: boolean;
    jobInstance: any;
}

interface DispatchToProps {
    switchShortcutsDialog(): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        shortcuts: { visibleShortcutsHelp: visible },
        annotation: {
            job: { instance: jobInstance },
        },
    } = state;

    return {
        visible,
        jobInstance,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        switchShortcutsDialog(): void {
            dispatch(shortcutsActions.switchShortcutsDialog());
        },
    };
}

function ShortcutsDialog(props: StateToProps & DispatchToProps): JSX.Element | null {
    const { t } = useTranslation();
    const { visible, switchShortcutsDialog, jobInstance } = props;
    const keyMap = useSelector((state: CombinedState) => state.shortcuts.keyMap);

    const splitToRows = (data: string[]): JSX.Element[] => data.map(
        (item: string, id: number): JSX.Element => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={id}>
                {item}
                <br />
            </span>
        ),
    );

    const columns = [
        {
            title: t('shortcut.columns.name'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('shortcut.columns.shortcut'),
            dataIndex: 'shortcut',
            key: 'shortcut',
            render: splitToRows,
        },
        {
            title: t('shortcut.columns.action'),
            dataIndex: 'action',
            key: 'action',
            render: splitToRows,
        },
        {
            title: t('shortcut.columns.description'),
            dataIndex: 'description',
            key: 'description',
        },
    ];

    const dimensionType = jobInstance?.dimension;
    const dataSource = useMemo(
        () => Object.keys(keyMap)
            .filter((key: string) => !dimensionType || keyMap[key].applicable.includes(dimensionType))
            .map((key: string, id: number) => ({
                key: id,
                name: t(`shortcut.${keyMap[key].tKey}.name`),
                description: t(`shortcut.${keyMap[key].tKey}.description`),
                shortcut: keyMap[key].sequences,
                action: [keyMap[key].action],
            })),
        [i18n, t, keyMap, dimensionType],
    );

    useEffect(() => {
        console.log('dataSource : ', dataSource);
    }, [dataSource]);

    useEffect(() => {
        console.log('i18n : ', i18n.language);
    }, [i18n]);
    return (
        <Modal
            title={t('shortcut.modal.title')}
            open={visible}
            closable={false}
            width={800}
            onOk={switchShortcutsDialog}
            cancelButtonProps={{ style: { display: 'none' } }}
            zIndex={1001} /* default antd is 1000 */
            className='cvat-shortcuts-modal-window'
        >
            <Table
                scroll={{ y: '45vh' }}
                dataSource={dataSource}
                columns={columns}
                className='cvat-shortcuts-modal-window-table'
            />
        </Modal>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutsDialog);
