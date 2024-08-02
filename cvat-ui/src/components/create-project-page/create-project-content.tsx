import React, {
    RefObject, useContext, useRef, useState, useEffect,
} from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import Switch from 'antd/lib/switch';
import Select from 'antd/lib/select';
import { Col, Row } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';
import Form, { FormInstance } from 'antd/lib/form';
import Button from 'antd/lib/button';
import Input, { InputRef } from 'antd/lib/input';
import notification from 'antd/lib/notification';

import patterns from 'utils/validation-patterns';
import LabelsEditor from 'components/labels-editor/labels-editor';
import { createProjectAsync } from 'actions/projects-actions';

const { Option } = Select;

function NameConfigurationForm(
    { formRef, inputRef }:
    { formRef: RefObject<FormInstance>, inputRef: RefObject<InputRef> },
):JSX.Element {
    return (
        <Form layout='horizontal' ref={formRef} labelCol={{ span: 4 }}>
            <Form.Item
                name='name'
                hasFeedback
                label='Name'
                rules={[
                    {
                        required: true,
                        message: 'Please, specify a name',
                    },
                ]}
            >
                <Input ref={inputRef} />
            </Form.Item>
        </Form>
    );
}

export default function CreateProjectContent(): JSX.Element {
    const [projectLabels, setProjectLabels] = useState<any[]>([]);
    const nameFormRef = useRef<FormInstance>(null);
    const nameInputRef = useRef<InputRef>(null);
    const advancedFormRef = useRef<FormInstance>(null);
    const dispatch = useDispatch();
    const history = useHistory();

    const resetForm = (): void => {
        if (nameFormRef.current) nameFormRef.current.resetFields();
        if (advancedFormRef.current) advancedFormRef.current.resetFields();
        setProjectLabels([]);
    };

    const focusForm = (): void => {
        nameInputRef.current?.focus();
    };

    const submit = async (): Promise<any> => {
        try {
            let projectData: Record<string, any> = {};
            if (nameFormRef.current) {
                const basicValues = await nameFormRef.current.validateFields();
                projectData = {
                    ...projectData,
                    name: basicValues.name,
                };
            }

            projectData.labels = projectLabels;

            const createdProject = await dispatch(createProjectAsync(projectData));
            return createdProject;
        } catch {
            return false;
        }
    };

    const onSubmitAndOpen = async (): Promise<void> => {
        const createdProject = await submit();
        if (createdProject) {
            history.push(`/projects/${createdProject.id}`);
        }
    };

    const onSubmitAndContinue = async (): Promise<void> => {
        const res = await submit();
        if (res) {
            resetForm();
            notification.info({
                message: 'The project has been created',
                className: 'cvat-notification-create-project-success',
            });
            focusForm();
        }
    };

    useEffect(() => {
        focusForm();
    }, []);

    return (
        <Row justify='start' align='middle' className='cvat-create-project-content'>
            <Row>
                <Col span={24}>
                    <NameConfigurationForm formRef={nameFormRef} inputRef={nameInputRef} />
                </Col>
            </Row>
            <Row>
                <Col span={4} style={{ textAlign: 'left' }}>
                    <Text className='cvat-text-color'>Labels:</Text>
                </Col>
                <Col span={20} className='cvat-create-project-content-label-editor'>
                    <LabelsEditor
                        labels={projectLabels}
                        onSubmit={(newLabels): void => {
                            setProjectLabels(newLabels);
                        }}
                    />
                </Col>
            </Row>
            <Row justify='center' gutter={5}>
                <Col>
                    <Button className='cvat-submit-open-project-button' type='primary' onClick={onSubmitAndOpen}>
                        Submit & Open
                    </Button>
                </Col>
                <Col>
                    <Button className='cvat-submit-continue-project-button' type='primary' onClick={onSubmitAndContinue}>
                        Submit & Continue
                    </Button>
                </Col>
            </Row>
        </Row>
    );
}
