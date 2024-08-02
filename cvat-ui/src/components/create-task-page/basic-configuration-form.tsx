import React, { RefObject } from 'react';
import Form, { FormInstance } from 'antd/lib/form';
import { Store } from 'antd/lib/form/interface';
import { Input, InputRef } from 'antd';
import Text from 'antd/lib/typography/Text';
import Tooltip from 'antd/lib/tooltip';

export interface BaseConfiguration {
    name: string;
}

interface Props {
    onChange(values: BaseConfiguration): void;
    many: boolean;
    exampleMultiTaskName?: string;
}

export default class BasicConfigurationForm extends React.PureComponent<Props> {
    private formRef: RefObject<FormInstance>;
    private inputRef: RefObject<InputRef>;
    private initialName: string;

    public constructor(props: Props) {
        super(props);
        this.formRef = React.createRef<FormInstance>();
        this.inputRef = React.createRef<InputRef>();

        const { many } = this.props;
        this.initialName = many ? '{{file_name}}' : '';
    }

    componentDidMount(): void {
        const { onChange } = this.props;
        onChange({
            name: this.initialName,
        });
    }

    private handleChangeName(e: React.ChangeEvent<HTMLInputElement>): void {
        const { onChange } = this.props;
        onChange({
            name: e.target.value,
        });
    }

    public submit(): Promise<void> {
        if (this.formRef.current) {
            return this.formRef.current.validateFields();
        }

        return Promise.reject(new Error('Form ref is empty'));
    }

    public resetFields(): void {
        if (this.formRef.current) {
            this.formRef.current.resetFields();
        }
    }

    public focus(): void {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }

    public render(): JSX.Element {
        return (
            <Form ref={this.formRef} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} labelAlign='left'>
                <Form.Item
                    hasFeedback
                    name='name'
                    label={<Text className='cvat-text-color'>name</Text>}
                    rules={[
                        {
                            required: true,
                            message: 'Task name cannot be empty',
                        },
                    ]}
                    initialValue={this.initialName}
                >
                    <Input ref={this.inputRef} onChange={(e) => this.handleChangeName(e)} />
                </Form.Item>
            </Form>
        );
    }
}
