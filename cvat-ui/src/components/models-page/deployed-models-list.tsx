import React from 'react';
import { Row, Col } from 'antd/lib/grid';
import Table from 'antd/lib/table';
import Select from 'antd/lib/select';
import { Tag, Typography } from 'antd';
import { MLModel } from 'cvat-core-wrapper';

interface Props {
    models: MLModel[];
}

export default function DeployedModelsListComponent(props: Props): JSX.Element {
    const { models } = props;

    const columns = [
        {
            title: 'Framework',
            dataIndex: 'framework',
            key: 'framework',
            render: (framework: string): JSX.Element => (
                <Tag className='model-framework' color='processing'>{framework}</Tag>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string): JSX.Element => (
                <span className='model-name'>{name}</span>
            ),
        },
        {
            title: 'kind',
            dataIndex: 'kind',
            key: 'kind',
            render: (kind: string): JSX.Element => (
                <span className='model-kind'>{kind}</span>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description: string): JSX.Element => (
                <span style={{ color: 'white', fontWeight: 300 }}>{description}</span>
            ),
        },
        {
            title: 'Labels',
            dataIndex: 'labels',
            key: 'labels',
            render: (labels: any) => (
                <Select showSearch placeholder='Supported labels' style={{ width: '90%' }} value='Supported lables'>
                    {labels.map(
                        (label: string): JSX.Element => (
                            <Select.Option key={label} value={label}>
                                {label}
                            </Select.Option>
                        ),
                    )}
                </Select>
            ),
        },
    ];

    const data = models.map((model) => ({
        key: model.id,
        framework: model.framework,
        name: model.name,
        kind: model.kind,
        description: model.description,
        labels: model.labels,
    }));

    return (
        <>
            <Row justify='center' align='middle'>
                <Col md={24} lg={22} xl={22} xxl={16} className='cvat-models-list'>
                    <Typography.Text className='cvat-models-header'>
                        Models
                    </Typography.Text>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowClassName='cvat-models-table-row'
                        pagination={{ position: ['bottomCenter'] }}
                    />
                </Col>
            </Row>
        </>
    );
}
