import React, { ReactPortal, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import { Row, Col } from 'antd/lib/grid';

import { reviewActions, finishIssueAsync } from 'actions/review-actions';
import { Store } from 'antd/lib/form/interface';
import { EnterIcon } from 'icons';
import { Canvas } from 'cvat-canvas/src/typescript/canvas';
import { CombinedState } from 'reducers';
import { useTranslation } from 'react-i18next';
import useShortcutDisable from 'hooks/useShortcutDisable';

interface FormProps {
    top: number;
    left: number;
    angle: number;
    scale: number;
    submit(message: string): void;
    cancel(): void;
    t: any;
}

function MessageForm(props: FormProps): JSX.Element {
    const { top, left, angle, scale, submit, cancel, t } = props;

    function handleSubmit(values: Store): void {
        submit(values.issue_description);
    }
    const canvasInstance = useSelector((state: CombinedState) => state.annotation.canvas.instance);

    useEffect(() => {
        if (canvasInstance instanceof Canvas) canvasInstance.fit();
    }, [top, left]);

    return (
        <Form
            className='cvat-create-issue-dialog'
            style={{ top, left, transform: `scale(${scale}) rotate(${angle}deg)` }}
            onFinish={(values: Store) => handleSubmit(values)}
        >
            <Form.Item
                name='issue_description'
                rules={[{ required: true, message: t('modal.Please, fill out the field') }]}
            >
                <Input autoComplete='off' placeholder={t('modal.Please, describe the issue')} suffix={<EnterIcon />} />
            </Form.Item>
            <Row justify='space-between'>
                <Col span={8}>
                    <Button onClick={cancel} type='default' className='cvat-create-issue-dialog-cancel-button'>
                        {t('confirm.cancel')}
                    </Button>
                </Col>
                <Col span={15} offset={1}>
                    <Button type='primary' htmlType='submit' className='cvat-create-issue-dialog-submit-button'>
                        {t('confirm.submit')}
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

interface Props {
    top: number;
    left: number;
    angle: number;
    scale: number;
}

export default function CreateIssueDialog(props: Props): ReactPortal {
    const dispatch = useDispatch();
    const { top, left, angle, scale } = props;
    const { t } = useTranslation();

    const diabled = useShortcutDisable(['h']);

    useEffect(() => {
        console.log('diabled : ', diabled);
    }, [diabled]);
    return ReactDOM.createPortal(
        <MessageForm
            top={top}
            left={left}
            angle={angle}
            scale={scale}
            submit={(message: string) => {
                dispatch(finishIssueAsync(message));
            }}
            cancel={() => {
                dispatch(reviewActions.cancelIssue());
            }}
            t={t}
        />,
        window.document.getElementById('cvat_canvas_attachment_board') as HTMLElement,
    );
}
