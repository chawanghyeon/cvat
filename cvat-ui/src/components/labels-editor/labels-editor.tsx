import './styles.scss';
import React from 'react';
import Tabs, { TabsProps } from 'antd/lib/tabs';
import Text from 'antd/lib/typography/Text';
import ModalConfirm from 'antd/lib/modal/confirm';
import Icon from '@ant-design/icons';

import { SerializedLabel, SerializedAttribute } from 'cvat-core-wrapper';
import { IllustWarningIcon } from 'icons';
import RawViewer from './raw-viewer';
import ConstructorViewer from './constructor-viewer';
import ConstructorCreator from './constructor-creator';
import ConstructorUpdater from './constructor-updater';
import { idGenerator, LabelOptColor } from './common';

enum ConstructorMode {
    SHOW = 'SHOW',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
}

interface LabelsEditorProps {
    labels: SerializedLabel[];
    onSubmit: (labels: LabelOptColor[]) => void;
    hasProject?: boolean;
}

interface LabelsEditorState {
    constructorMode: ConstructorMode;
    creatorType: 'basic' | 'skeleton';
    savedLabels: LabelOptColor[];
    unsavedLabels: LabelOptColor[];
    labelForUpdate: LabelOptColor | null;
}

export default class LabelsEditor extends React.PureComponent<LabelsEditorProps, LabelsEditorState> {
    public constructor(props: LabelsEditorProps) {
        super(props);

        this.state = {
            savedLabels: [],
            unsavedLabels: [],
            constructorMode: ConstructorMode.SHOW,
            creatorType: 'basic',
            labelForUpdate: null,
        };
    }

    public componentDidMount(): void {
        // just need performe the same code
        this.componentDidUpdate((null as any) as LabelsEditorProps);
    }

    public componentDidUpdate(prevProps: LabelsEditorProps): void {
        function transformLabel(label: SerializedLabel): LabelOptColor {
            return {
                name: label.name,
                id: label.id || idGenerator(),
                color: label.color,
                type: label.type,
                sublabels: label.sublabels,
                svg: label.svg,
                attributes: label.attributes.map(
                    (attr: SerializedAttribute): SerializedAttribute => ({
                        id: attr.id || idGenerator(),
                        name: attr.name,
                        input_type: attr.input_type,
                        mutable: attr.mutable,
                        values: [...attr.values],
                        default_value: attr.values[0],
                    }),
                ),
            };
        }

        const { labels } = this.props;

        if (!prevProps || prevProps.labels !== labels) {
            const transformedLabels = labels.map(transformLabel);
            this.setState({
                savedLabels: transformedLabels.filter((label: LabelOptColor) => (label.id as number) >= 0),
                unsavedLabels: transformedLabels.filter((label: LabelOptColor) => (label.id as number) < 0),
            });
        }
    }

    private handleRawSubmit = (labels: LabelOptColor[]): void => {
        const unsavedLabels = [];
        const savedLabels = [];

        for (const label of labels) {
            if (label.id as number >= 0) {
                savedLabels.push(label);
            } else {
                unsavedLabels.push(label);
            }
        }

        this.setState({ unsavedLabels, savedLabels });
        this.handleSubmit(savedLabels, unsavedLabels);
    };

    private handleCreate = (label: LabelOptColor): void => {
        const { unsavedLabels, savedLabels } = this.state;
        const newUnsavedLabels = [
            ...unsavedLabels,
            {
                ...label,
                id: idGenerator(),
            },
        ];

        this.setState({ unsavedLabels: newUnsavedLabels });
        this.handleSubmit(savedLabels, newUnsavedLabels);
    };

    private handleUpdate = (label: LabelOptColor): void => {
        const { savedLabels, unsavedLabels } = this.state;

        const filteredSavedLabels = savedLabels.filter((_label: LabelOptColor) => _label.id !== label.id);
        const filteredUnsavedLabels = unsavedLabels.filter((_label: LabelOptColor) => _label.id !== label.id);
        if (label.id as number >= 0) {
            filteredSavedLabels.push(label);
            this.setState({
                savedLabels: filteredSavedLabels,
                constructorMode: ConstructorMode.SHOW,
            });
        } else {
            filteredUnsavedLabels.push(label);
            this.setState({
                unsavedLabels: filteredUnsavedLabels,
                constructorMode: ConstructorMode.SHOW,
            });
        }

        this.handleSubmit(filteredSavedLabels, filteredUnsavedLabels);
        this.setState({ constructorMode: ConstructorMode.SHOW });
    };

    private handlerCancel = (): void => {
        this.setState({ constructorMode: ConstructorMode.SHOW });
    };

    private handleDelete = (label: LabelOptColor): void => {
        const deleteLabel = (): void => {
            const { unsavedLabels, savedLabels } = this.state;

            const filteredUnsavedLabels = unsavedLabels
                .filter((_label: LabelOptColor): boolean => _label.id !== label.id);
            const filteredSavedLabels = savedLabels
                .filter((_label: LabelOptColor): boolean => _label.id !== label.id);

            this.setState({ savedLabels: filteredSavedLabels, unsavedLabels: filteredUnsavedLabels });
            this.handleSubmit(filteredSavedLabels, filteredUnsavedLabels);
        };

        if (typeof label.id !== 'undefined' && label.id >= 0) {
            ModalConfirm({
                className: 'cvat-modal-delete-label',
                title: `Do you want to delete "${label.name}" label?`,
                content: (
                    <div style={{ textAlign: 'center' }}>
                        <Icon component={IllustWarningIcon} />
                        <br />
                        <Text>
                            This action is irreversible. Annotation corresponding with this label will be deleted.
                        </Text>
                    </div>
                ),
                okButtonProps: {
                    type: 'primary',
                    danger: true,
                },
                onOk() {
                    deleteLabel();
                },
            });
        } else {
            deleteLabel();
        }
    };

    private handleSubmit(savedLabels: LabelOptColor[], unsavedLabels: LabelOptColor[]): void {
        function transformLabel(label: LabelOptColor): LabelOptColor {
            const transformed: any = {
                name: label.name,
                id: label.id as number < 0 ? undefined : label.id,
                color: label.color,
                type: label.type || 'any',
                attributes: label.attributes.map((attr: SerializedAttribute): SerializedAttribute => ({
                    name: attr.name,
                    id: attr.id as number < 0 ? undefined : attr.id,
                    input_type: attr.input_type.toLowerCase() as SerializedAttribute['input_type'],
                    default_value: attr.values[0],
                    mutable: attr.mutable,
                    values: [...attr.values],
                })),
            };

            if (label.type === 'skeleton') {
                transformed.svg = label.svg;
                transformed.sublabels = (label.sublabels || [])
                    .map((internalLabel: LabelOptColor) => transformLabel(internalLabel));
            }

            return transformed;
        }

        const { onSubmit } = this.props;
        const output = savedLabels.concat(unsavedLabels)
            .map((label: LabelOptColor): LabelOptColor => transformLabel(label));

        onSubmit(output);
    }

    public render(): JSX.Element {
        const { labels, hasProject } = this.props;
        const {
            savedLabels, unsavedLabels, constructorMode, labelForUpdate, creatorType,
        } = this.state;
        const savedAndUnsavedLabels = [...savedLabels, ...unsavedLabels];

        const tabItems: TabsProps['items'] = [
            {
                key: '1',
                label: (
                    <Text>Raw</Text>
                ),
                children: <RawViewer labels={savedAndUnsavedLabels} onSubmit={this.handleRawSubmit} />,
            },
            {
                key: '2',
                label: (
                    <Text>Constructor</Text>
                ),
                children: (
                    <>
                        {constructorMode === ConstructorMode.SHOW && (
                            <ConstructorViewer
                                labels={savedAndUnsavedLabels}
                                onUpdate={(label: LabelOptColor): void => {
                                    this.setState({
                                        constructorMode: ConstructorMode.UPDATE,
                                        labelForUpdate: label,
                                    });
                                }}
                                onDelete={this.handleDelete}
                                onCreate={(_creatorType: 'basic' | 'skeleton'): void => {
                                    this.setState({
                                        creatorType: _creatorType,
                                        constructorMode: ConstructorMode.CREATE,
                                    });
                                }}
                                visible={!hasProject}
                            />
                        )}
                        {constructorMode === ConstructorMode.UPDATE && labelForUpdate !== null && (
                            <ConstructorUpdater
                                label={labelForUpdate}
                                labelNames={labels.map((l) => l.name)}
                                onUpdate={this.handleUpdate}
                                onCancel={this.handlerCancel}
                            />
                        )}
                        {constructorMode === ConstructorMode.CREATE && (
                            <ConstructorCreator
                                creatorType={creatorType}
                                labelNames={labels.map((l) => l.name)}
                                onCreate={this.handleCreate}
                                onCancel={this.handlerCancel}
                            />
                        )}
                    </>
                ),
            },
        ];

        return (
            <div className='cvat-labels-editor'>
                <Tabs
                    defaultActiveKey='2'
                    type='card'
                    tabBarStyle={{ marginBottom: '0px' }}
                    className='cvat-labels-editor-tabs'
                    items={tabItems}
                />
            </div>
        );
    }
}
